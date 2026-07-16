// src_revenue/utils/reportPdf.js
// ─────────────────────────────────────────────────────────────────────────
// Shared "Download Report" helper. Every View page builds a filtered row
// set + column list, then calls downloadTableReportPdf() to render a
// printable table off-screen and export it with html2pdf.js.
//
// Requires html2pdf.js to be installed: `npm install html2pdf.js`
// ─────────────────────────────────────────────────────────────────────────

function esc(v) {
  if (v === null || v === undefined) return '—';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// columns: [{ key, label, width? }]
// rows: array of plain objects keyed by column.key (already formatted strings)
// filterSummary: short string describing the filters applied, shown under the title
export async function downloadTableReportPdf({
  title,
  subtitle,
  filterSummary,
  columns,
  rows,
  filename,
  orientation = 'landscape',
  footerNote,
}) {
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = orientation === 'landscape' ? '1050px' : '760px';
  container.style.background = '#ffffff';
  container.style.padding = '28px';
  container.style.fontFamily = 'Arial, Helvetica, sans-serif';
  container.style.color = '#1a1a2e';

  const headRow = columns.map((c) => `<th style="border:1px solid #d0d0da;padding:7px 9px;background:#f2f2f7;text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.03em;">${esc(c.label)}</th>`).join('');
  const bodyRows = rows
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td style="border:1px solid #e2e2ea;padding:6px 9px;font-size:11px;">${esc(r[c.key])}</td>`).join('')}</tr>`
    )
    .join('');

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a2e;padding-bottom:12px;margin-bottom:16px;">
      <div>
        <div style="font-size:11px;letter-spacing:.08em;color:#6a6a80;font-weight:700;">ANNA UNIVERSITY · CSRC</div>
        <h1 style="margin:4px 0 2px;font-size:19px;">${esc(title)}</h1>
        ${subtitle ? `<div style="font-size:11.5px;color:#555;">${esc(subtitle)}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:10.5px;color:#777;">
        Generated ${new Date().toLocaleString('en-IN')}<br/>
        ${rows.length} record${rows.length === 1 ? '' : 's'}
      </div>
    </div>
    ${filterSummary ? `<div style="font-size:11px;color:#555;margin-bottom:12px;"><strong>Filters:</strong> ${esc(filterSummary)}</div>` : ''}
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${headRow}</tr></thead>
      <tbody>${bodyRows || `<tr><td style="padding:16px;color:#999;" colspan="${columns.length}">No records match the selected filters.</td></tr>`}</tbody>
    </table>
    ${footerNote ? `<div style="margin-top:16px;font-size:10.5px;color:#777;white-space:pre-line;">${esc(footerNote)}</div>` : ''}
  `;

  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: filename || 'report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}