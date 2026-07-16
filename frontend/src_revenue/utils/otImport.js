// src_revenue/utils/otImport.js
// Parses biometric attendance reports (PDF or Excel) exported from the
// essl/ZKTeco "Daily Attendance Report (Detailed Summary Report)" and
// extracts per-employee daily In/Out punches. Only Date, In Time and
// Out Time are trusted — OT is always recomputed locally against CSRC
// office hours, since the biometric software's own OT/Work-Duration
// columns follow different shift rules (e.g. no OT credit for early
// arrival on normal working days).

import * as XLSX from 'xlsx';

const EMP_HEADER_RE = /Emp\s*Code\s*:?\s*(\d+)\s*Employee\s*Name\s*:?\s*(.+)/i;
// "17-Apr-2026 08:55 19:35 FS 10:00 17:45 ..." — times optional (absent days)
const DATA_LINE_RE = /(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{1,2}:\d{2})?\s*(\d{1,2}:\d{2})?\s*FS\b/;

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function normalizeName(name) {
  return String(name || '')
    .replace(/^(mr|mrs|ms|dr|tmt|thiru|selvi|smt)\.?\s+/i, '')
    .replace(/[.]/g, '')
    .trim()
    .toLowerCase();
}

// NEW: split into a set of word-tokens instead of one ordered string
function nameTokens(name) {
  return normalizeName(name).split(/\s+/).filter(Boolean);
}

// NEW: order-independent match — true if the smaller token set is
// fully contained in the larger one (handles "M Sridhar" vs "Sridhar M",
// and initials like single-letter tokens matching exactly).
function tokensMatch(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return false;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const [small, big] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  for (const t of small) {
    if (!big.has(t)) return false;
  }
  return true;
}

function toISODate(ddMonYyyy) {
  const [dd, mon, yyyy] = ddMonYyyy.split('-');
  const mm = MONTH_MAP[mon.toLowerCase()];
  if (!mm) return null;
  return `${yyyy}-${mm}-${dd.padStart(2, '0')}`;
}

// ---------------------------------------------------------------------
// Text-block parser — shared by PDF text and block-style Excel exports.
// Tracks the "current employee" via Emp Code headers and collects
// date/in/out triples under them.
// ---------------------------------------------------------------------
export function parseAttendanceText(fullText) {
  const lines = fullText.split(/\r?\n/);
  const employees = new Map();
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headerMatch = line.match(EMP_HEADER_RE);
    if (headerMatch) {
      const employeeCode = headerMatch[1].trim();
      const employeeName = headerMatch[2].trim();
      if (!employees.has(employeeCode)) {
        employees.set(employeeCode, { employeeCode, employeeName, records: new Map() });
      }
      current = employees.get(employeeCode);
      continue;
    }

    if (!current) continue;

    const dataMatch = line.match(DATA_LINE_RE);
    if (dataMatch) {
      const [, dateStr, inTime, outTime] = dataMatch;
      const iso = toISODate(dateStr);
      if (!iso) continue;
      // The report often repeats each day's row twice (visual table
      // order + re-sorted plain-text block) — keep the fuller version.
      const existing = current.records.get(iso);
      if (!existing || (!existing.inTime && inTime)) {
        current.records.set(iso, { date: iso, inTime: inTime || '', outTime: outTime || '' });
      }
    }
  }

  return Array.from(employees.values()).map((e) => ({
    employeeCode: e.employeeCode,
    employeeName: e.employeeName,
    records: Array.from(e.records.values()).sort((a, b) => a.date.localeCompare(b.date)),
  }));
}

// ---------------------------------------------------------------------
// PDF import — extracts raw text via pdfjs-dist, reconstructing line
// structure from text-fragment y-positions, then reuses the parser above.
// ---------------------------------------------------------------------
export async function parseAttendancePdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lineMap = new Map();
    content.items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push({ x: item.transform[4], text: item.str });
    });
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    sortedYs.forEach((y) => {
      const parts = lineMap.get(y).sort((a, b) => a.x - b.x);
      fullText += parts.map((p) => p.text).join(' ') + '\n';
    });
  }

  return parseAttendanceText(fullText);
}

// ---------------------------------------------------------------------
// Excel/CSV import — reads via SheetJS. Handles a flat table (Emp Code /
// Employee Name / Att. Date / InTime / OutTime columns) or the same
// block-style layout as the PDF text export.
// ---------------------------------------------------------------------
export async function parseAttendanceExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

  const employees = new Map();
  let current = null;
  let flatHeaderIdx = null;

  const findFlatHeader = (row) => {
    const idx = {};
    row.forEach((cell, i) => {
      const c = String(cell).trim().toLowerCase();
      if (c === 'emp code' || c === 'empcode') idx.empCode = i;
      if (c === 'employee name') idx.employeeName = i;
      if (c === 'att. date' || c === 'attendance date' || c === 'date') idx.date = i;
      if (c === 'intime' || c === 'in time') idx.inTime = i;
      if (c === 'outtime' || c === 'out time') idx.outTime = i;
    });
    return idx.date !== undefined && idx.inTime !== undefined ? idx : null;
  };

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const joined = row.join(' ').trim();
    if (!joined) continue;

    if (!flatHeaderIdx) {
      const maybe = findFlatHeader(row);
      if (maybe) flatHeaderIdx = maybe;
    }

    if (flatHeaderIdx && row[flatHeaderIdx.date]) {
      const dateCell = String(row[flatHeaderIdx.date]).trim();
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateCell) ? dateCell : toISODate(dateCell);
      if (iso) {
        const empCode = flatHeaderIdx.empCode !== undefined ? String(row[flatHeaderIdx.empCode]).trim() : 'unknown';
        const employeeName = flatHeaderIdx.employeeName !== undefined ? String(row[flatHeaderIdx.employeeName]).trim() : '';
        if (!employees.has(empCode)) {
          employees.set(empCode, { employeeCode: empCode, employeeName, records: new Map() });
        }
        const emp = employees.get(empCode);
        const inTime = flatHeaderIdx.inTime !== undefined ? String(row[flatHeaderIdx.inTime]).trim() : '';
        const outTime = flatHeaderIdx.outTime !== undefined ? String(row[flatHeaderIdx.outTime]).trim() : '';
        emp.records.set(iso, { date: iso, inTime, outTime });
        continue;
      }
    }

    const headerMatch = joined.match(EMP_HEADER_RE);
    if (headerMatch) {
      const employeeCode = headerMatch[1].trim();
      const employeeName = headerMatch[2].trim();
      if (!employees.has(employeeCode)) {
        employees.set(employeeCode, { employeeCode, employeeName, records: new Map() });
      }
      current = employees.get(employeeCode);
      continue;
    }
    if (current) {
      const dataMatch = joined.match(DATA_LINE_RE);
      if (dataMatch) {
        const [, dateStr, inTime, outTime] = dataMatch;
        const iso = toISODate(dateStr);
        if (iso) {
          current.records.set(iso, { date: iso, inTime: inTime || '', outTime: outTime || '' });
        }
      }
    }
  }

  return Array.from(employees.values()).map((e) => ({
    employeeCode: e.employeeCode,
    employeeName: e.employeeName,
    records: Array.from(e.records.values()).sort((a, b) => a.date.localeCompare(b.date)),
  }));
}

// ---------------------------------------------------------------------
// Matches parsed report employees to CSRC staff records by name.
// ---------------------------------------------------------------------
export function matchEmployeesToStaff(parsedEmployees, staffList, fullNameFn) {
  return parsedEmployees.map((pe) => {
    const targetTokens = nameTokens(pe.employeeName);
    const match = staffList.find((s) =>
      tokensMatch(targetTokens, nameTokens(fullNameFn(s)))
    );
    return { ...pe, matchedStaff: match || null };
  });
}