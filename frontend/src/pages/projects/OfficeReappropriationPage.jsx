import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeReappropriationPage.css";
//import { useProjectContext } from "./ProjectContext";
import ProjectApprovalTransferCell, {
  getProfileSignature,
} from "./ProjectApprovalTransferCell";
import html2pdf from "html2pdf.js";
import axios from "axios";
/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => sessionStorage.getItem("userRole") || "assistant";
const userName = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("proceedings_user") || "{}");
    return (
      u.name ||
      u.username ||
      sessionStorage.getItem("userName") ||
      sessionStorage.getItem("username") ||
      "Office"
    );
  } catch {
    return (
      sessionStorage.getItem("userName") ||
      sessionStorage.getItem("username") ||
      "Office"
    );
  }
};

const staffIdentity = (staff) =>
  staff?.name || staff?.username || String(staff?.id || "");

const fmtAmt = (n) => {
  const num = parseFloat(n) || 0;
  return num ? `${num.toLocaleString("en-IN")}/-` : "-";
};

const normalizeReapRequest = (row = {}) => {
  const status = String(row.status || "").toUpperCase();
  const holderRole =
    status === "ASSIGNED"
      ? "assistant"
      : status === "ASSIGNED TO SUPERVISOR"
        ? "superintendent"
        : status === "ASSIGNED TO DIRECTOR"
          ? "director"
          : row.currentHolder?.role || "";

  return {
    ...row,
    id: row.id ?? row.reappropriation_id ?? row.request_id ?? row.proceedingNo,
    projectName: row.projectName ?? row.project_title ?? row.project_name ?? "",
    agency: row.agency ?? row.funding_agency ?? "",
    pi:
      row.pi ??
      (row.pi_name
        ? {
            name: row.pi_name,
            designation: row.pi_designation || row.pi_desig || "",
            department: row.pi_dept || "",
            campus: row.pi_campus || "",
          }
        : row.pi),
    submittedOn: row.submittedOn ?? row.created_at ?? row.createdAt ?? "",
    currentInstallmentNo:
      row.currentInstallmentNo ??
      row.installment ??
      row.current_installment_no ??
      "",
    status,
    currentHolder:
      row.currentHolder ||
      (row.assigned_to
        ? {
            name: row.assigned_to,
            role: holderRole,
          }
        : null),
  };
};

const reapTypeCandidates = (type) => {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();

  if (normalized === "with") {
    return ["with", "with installment", "with instalment"];
  }

  if (normalized === "without") {
    return ["without", "without installment", "without instalment"];
  }

  return normalized ? [normalized] : [""];
};
function numberToWords(n) {
  if (!n || isNaN(n)) return "";
  const num = Math.round(parseFloat(n));
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  }
  return convert(num) + " Only";
}
function calcDuration(startStr, endStr) {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start) || isNaN(end)) return "";
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  return parts.join(" ");
}
function fmtDateDMY(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date)) return String(d); // already formatted string, return as-is
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
const toNumberString = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : String(value);
};
const formatInstallmentLabel = (val) => {
  if (!val) return "";
  const str = String(val).trim();
  if (/instalment|installment/i.test(str)) return str;
  return `${str} Instalment`;
};
const parseMaybeJson = (value) => {
  if (!value || typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(value.replace(/^"+|"+$/g, ""));
    } catch {
      return null;
    }
  }
};

const normalizeReferenceList = (value) => {
  const parsed = Array.isArray(value) ? value : parseMaybeJson(value) || [];

  if (!Array.isArray(parsed)) return [];

  return parsed.map((ref, idx) => {
    if (typeof ref === "string") {
      return { no: idx + 1, text: ref };
    }

    return {
      no: ref?.no || idx + 1,
      text: ref?.text || ref?.reference || ref?.desc || "",
    };
  });
};

const sumAmountList = (items = [], keys = ["amount"]) =>
  (Array.isArray(items) ? items : []).reduce((total, item) => {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && value !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return total + parsed;
      }
    }
    return total;
  }, 0);

const parseBudgetArray = (value) =>
  Array.isArray(value)
    ? value
    : Array.isArray(parseMaybeJson(value))
      ? parseMaybeJson(value)
      : [];

const mapReapDetailRow = (row = {}, withInst = false) => ({
  fromHead: row.from_head || row.fromHead || "",
  toHead: row.to_head || row.toHead || "",
  amount: toNumberString(
    row.amount || row.reap_amount || row.installment_amount,
  ),
  head:
    row.head ||
    row.head_of_account ||
    row.account_head ||
    row.budget_head ||
    row.from_head ||
    row.name ||
    "",
  unspent: toNumberString(
    row.unspent ||
      row.unspent_amount ||
      row.available_amount ||
      row.before_reap ||
      row.amount ||
      row.balance,
  ),
  afterReap: toNumberString(
    row.after_reap ||
      row.after_reappropriation ||
      row.revised_amount ||
      row.to_amount ||
      row.balance_after,
  ),
  installmentAmount: withInst
    ? toNumberString(
        row.installment_amount ||
          row.installmentAmount ||
          row.current_installment_amount ||
          row.amount ||
          row.reap_amount,
      )
    : undefined,
});

const normalizeReapHistoryRow = (row = {}) => ({
  from:
    row.from ||
    row.assigned_from ||
    row.from_name ||
    row.assigned_from_name ||
    "",
  to: row.to || row.assigned_to || row.to_name || row.assigned_to_name || "",
  approved:
    row.approved !== undefined
      ? Boolean(row.approved)
      : String(row.action || "").toUpperCase() !== "TRANSFER",
  date: row.date || row.created_at || row.createdAt || row.action_date || "",
  action: row.action || "",
  remarks: row.remarks || "",
});
const normalizePreviousInstallment = (row = {}, idx = 0) => ({
  no:
    row.no ||
    row.instalment_no ||
    row.installment_no ||
    row.label ||
    row.name ||
    `Instalment ${idx + 1}`,
  amount: toNumberString(
    row.amount ||
      row.released_amount ||
      row.installment_amount ||
      row.instalment_amount,
  ),
  releasedDate:
    row.releasedDate || row.released_date || row.date || row.release_date || "",
  procNo:
    row.procNo ||
    row.proc_no ||
    row.sanction_proc_no ||
    row.sanction_proceedings_no ||
    row.proceedings_no ||
    "",
});
const buildReapDraftFromDetail = (summaryItem, payload, withInst = false) => {
  const request = payload?.request || {};
  const details = Array.isArray(payload?.details) ? payload.details : [];
  const extra =
    typeof request.extra_json === "string"
      ? parseMaybeJson(request.extra_json) || {}
      : request.extra_json || {};
  const references = normalizeReferenceList(request.references_json);
  const merged = normalizeReapRequest({ ...summaryItem, ...request });
  const recurringHeads = parseBudgetArray(
    extra.recurring_heads || extra.recurringHeads || request.recurring_heads,
  );
  const nonRecurringHeads = parseBudgetArray(
    extra.non_recurring_heads ||
      extra.nonRecurringHeads ||
      extra.nonRecurring ||
      request.non_recurring_heads,
  );
  const overheads = parseBudgetArray(
    extra.overheads || request.overheads || extra.overhead,
  );

  const requestPi =
    request.pi && typeof request.pi === "object" ? request.pi : null;
  merged.proceedingNo =
    request.proceeding_no || request.proceedingNo || merged.proceedingNo;
  merged.proceedingDate =
    request.proceeding_date || request.proceedingDate || merged.proceedingDate;
  merged.directorName =
    request.director_name || request.directorName || merged.directorName;
  merged.remarks = request.remarks || merged.remarks || "";
  merged.projectName =
    request.project_title || request.projectName || merged.projectName;
  merged.projectTitle =
    request.project_title || merged.projectTitle || merged.projectName;
  merged.agency = request.funding_agency || request.agency || merged.agency;
  merged.piName =
    request.pi_name || requestPi?.name || merged.piName || merged.pi?.name;
  merged.piDesig =
    request.pi_designation || requestPi?.designation || merged.piDesig || "";
  merged.piDept = request.pi_dept || requestPi?.department || merged.piDept;
  merged.piCampus = request.pi_campus || requestPi?.campus || merged.piCampus;
  merged.projectScheme =
    request.scheme ||
    extra.scheme ||
    extra.project_scheme ||
    extra.projectScheme ||
    request.projectScheme ||
    merged.projectScheme;
  const derivedTotalCost =
    sumAmountList(recurringHeads, ["amount", "total_amount"]) +
    sumAmountList(nonRecurringHeads, ["amount", "total_amount"]) +
    sumAmountList(overheads, ["total_overhead", "amount", "total_amount"]);
  merged.totalCost =
    request.project_total_amount ||
    request.total_cost ||
    request.totalCost ||
    derivedTotalCost ||
    merged.totalCost;
  merged.totalCostWords =
    request.total_cost_words ||
    extra.total_cost_words ||
    extra.totalCostWords ||
    request.totalCostWords ||
    merged.totalCostWords ||
    numberToWords(merged.totalCost);
  merged.startDate = fmtDateDMY(
    request.project_start_date || request.startDate || merged.startDate,
  );
  merged.endDate = fmtDateDMY(
    request.project_end_date || request.endDate || merged.endDate,
  );
  merged.duration =
    request.project_duration ||
    request.duration ||
    merged.duration ||
    (() => {
      const s = request.project_start_date;
      const e = request.project_end_date;
      if (!s || !e) return "";
      const start = new Date(s);
      const end = new Date(e);
      if (isNaN(start) || isNaN(end)) return "";
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const parts = [];
      if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
      if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
      if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
      return parts.join(" ");
    })();
  merged.submittedOn = fmtDateDMY(request.created_at || merged.submittedOn);
  merged.installment = request.installment || merged.installment || "";
  merged.sanction_reference_no =
    request.sanction_reference_no || merged.sanction_reference_no || "";
  merged.reapAmount =
    request.reap_amount ||
    extra.current_installment_amount ||
    request.reapAmount ||
    merged.reapAmount;
  merged.reapAmountWords =
    extra.current_installment_words ||
    request.reap_amount_words ||
    request.reapAmountWords ||
    merged.reapAmountWords ||
    numberToWords(merged.reapAmount);
  merged.reapFromHead =
    request.reap_from_head ||
    details[0]?.from_head ||
    merged.reapFromHead ||
    details[0]?.head ||
    merged.reapFromHead;
  merged.reapToHead =
    request.reap_to_head ||
    details[0]?.to_head ||
    details[details.length - 1]?.head ||
    merged.reapToHead;
  merged.reapRefCited =
    request.reap_ref_cited || request.reapRefCited || merged.reapRefCited;
  merged.mhNo = request.mh_no || request.mhNo || merged.mhNo;
  merged.sanctionRegVol =
    request.sanction_reg_vol || request.sanctionRegVol || merged.sanctionRegVol;
  merged.sanctionRegSl =
    request.sanction_reg_sl || request.sanctionRegSl || merged.sanctionRegSl;
  merged.sanctionRegPage =
    request.sanction_reg_page ||
    request.sanctionRegPage ||
    merged.sanctionRegPage;
  const rawPrevInstallments =
    extra.previous_installments ||
    extra.previousInstallments ||
    extra.previous_instalments ||
    extra.previousInstalments ||
    request.previous_installments ||
    request.previous_instalments ||
    null;

  const dbPrevInstallments = Array.isArray(payload?.previousInstallments)
    ? payload.previousInstallments
    : null;

  merged.previousInstallments =
    dbPrevInstallments && dbPrevInstallments.length > 0
      ? dbPrevInstallments.map((row, idx) => ({
          no: row.no || `Instalment ${idx + 1}`,
          amount: String(
            Math.round(parseFloat(row.amount || 0)).toLocaleString("en-IN"),
          ),
          releasedDate: fmtDateDMY(row.released_date),
          procNo: row.proc_no || "",
        }))
      : Array.isArray(rawPrevInstallments)
        ? rawPrevInstallments.map((row, idx) =>
            normalizePreviousInstallment(row, idx),
          )
        : merged.previousInstallments || [];
  merged.references =
    references.length > 0
      ? references
      : normalizeReferenceList(merged.references);
  merged.recurringHeads = recurringHeads;
  merged.nonRecurringHeads = nonRecurringHeads;
  merged.overheads = overheads;
  merged.transferHistory = Array.isArray(payload?.history)
    ? payload.history.map(normalizeReapHistoryRow)
    : Array.isArray(request.transferHistory)
      ? request.transferHistory.map(normalizeReapHistoryRow)
      : [];
  merged.status = String(request.status || merged.status || "").toUpperCase();
  merged.currentHolder = request.assigned_to
    ? {
        name: request.assigned_to,
        role:
          merged.status === "ASSIGNED"
            ? "assistant"
            : merged.status === "ASSIGNED TO SUPERVISOR"
              ? "superintendent"
              : merged.status === "ASSIGNED TO DIRECTOR"
                ? "director"
                : merged.currentHolder?.role || "",
      }
    : merged.currentHolder || null;

  if (withInst) {
    merged.extendedUpto =
      request.extended_upto || request.extendedUpto || merged.extendedUpto;
    merged.currentInstallmentNo =
      extra.current_installment_no ||
      request.current_installment_no ||
      request.currentInstallmentNo ||
      merged.currentInstallmentNo ||
      formatInstallmentLabel(request.installment);
    merged.currentInstallmentAmount =
      extra.current_installment_amount ||
      request.current_installment_amount ||
      request.currentInstallmentAmount ||
      merged.currentInstallmentAmount;
    merged.currentInstallmentWords =
      extra.current_installment_words ||
      request.current_installment_words ||
      request.currentInstallmentWords ||
      merged.currentInstallmentWords ||
      numberToWords(merged.currentInstallmentAmount);
    merged.pfmsRefNo =
      extra.pfms_ref_no ||
      request.pfms_ref_no ||
      request.pfmsRefNo ||
      merged.pfmsRefNo;
    merged.pfmsRefCited =
      extra.pfms_ref_cited ||
      request.pfms_ref_cited ||
      request.pfmsRefCited ||
      merged.pfmsRefCited;
    merged.bankName =
      extra.bank_name ||
      request.bank_name ||
      request.bankName ||
      merged.bankName;
    merged.tsa = extra.tsa || request.tsa || merged.tsa;
    merged.tsaRefCited =
      extra.tsa_ref_cited ||
      request.tsa_ref_cited ||
      request.tsaRefCited ||
      merged.tsaRefCited;
    merged.toDesig =
      extra.to_desig || request.to_desig || request.toDesig || merged.toDesig;
    merged.installmentHeads =
      details.length > 0
        ? details.map((row) => mapReapDetailRow(row, true))
        : merged.installmentHeads || [];
    merged.reapDetails = merged.installmentHeads;
  } else {
    merged.reapHeads =
      details.length > 0
        ? details.map((row) => mapReapDetailRow(row, false))
        : merged.reapHeads || [];
    merged.reapDetails = merged.reapHeads;
  }

  merged.budgetSnapshot = payload?.budgetSnapshot || null;
  merged.reportBudget = payload?.reportBudget || [];
  merged.directorName =
    request.director_name || request.directorName || merged.directorName;
  merged.directorSignature =
    payload?.directorSignature || merged.directorSignature || null;
  return merged;
};

/* ─── Default data — WITHOUT installment ─────────────────────────────────── */
function ensureReapShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo = base.proceedingNo || base.id || "CSRC/REAP/2026/001";
  base.proceedingDate = base.proceedingDate || "18-06-2026";
  base.directorName = base.directorName || "DIRECTOR, CSRC";
  base.remarks = base.remarks || "";
  base.transferHistory = base.transferHistory || [];

  base.projectName = base.projectName || "Development of Ti(C,N) based cermets";

  base.agency = base.agency || "SERB";

  base.piName =
    base.piName ||
    (typeof base.pi === "string"
      ? base.pi
      : base.pi?.name || "Dr. S. Balasivanandha Prabu");

  base.piDesig = base.piDesig || "Associate Professor";

  base.piDept =
    base.piDept || "Department of Information Science and Technology";

  base.piCampus = base.piCampus || "CEG Campus";

  base.projectScheme = base.projectScheme || "CRG";

  base.totalCost = base.totalCost || "2510000";

  base.totalCostWords =
    base.totalCostWords || numberToWords(base.totalCost) || "Twenty Five Lakh";

  base.startDate = fmtDateDMY(base.startDate) || "01-01-2025";
  base.endDate = fmtDateDMY(base.endDate) || "31-12-2027";

  base.duration =
    base.duration ||
    (() => {
      const s = base.startDate;
      const e = base.endDate;
      if (!s || !e) return "thirty six months";
      const start = new Date(s);
      const end = new Date(e);
      if (isNaN(start) || isNaN(end)) return "thirty six months";
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const parts = [];
      if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
      if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
      if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
      return parts.join(" ") || "thirty six months";
    })();

  base.reapAmount = base.reapAmount || "251000";

  base.reapAmountWords = base.reapAmountWords || "Two Lakh Fifty Thousand";

  base.reapFromHead = base.reapFromHead || "Manpower";

  base.reapToHead = base.reapToHead || "Contingency";

  base.reapRefCited = base.reapRefCited || "fourth";

  base.mhNo = base.mhNo || "M.H.No.15.1.34";

  base.expenditureNote = base.expenditureNote || "";

  base.sanctionRegVol = base.sanctionRegVol || "VIII";

  base.sanctionRegSl = base.sanctionRegSl || "124";

  base.sanctionRegPage = base.sanctionRegPage || "56";

  base.references =
    base.references?.length > 0
      ? base.references
      : [
          { no: 1, text: "Syndicate Resolution No.172.5.2 dt: 28.12.2005." },
          {
            no: 2,
            text: "SERB Sanction Order No.CRG/2025/101 dated 01-01-2025.",
          },
          { no: 3, text: "CSRC Proceedings No.101 dated 10-01-2025." },
          { no: 4, text: "PI Re-appropriation Request dated 15-06-2026." },
        ];

  base.previousInstallments =
    base.previousInstallments?.length > 0
      ? base.previousInstallments
      : [
          {
            no: "I Instalment",
            amount: "1251000",
            releasedDate: "15-03-2025",
            procNo: "CSRC/SERB/2025/101 Dt.15-03-2025",
          },
        ];

  base.reapHeads =
    base.reapHeads?.length > 0
      ? base.reapHeads
      : [
          {
            head: "Manpower",
            unspent: "510000",
            afterReap: "251000",
          },
          {
            head: "Contingency",
            unspent: "100000",
            afterReap: "351000",
          },
        ];

  return base;
}

/* ─── Default data — WITH installment ────────────────────────────────────── */
function ensureReapWithInstShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo = base.proceedingNo || base.id || "CSRC/REAP/2026/005";
  base.proceedingDate = base.proceedingDate || "18-06-2026";
  base.directorName = base.directorName || "DIRECTOR, CSRC";
  base.remarks = base.remarks || "";
  base.transferHistory = base.transferHistory || [];

  base.projectName = base.projectName || "Technology Enabling Centre";

  base.agency = base.agency || "DST";

  base.piName =
    base.piName ||
    (typeof base.pi === "string" ? base.pi : base.pi?.name || "Dr. R. Kumar");

  base.piDesig = base.piDesig || "Coordinator";

  base.piDept = base.piDept || "Technology Enabling Centre";

  base.piCampus = base.piCampus || "ACT Campus";

  base.projectScheme = base.projectScheme || "TEC";

  base.totalCost = base.totalCost || "4510000";

  base.totalCostWords = base.totalCostWords || "Forty Five Lakh";

  base.startDate = base.startDate || "01-04-2023";

  base.endDate = base.endDate || "31-03-2028";

  base.duration =
    base.duration ||
    (() => {
      const s = base.startDate;
      const e = base.endDate;
      if (!s || !e) return "thirty six months";
      const start = new Date(s);
      const end = new Date(e);
      if (isNaN(start) || isNaN(end)) return "thirty six months";
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const parts = [];
      if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
      if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
      if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
      return parts.join(" ") || "thirty six months";
    })();

  base.extendedUpto = base.extendedUpto || "31-03-2028";

  base.currentInstallmentNo = base.currentInstallmentNo || "IV Instalment";

  base.currentInstallmentAmount = base.currentInstallmentAmount || "2200000";

  base.currentInstallmentWords =
    base.currentInstallmentWords || "Twenty Two Lakh";

  base.pfmsRefNo = base.pfmsRefNo || "PFMS/2026/TEC/445";

  base.pfmsRefCited = base.pfmsRefCited || "fifth";

  base.bankName = base.bankName || "UNION BANK OF INDIA";

  base.tsa = base.tsa || "TSA-2026-445";

  base.tsaRefCited = base.tsaRefCited || "sixth";

  base.reapRefCited = base.reapRefCited || "seventh";

  base.toDesig = base.toDesig || "Coordinator";

  base.mhNo = base.mhNo || "M.H.No.21.4.55";

  base.sanctionRegVol = base.sanctionRegVol || "X";

  base.sanctionRegSl = base.sanctionRegSl || "212";

  base.sanctionRegPage = base.sanctionRegPage || "88";

  base.references =
    base.references?.length > 0
      ? base.references
      : [
          { no: 1, text: "Syndicate Resolution No.172.5.2 dt: 28.12.2005." },
          { no: 2, text: "DST Sanction Order TEC/2023/001." },
          { no: 3, text: "CSRC Proceedings dated 01-04-2023." },
          { no: 4, text: "Project Extension Order dated 01-04-2025." },
          { no: 5, text: "PFMS Release Advice dated 10-06-2026." },
          { no: 6, text: "TSA Request dated 12-06-2026." },
          { no: 7, text: "Reappropriation Request dated 14-06-2026." },
        ];

  base.previousInstallments =
    base.previousInstallments?.length > 0
      ? base.previousInstallments
      : [
          {
            no: "I Instalment",
            amount: "1000000",
            releasedDate: "15-01-2024",
            procNo: "CSRC/DST/2024/101",
          },
          {
            no: "II Instalment",
            amount: "1510000",
            releasedDate: "20-08-2024",
            procNo: "CSRC/DST/2024/225",
          },
          {
            no: "III Instalment",
            amount: "1800000",
            releasedDate: "12-03-2025",
            procNo: "CSRC/DST/2025/067",
          },
        ];

  base.installmentHeads =
    base.installmentHeads?.length > 0
      ? base.installmentHeads
      : [
          {
            head: "Manpower",
            unspent: "400000",
            installmentAmount: "900000",
          },
          {
            head: "Travel",
            unspent: "100000",
            installmentAmount: "251000",
          },
          {
            head: "Contingency",
            unspent: "151000",
            installmentAmount: "451000",
          },
          {
            head: "Training Program",
            unspent: "51000",
            installmentAmount: "600000",
          },
        ];
  base.directorSignature = base.directorSignature || null;
  return base;
}

/* ─── Shared UI primitives ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    ASSIGNED: {
      label: "Assigned",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    "ASSIGNED TO SUPERVISOR": {
      label: "With Superintendent",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    "ASSIGNED TO DIRECTOR": {
      label: "With Director",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    COMPLETED: {
      label: "Approved",
      bg: "#f0fdf4",
      color: "#15803d",
      dot: "#22c55e",
    },
  };
  const s = map[status] || {
    label: status,
    bg: "#f1f5f9",
    color: "#64748b",
    dot: "#94a3b8",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "999px",
        background: s.bg,
        color: s.color,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

function StageBadge({ role }) {
  const map = {
    superintendent: {
      label: "With Superintendent",
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    director: { label: "With Director", bg: "#fce7f3", color: "#be185d" },
    assistant: { label: "With Assistant", bg: "#dcfce7", color: "#15803d" },
  };
  const s = map[role] || { label: "Pending", bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "999px",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function StatsRow({ counts }) {
  const cards = [
    {
      label: "Total",
      value: counts.total,
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      label: "New Requests",
      value: counts.new,
      color: "#b45309",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      label: "Transferred",
      value: counts.transferred,
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      label: "Completed",
      value: counts.completed,
      color: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: "14px",
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            {c.label}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: c.color,
              marginTop: "4px",
              lineHeight: 1,
            }}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function TransferTimeline({ item }) {
  const history = item.transferHistory || [];
  if (!history.length)
    return (
      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
          padding: "28px 0",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px dashed #cbd5e1",
        }}
      >
        No transfer history yet.
      </div>
    );
  return (
    <div style={{ padding: "8px 0" }}>
      {history.map((entry, i) => {
        const toName = typeof entry.to === "object" ? entry.to?.name : entry.to;
        const toRole = typeof entry.to === "object" ? entry.to?.role : null;
        const fromName =
          typeof entry.from === "object" ? entry.from?.name : entry.from;
        const ok = entry.approved;
        return (
          <div
            key={i}
            style={{ display: "flex", gap: "12px", marginBottom: "14px" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "28px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  flexShrink: 0,
                  background: ok ? "#dcfce7" : "#dbeafe",
                  color: ok ? "#16a34a" : "#2563eb",
                  border: `2px solid ${ok ? "#16a34a" : "#2563eb"}`,
                }}
              >
                {ok ? "✔" : "↪"}
              </div>
              {i < history.length - 1 && (
                <div
                  style={{
                    width: "2px",
                    flex: 1,
                    background: "#e2e8f0",
                    marginTop: "4px",
                    minHeight: "14px",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: "4px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginBottom: "2px",
                }}
              >
                {entry.date}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {fromName}
                </span>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>→</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {toName}
                </span>
                {toRole && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 7px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      background:
                        toRole === "superintendent"
                          ? "#dbeafe"
                          : toRole === "director"
                            ? "#fce7f3"
                            : "#dcfce7",
                      color:
                        toRole === "superintendent"
                          ? "#1d4ed8"
                          : toRole === "director"
                            ? "#be185d"
                            : "#15803d",
                    }}
                  >
                    {toRole}
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  padding: "2px 9px",
                  borderRadius: "999px",
                  display: "inline-block",
                  background: ok ? "#f0fdf4" : "#eff6ff",
                  color: ok ? "#16a34a" : "#2563eb",
                  border: `1px solid ${ok ? "#bbf7d0" : "#bfdbfe"}`,
                }}
              >
                {ok
                  ? "✔ Approved & Forwarded"
                  : "↪ Forwarded (Pending Approval)"}
              </div>
            </div>
          </div>
        );
      })}
      {item.currentHolder ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              background: "#fef9c3",
              color: "#ca8a04",
              border: "2px solid #ca8a04",
            }}
          >
            ⏳
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#92400e",
              fontWeight: 500,
              paddingTop: "4px",
            }}
          >
            Waiting for <strong>{item.currentHolder?.name}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              background: "#dcfce7",
              color: "#16a34a",
              border: "2px solid #16a34a",
            }}
          >
            ✔
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#15803d",
              fontWeight: 500,
              paddingTop: "4px",
            }}
          >
            Process Completed — Fully Approved
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Section heading ─────────────────────────────────────────────────────── */
const SH = ({ children, extra }) => (
  <h3
    style={{
      fontSize: "13px",
      fontWeight: 700,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      margin: "0 0 12px",
      paddingBottom: "8px",
      borderBottom: "2px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>{children}</span>
    {extra && <span>{extra}</span>}
  </h3>
);

/* ─── Edit field ──────────────────────────────────────────────────────────── */
const EF = ({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  span,
  rows,
}) => (
  <div style={span ? { gridColumn: "1 / -1" } : {}}>
    <label
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: "#94a3b8",
        textTransform: "uppercase",
        display: "block",
        marginBottom: "4px",
      }}
    >
      {label}
    </label>
    {rows ? (
      <textarea
        disabled={disabled}
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          fontSize: "13px",
          border: "1px solid #e2e8f0",
          background: disabled ? "#f8fafc" : "#fff",
          color: "#1e293b",
          boxSizing: "border-box",
          outline: "none",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    ) : (
      <input
        type={type}
        disabled={disabled}
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          fontSize: "13px",
          border: "1px solid #e2e8f0",
          background: disabled ? "#f8fafc" : "#fff",
          color: "#1e293b",
          boxSizing: "border-box",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    )}
  </div>
);

/* ─── References editor ───────────────────────────────────────────────────── */
function RefEditor({ refs, fe, onChange }) {
  const patch = (i, val) =>
    onChange(
      normalizeReferenceList(refs).map((r, idx) =>
        idx === i ? { ...r, text: val } : r,
      ),
    );
  const add = () =>
    onChange([
      ...normalizeReferenceList(refs),
      { no: normalizeReferenceList(refs).length + 1, text: "" },
    ]);
  const del = (i) =>
    onChange(
      normalizeReferenceList(refs)
        .filter((_, idx) => idx !== i)
        .map((r, ix) => ({ ...r, no: ix + 1 })),
    );
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {normalizeReferenceList(refs).map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "8px 14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <span
            style={{
              color: "#94a3b8",
              fontWeight: 700,
              minWidth: "20px",
              fontSize: "12px",
              paddingTop: "6px",
            }}
          >
            {r.no}.
          </span>
          {fe ? (
            <>
              <textarea
                value={r.text}
                onChange={(e) => patch(i, e.target.value)}
                rows={2}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  background: "#fff",
                  color: "#1e293b",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
              <button
                onClick={() => del(i)}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  cursor: "pointer",
                  marginTop: "2px",
                }}
              >
                ✕
              </button>
            </>
          ) : (
            <span
              style={{ fontSize: "12px", color: "#374151", paddingTop: "4px" }}
            >
              {r.text || <em style={{ color: "#cbd5e1" }}>—</em>}
            </span>
          )}
        </div>
      ))}
      {fe && (
        <div style={{ padding: "10px 14px" }}>
          <button
            onClick={add}
            style={{
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ➕ Add Reference
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Previous instalments editor ────────────────────────────────────────── */
function PrevInstEditor({ insts, fe, onChange }) {
  const patch = (i, p) =>
    onChange(insts.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  const add = () =>
    onChange([...insts, { no: "", amount: "", releasedDate: "", procNo: "" }]);
  const del = (i) => onChange(insts.filter((_, idx) => idx !== i));
  const inp = (val, onCh, ph) =>
    fe ? (
      <input
        value={val || ""}
        onChange={(e) => onCh(e.target.value)}
        placeholder={ph}
        style={{
          width: "100%",
          padding: "5px 7px",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          fontSize: "12px",
          background: "#fff",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    ) : (
      <span style={{ fontSize: "12px", color: "#374151" }}>{val}</span>
    );
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
      >
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {[
              "Sl.",
              "Instalment",
              "Amount (₹)",
              "Released Date",
              "Sanction Proc. No. & Date",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {h}
              </th>
            ))}
            {fe && (
              <th
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              ></th>
            )}
          </tr>
        </thead>
        <tbody>
          {insts.map((inst, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td
                style={{ padding: "8px 14px", color: "#94a3b8", width: "32px" }}
              >
                {i + 1}
              </td>
              <td style={{ padding: "8px" }}>
                {inp(inst.no, (v) => patch(i, { no: v }), "e.g. I Instalment")}
              </td>
              <td style={{ padding: "8px" }}>
                {inp(
                  inst.amount,
                  (v) => patch(i, { amount: v }),
                  "e.g. 22,75,400",
                )}
              </td>
              <td style={{ padding: "8px" }}>
                {inp(
                  inst.releasedDate,
                  (v) => patch(i, { releasedDate: v }),
                  "PFMS Portal / Date",
                )}
              </td>
              <td style={{ padding: "8px" }}>
                {inp(inst.procNo, (v) => patch(i, { procNo: v }), "No. & Date")}
              </td>
              {fe && (
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => del(i)}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      borderRadius: "6px",
                      padding: "4px 7px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </td>
              )}
            </tr>
          ))}
          {insts.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                No previous instalments
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {fe && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={add}
            style={{
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ➕ Add Instalment
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Shared modal shell ──────────────────────────────────────────────────── */
function ModalShell({
  title,
  draft,
  tab,
  setTab,
  isEditing,
  setIsEditing,
  editable,
  onClose,
  downloadPDF,
  children,
}) {
  const holderRole = draft.currentHolder?.role;
  const isCompleted = !draft.currentHolder && draft.transferHistory?.length > 0;
  const sc = {
    superintendent: { bg: "#dbeafe", color: "#1d4ed8" },
    director: { bg: "#fce7f3", color: "#be185d" },
    assistant: { bg: "#dcfce7", color: "#15803d" },
  }[holderRole] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "16px",
          width: "min(980px, 96vw)",
          height: "calc(100vh - 32px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            background: "#1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.3,
                maxWidth: "640px",
              }}
            >
              {draft.projectName}
            </div>
            {draft.currentHolder ? (
              <div style={{ marginTop: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: sc.bg,
                    color: sc.color,
                  }}
                >
                  {holderRole === "superintendent"
                    ? "🔵"
                    : holderRole === "director"
                      ? "🔴"
                      : "🟢"}{" "}
                  Currently with {draft.currentHolder?.name} ({holderRole})
                </span>
              </div>
            ) : (
              isCompleted && (
                <div style={{ marginTop: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "#dcfce7",
                      color: "#15803d",
                    }}
                  >
                    ✔ Completed
                  </span>
                </div>
              )
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {editable && tab === "details" && !isEditing && (
              <button
                style={{
                  background: "#2563eb",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 13px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </button>
            )}
            {tab === "report" && (
              <button
                onClick={downloadPDF}
                style={{
                  background: "#16a34a",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 13px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                📄 Download PDF
              </button>
            )}
            <button
              style={{
                background: "#ef4444",
                border: "none",
                color: "#fff",
                borderRadius: "8px",
                padding: "6px 13px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
              }}
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "0 20px",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          {[
            ["details", "📋 Full Details & Tracking"],
            ["report", "📄 Proceedings Report"],
          ].map(([k, l]) => (
            <button
              key={k}
              style={{
                padding: "12px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                color: tab === k ? "#1d4ed8" : "#64748b",
                borderBottom:
                  tab === k ? "3px solid #1d4ed8" : "3px solid transparent",
              }}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>
        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            background: tab === "report" ? "#e5e7eb" : "#f8fafc",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT A — Without Installment
   Matches Image 1 & 2 exactly:
   Sub | Ref list | ***** | Para1 (project sanction) | Para2 (prev inst) |
   Inst table | Para3 (reap request) | Para4 (sanction accorded) |
   3-col reap table | Expenditure note | Sanction register | Signature | To | Copy to
═══════════════════════════════════════════════════════════════════════════ */
function ReportWithout({ draft }) {
  const P = {
    fontFamily: "Times New Roman, serif",
    fontSize: "11pt",
    color: "#000",
  };
  const th = {
    border: "1px solid #000",
    padding: "5px 8px",
    textAlign: "center",
    fontWeight: "bold",
    background: "#fff",
  };
  const td = { border: "1px solid #000", padding: "5px 8px" };
  const tdR = {
    border: "1px solid #000",
    padding: "5px 8px",
    textAlign: "right",
  };
  const tdC = {
    border: "1px solid #000",
    padding: "5px 8px",
    textAlign: "center",
  };
  const J = { textAlign: "justify", marginBottom: "10px", lineHeight: "1.6" };
  const B = { fontWeight: "bold" };

  const budgetRows = draft.reportBudget || [];

  const totalUnspent = budgetRows.reduce(
    (s, h) => s + (parseFloat(h.original) || 0),
    0,
  );

  const totalAfter = budgetRows.reduce(
    (s, h) => s + (parseFloat(h.revised) || 0),
    0,
  );

  return (
    <div
      style={{
        width: "210mm",
        background: "#fff",
        margin: "0 auto",
        padding: "14mm 16mm",
        boxSizing: "border-box",
        ...P,
      }}
    >
      {/* Letterhead */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ ...B, fontSize: "13pt" }}>
          Centre for Sponsored Research and Consultancy (CSRC)
        </div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={B}>Proceedings No.{draft.proceedingNo}</div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={{ marginBottom: "10px", lineHeight: "1.6" }}>
        <span style={B}>Sub: </span>Anna University – {draft.agency || "——"}{" "}
        Project – {draft.projectScheme ? `${draft.projectScheme} –` : ""} "
        {draft.projectName || "——"}" by {draft.piName || "——"} –
        Re-appropriation – Sanction – Accorded
      </div>

      {/* Ref */}
      {(draft.references || []).length > 0 && (
        <div style={{ marginBottom: "10px", lineHeight: "1.7" }}>
          <span style={B}>Ref: </span>
          {draft.references.map((r, i) => (
            <div key={i} style={{ paddingLeft: i === 0 ? "0" : "32px" }}>
              {r.no}. {r.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", margin: "10px 0" }}>* * * * *</div>

      {/* Para 1 — project sanctioned */}
      <div style={J}>
        The {draft.agency || "funding agency"} has sanctioned a project entitled{" "}
        <span style={B}>"{draft.projectName || "——"}"</span>{" "}
        {draft.projectScheme ? (
          <>
            under <span style={B}>"{draft.projectScheme}"</span>{" "}
          </>
        ) : (
          ""
        )}
        to{" "}
        <span style={B}>
          {draft.piName || "——"}, {draft.piDesig || "——"},{" "}
          {draft.piDept || "——"}, {draft.piCampus || "——"}
        </span>
        , as the Principal Investigator for the period of{" "}
        <span style={B}>{draft.duration}</span> from{" "}
        <span style={B}>{draft.startDate || "——"}</span> to{" "}
        <span style={B}>{draft.endDate || "——"}</span> at a total cost of{" "}
        <span style={B}>
          Rs.{draft.totalCost || "——"}/- ({draft.totalCostWords || "——"})
        </span>{" "}
        vide reference second cited above.
      </div>

      {/* Para 2 — previous instalments */}
      {(draft.previousInstallments || []).length > 0 && (
        <>
          <div style={J}>
            Further, a sum of{" "}
            <span style={B}>
              Rs.
              {draft.previousInstallments
                .map((i) => i.amount)
                .filter(Boolean)
                .join(" + ") || "——"}
              /-{" "}
            </span>
            has already been allotted by the funding agency and the necessary
            sanction proceedings was issued for the implementation of the above
            said project, as per the details given below:
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "12px",
              fontSize: "10.5pt",
            }}
          >
            <thead>
              <tr>
                {[
                  "Sl.No.",
                  "Instalment",
                  "Amount (Rs.)",
                  "Released Date",
                  "Sanction Proceedings No.&Date",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.previousInstallments.map((inst, i) => (
                <tr key={i}>
                  <td style={tdC}>{i + 1}</td>
                  <td style={td}>{inst.no}</td>
                  <td style={tdR}>{inst.amount ? `${inst.amount}/-` : "—"}</td>
                  <td style={tdC}>{inst.releasedDate || "—"}</td>
                  <td style={td}>{inst.procNo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Para 3 — reap request */}
      <div style={J}>
        In the reference {draft.reapRefCited || "fourth"} cited above,{" "}
        {draft.piName || "——"}, Principal Investigator of the Project, has
        requested to accord sanction for reappropriation to the tune of Rs.
        {draft.reapAmount || "——"}/- ({draft.reapAmountWords || "——"}) from "
        {draft.reapFromHead || "——"}" head to "{draft.reapToHead || "——"}" head
        of the above mentioned project.
      </div>

      {/* Para 4 — sanction accorded */}
      <div style={J}>
        Accordingly, and as per the powers delegated reference first cited
        above, an administrative sanction is hereby accorded for re-appropriate
        a sum of{" "}
        <span style={B}>
          Rs.{draft.reapAmount || "——"}/- ({draft.reapAmountWords || "——"})
        </span>{" "}
        available funds from "{draft.reapFromHead || "——"}" head to "
        {draft.reapToHead || "——"}" head as detailed below.
      </div>

      {/* Main 4-col reap table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "12px",
          fontSize: "10.5pt",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Sl. No.</th>
            <th style={th}>Head of Account</th>
            <th style={th}>Original Amount (Rs.)</th>

            <th style={th}>Amount after Re-appropriation (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {budgetRows.map((h, i) => (
            <tr key={i}>
              <td style={tdC}>{i + 1}</td>
              <td style={td}>{h.head}</td>
              <td style={tdR}>{h.original ? fmtAmt(h.original) : "—"}</td>
              <td style={tdR}>{h.revised ? fmtAmt(h.revised) : "—"}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td colSpan={2} style={{ ...td, textAlign: "right" }}>
              Total Amount
            </td>
            <td style={tdR}>{totalUnspent ? fmtAmt(totalUnspent) : "—"}</td>
            <td style={tdR}>{totalAfter ? fmtAmt(totalAfter) : "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Expenditure note */}
      <div style={J}>
        {draft.expenditureNote ||
          `The expenditure for the above project will be debitable to ${draft.mhNo || "M.H.No.——"} – ${draft.agency || "——"} Project "${draft.projectName || "——"}" by ${draft.piName || "——"}, ${draft.piDesig || "——"}, ${draft.piDept || "——"}, ${draft.piCampus || "——"}.`}
      </div>

      {/* Sanction register */}
      {(draft.sanctionRegVol || draft.sanctionRegSl) && (
        <div style={{ ...J, marginBottom: "24px" }}>
          The above sanction has been entered in the Project Sanction Register
          Vol – {draft.sanctionRegVol} C vide Sl.No.{draft.sanctionRegSl} at
          Page No.{draft.sanctionRegPage}.
        </div>
      )}

      {/* Signature */}
      <div
        style={{ textAlign: "right", marginBottom: "28px", marginTop: "24px" }}
      >
        {draft.status === "COMPLETED" && draft.directorSignature ? (
          <img
            src={
              draft.directorSignature.startsWith("http")
                ? draft.directorSignature
                : `http://localhost:5100/${draft.directorSignature.replace(/^\/+/, "")}`
            }
            alt="Director Signature"
            style={{
              height: "48px",
              objectFit: "contain",
              marginBottom: "6px",
            }}
          />
        ) : (
          <div style={{ marginBottom: "40px" }}></div>
        )}
        <div style={B}>{draft.directorName || "DIRECTOR, CSRC"}</div>
      </div>

      {/* To */}
      <div style={{ marginBottom: "14px" }}>
        <div style={B}>To</div>
        <div>The Professor and Head,</div>
        <div>{draft.piDept || "——"},</div>
        <div>{draft.piCampus || "——"},</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div>
        <div style={B}>Copy to:</div>
        <div>
          1. {draft.piName || "——"}, {draft.piDesig || "——"},{" "}
          {draft.piDept || "——"}, {draft.piCampus || "——"} – PI
        </div>
        <div>2. CSRC – 3</div>
        <div>3. CSRC – 4</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT B — With Installment
   Matches Image 3 exactly:
   Sub | Ref list | ***** | Para1 | Para2 (prev inst table) |
   Para3 (new inst PFMS) | Para4 (TSA + reap request) |
   Para5 (sanction accorded) | 6-col table |
   Expenditure note | Sanction register | Signature | To | Copy to
═══════════════════════════════════════════════════════════════════════════ */
function ReportWith({ draft }) {
  const P = {
    fontFamily: "Times New Roman, serif",
    fontSize: "11pt",
    color: "#000",
  };
  const th = {
    border: "1px solid #000",
    padding: "5px 7px",
    textAlign: "center",
    fontWeight: "bold",
    background: "#fff",
    fontSize: "9.5pt",
  };
  const td = { border: "1px solid #000", padding: "5px 7px", fontSize: "10pt" };
  const tdR = {
    border: "1px solid #000",
    padding: "5px 7px",
    textAlign: "right",
    fontSize: "10pt",
  };
  const tdC = {
    border: "1px solid #000",
    padding: "5px 7px",
    textAlign: "center",
    fontSize: "10pt",
  };
  const J = { textAlign: "justify", marginBottom: "10px", lineHeight: "1.6" };
  const B = { fontWeight: "bold" };

  const heads = draft.installmentHeads || [];
  const totalUnspent = heads.reduce(
    (s, h) => s + (parseFloat(h.unspent) || 0),
    0,
  );
  const totalInst = heads.reduce(
    (s, h) => s + (parseFloat(h.installmentAmount) || 0),
    0,
  );
  const totalAvail = heads.reduce(
    (s, h) =>
      s + (parseFloat(h.unspent) || 0) + (parseFloat(h.installmentAmount) || 0),
    0,
  );
  // "after reap" = total (reappropriation shifts within same total pool)
  const totalAfter = totalAvail;

  return (
    <div
      style={{
        width: "210mm",
        background: "#fff",
        margin: "0 auto",
        padding: "14mm 16mm",
        boxSizing: "border-box",
        ...P,
      }}
    >
      {/* Letterhead */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ ...B, fontSize: "13pt" }}>
          Centre for Sponsored Research and Consultancy (CSRC)
        </div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={B}>Proceedings No.{draft.proceedingNo}</div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={{ marginBottom: "10px", lineHeight: "1.6" }}>
        <span style={B}>Sub: </span>Anna University – {draft.agency || "——"}{" "}
        Project – {draft.projectScheme ? `${draft.projectScheme} –` : ""} "
        {draft.projectName || "——"}" by {draft.piName || "——"} –{" "}
        {draft.currentInstallmentNo} &amp; Re-appropriation – Administrative
        sanction – Accorded
      </div>

      {/* Ref */}
      {(draft.references || []).length > 0 && (
        <div style={{ marginBottom: "10px", lineHeight: "1.7" }}>
          <span style={B}>Ref: </span>
          {draft.references.map((r, i) => (
            <div key={i} style={{ paddingLeft: i === 0 ? "0" : "32px" }}>
              {r.no}. {r.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", margin: "10px 0" }}>* * * * *</div>

      {/* Para 1 — project sanctioned */}
      <div style={J}>
        The {draft.agency || "funding agency"} has sanctioned a project entitled{" "}
        <span style={B}>"{draft.projectName || "——"}"</span>{" "}
        {draft.projectScheme ? (
          <>
            under <span style={B}>"{draft.projectScheme}"</span>{" "}
          </>
        ) : (
          ""
        )}
        to <span style={B}>{draft.piName || "——"}</span>,{" "}
        {draft.piDesig || "——"}, {draft.piDept || "——"},{" "}
        {draft.piCampus || "——"}, as the Principal Investigator for the period
        of {draft.duration} from{" "}
        <span style={B}>{draft.startDate || "——"}</span> to{" "}
        <span style={B}>{draft.endDate || "——"}</span>.
        {draft.extendedUpto
          ? ` Further the funding agency has extended the duration of the project period upto ${draft.extendedUpto}.`
          : ""}
      </div>

      {/* Para 2 — previous instalments */}
      {(draft.previousInstallments || []).length > 0 && (
        <>
          <div style={J}>
            Further, a sum of{" "}
            <span style={B}>
              Rs.{draft.totalCost || "——"}/- ({draft.totalCostWords || "——"})
            </span>{" "}
            has already been released by the funding agency and the necessary
            sanction proceedings were issued for the implementation of the above
            said project, as per the details given below:
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "12px",
              fontSize: "10.5pt",
            }}
          >
            <thead>
              <tr>
                {[
                  "Sl.No.",
                  "Instalment",
                  "Amount (Rs.)",
                  "Released Date",
                  "Sanction Proceedings No.&Date",
                ].map((h) => (
                  <th key={h} style={{ ...th, fontSize: "10pt" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.previousInstallments.map((inst, i) => (
                <tr key={i}>
                  <td style={tdC}>{i + 1}</td>
                  <td style={td}>{inst.no}</td>
                  <td style={tdR}>{inst.amount ? `${inst.amount}/-` : "—"}</td>
                  <td style={tdC}>{inst.releasedDate || "—"}</td>
                  <td style={td}>{inst.procNo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Para 3 — new installment PFMS */}
      <div style={J}>
        Now, the funding agency has assigned the{" "}
        <span style={B}>{draft.currentInstallmentNo}</span> of{" "}
        <span style={B}>
          Rs.{draft.currentInstallmentAmount || "——"}/- (
          {draft.currentInstallmentWords || "——"})
        </span>{" "}
        to THE DIRECTOR CSRC{" "}
        {draft.projectScheme ? `${draft.projectScheme.toUpperCase()},` : ""}{" "}
        {draft.bankName || "UNION BANK OF INDIA"} A/c No.
        {draft.pfmsRefNo || "——"} through <span style={B}>PFMS Portal</span>,
        vide reference {draft.pfmsRefCited || "fifth"} cited.
      </div>

      {/* Para 4 — TSA & reap request */}
      <div style={J}>
        In the reference {draft.tsaRefCited || "sixth"} cited above,{" "}
        {draft.piName || "——"}, {draft.piDesig || "——"} of the Project, has
        requested to accord administrative sanction for the above amount of Rs.
        {draft.currentInstallmentAmount || "——"}/- and by following CSRC norms.
        {draft.tsa ? ` [${draft.tsa}].` : ""} Also, requested for
        reappropriation vide reference {draft.reapRefCited || "seventh"} cited.
      </div>

      {/* Para 5 — sanction accorded */}
      <div style={J}>
        Accordingly, as per the powers delegated in the reference first cited
        above, an administrative sanction is hereby accorded to{" "}
        {draft.toDesig || `The ${draft.piDesig || "——"}`},{" "}
        {draft.piDept || "——"}, {draft.piCampus || "——"} for the{" "}
        {draft.currentInstallmentNo} amount of{" "}
        <span style={B}>
          Rs.{draft.currentInstallmentAmount || "——"}/- (
          {draft.currentInstallmentWords || "——"})
        </span>{" "}
        and reappropriation of available funds towards implementation of the
        above project as detailed below.
      </div>

      {/* 6-col main table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "12px",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Sl. No.</th>
            <th style={th}>Head of Account</th>
            <th style={th}>Unspent Amount Available (Rs.)</th>
            <th style={th}>{draft.currentInstallmentNo} Amount</th>
            <th style={th}>Total Amount Available</th>
            <th style={th}>
              Total Amount available after Re-appropriation and{" "}
              {draft.currentInstallmentNo} (Rs.)
            </th>
          </tr>
        </thead>
        <tbody>
          {heads.map((h, i) => {
            const unspent = parseFloat(h.unspent) || 0;
            const inst = parseFloat(h.installmentAmount) || 0;
            const total = unspent + inst;
            return (
              <tr key={i}>
                <td style={tdC}>{i + 1}</td>
                <td style={td}>{h.head}</td>
                <td style={tdR}>
                  {unspent ? `${unspent.toLocaleString("en-IN")}/-` : "-"}
                </td>
                <td style={tdR}>
                  {inst ? `${inst.toLocaleString("en-IN")}/-` : "-"}
                </td>
                <td style={tdR}>
                  {total ? `${total.toLocaleString("en-IN")}/-` : "-"}
                </td>
                <td style={tdR}>
                  {total ? `${total.toLocaleString("en-IN")}/-` : "-"}
                </td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: "bold" }}>
            <td colSpan={2} style={{ ...td, textAlign: "right" }}>
              Total Amount
            </td>
            <td style={tdR}>
              {totalUnspent ? `${totalUnspent.toLocaleString("en-IN")}/-` : "-"}
            </td>
            <td style={tdR}>
              {totalInst ? `${totalInst.toLocaleString("en-IN")}/-` : "-"}
            </td>
            <td style={tdR}>
              {totalAvail ? `${totalAvail.toLocaleString("en-IN")}/-` : "-"}
            </td>
            <td style={tdR}>
              {totalAfter ? `${totalAfter.toLocaleString("en-IN")}/-` : "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Expenditure note */}
      <div style={J}>
        {draft.expenditureNote ||
          `The expenditure for the above project will be debitable under ${draft.mhNo || "M.H.No.——"} – ${draft.agency || "——"} Project "${draft.projectName || "——"}" by ${draft.piName || "——"}, ${draft.piDesig || "——"}, ${draft.piDept || "——"}, ${draft.piCampus || "——"}.`}
      </div>

      {/* Sanction register */}
      {(draft.sanctionRegVol || draft.sanctionRegSl) && (
        <div style={{ ...J, marginBottom: "24px" }}>
          The above sanction has been entered in the Project Sanction Register
          Vol – {draft.sanctionRegVol} C vide Sl.No.{draft.sanctionRegSl} at
          Page No.{draft.sanctionRegPage}.
        </div>
      )}

      {/* Signature */}
      <div
        style={{ textAlign: "right", marginBottom: "28px", marginTop: "24px" }}
      >
        {draft.status === "COMPLETED" && draft.directorSignature ? (
          <img
            src={
              draft.directorSignature.startsWith("http")
                ? draft.directorSignature
                : `http://localhost:5100/${draft.directorSignature.replace(/^\/+/, "")}`
            }
            alt="Director Signature"
            style={{
              height: "48px",
              objectFit: "contain",
              marginBottom: "6px",
            }}
          />
        ) : (
          <div style={{ marginBottom: "40px" }}></div>
        )}
        <div style={B}>{draft.directorName || "DIRECTOR, CSRC"}</div>
      </div>

      {/* To */}
      <div style={{ marginBottom: "14px" }}>
        <div style={B}>To</div>
        <div>The {draft.toDesig || draft.piDesig || "——"},</div>
        <div>{draft.piDept || "——"},</div>
        <div>{draft.piCampus || "——"},</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div>
        <div style={B}>Copy to:</div>
        <div>1. CSRC 3 &amp; 4</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL A — Without Installment (Details + Report tabs)
═══════════════════════════════════════════════════════════════════════════ */
function ManageModalWithout({
  item,
  editable,
  onSave,
  onClose,
  onDecide,
  userRole: role,
}) {
  const [tab, setTab] = useState("details");
  const [baseDraft, setBaseDraft] = useState(() => ensureReapShape(item));
  const [draft, setDraft] = useState(() => ensureReapShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);
  const fe = editable && isEditing;
  const s = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  React.useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5100/api/sanctions/reappropriation/${item.id}`,
        );
        if (!active) return;
        const normalized = buildReapDraftFromDetail(item, res.data, false);
        setBaseDraft(normalized);
        setDraft(normalized);
        setTab("details");
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        if (!active) return;
        const fallback = ensureReapShape(item);
        setBaseDraft(fallback);
        setDraft(fallback);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (item?.id) {
      loadDetail();
    }

    return () => {
      active = false;
    };
  }, [item?.id]);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100000,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 700 }}>Loading...</div>
      </div>
    );
  }

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `${draft.id || "Reap"}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  const patchHead = (i, p) =>
    setDraft((d) => ({
      ...d,
      reapHeads: d.reapHeads.map((h, idx) => (idx === i ? { ...h, ...p } : h)),
    }));
  const delHead = (i) =>
    setDraft((d) => ({
      ...d,
      reapHeads: d.reapHeads.filter((_, idx) => idx !== i),
    }));
  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const totalUnspent = (draft.reapHeads || []).reduce(
    (s, h) => s + (parseFloat(h.unspent) || 0),
    0,
  );
  const totalAfter = (draft.reapHeads || []).reduce(
    (s, h) => s + (parseFloat(h.afterReap) || 0),
    0,
  );

  return (
    <ModalShell
      title={`REAPPROPRIATION (WITHOUT INSTALMENT) — ${draft.id}`}
      draft={draft}
      tab={tab}
      setTab={setTab}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editable={editable}
      onClose={onClose}
      downloadPDF={downloadPDF}
    >
      {tab === "details" ? (
        <div>
          {/* Project info */}
          <SH>Project Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Request ID", val: draft.id },
              { label: "Funding Agency", val: draft.agency },
              { label: "Status", val: <StatusBadge status={draft.status} /> },
              { label: "Submitted On", val: draft.submittedOn },
            ].map(({ label, val }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    marginBottom: "3px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* PI & Project Info */}
          <SH>PI & Project Info</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="PI Name"
              value={draft.piName}
              onChange={s("piName")}
              disabled={!fe}
            />
            <EF
              label="PI Designation"
              value={draft.piDesig}
              onChange={s("piDesig")}
              disabled={!fe}
            />
            <EF
              label="Department"
              value={draft.piDept}
              onChange={s("piDept")}
              disabled={!fe}
              span
            />
            <EF
              label="Campus"
              value={draft.piCampus}
              onChange={s("piCampus")}
              disabled={!fe}
            />
            <EF
              label="Project Scheme"
              value={draft.projectScheme}
              onChange={s("projectScheme")}
              disabled={!fe}
              span
            />
            <EF
              label="Total Cost (₹)"
              value={draft.totalCost}
              onChange={s("totalCost")}
              disabled={!fe}
            />
            <EF
              label="Total Cost in Words"
              value={draft.totalCostWords}
              onChange={s("totalCostWords")}
              disabled={!fe}
              span
            />
            <EF
              label="Start Date"
              value={draft.startDate}
              onChange={s("startDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="End Date"
              value={draft.endDate}
              onChange={s("endDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="Duration (words)"
              value={draft.duration}
              onChange={s("duration")}
              disabled={!fe}
              placeholder="e.g. thirty six months"
            />
          </div>

          <SH>Project / Installment Snapshot</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Project Title
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
              >
                {draft.projectName || "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Installment No.
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
              >
                {draft.currentInstallmentNo || draft.installment || "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Sanction Ref No
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
              >
                {draft.sanction_reference_no || draft.sanctionRefNo || "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Project Start / End
              </div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}
              >
                {draft.startDate || "—"} to {draft.endDate || "—"}
              </div>
            </div>
          </div>

          {/* Proceedings */}
          <SH>Proceedings Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <EF
              label="Proceeding No"
              value={draft.proceedingNo}
              onChange={s("proceedingNo")}
              disabled={!fe}
            />
            <EF
              label="Proceeding Date"
              value={draft.proceedingDate}
              onChange={s("proceedingDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="Director Name"
              value={draft.directorName}
              onChange={s("directorName")}
              disabled={!fe}
            />
          </div>

          {/* References */}
          <SH>References (Ref: list in proceedings)</SH>
          <RefEditor
            refs={draft.references || []}
            fe={fe}
            onChange={s("references")}
          />

          {/* Previous instalments */}
          <SH>Previous Instalments</SH>
          <PrevInstEditor
            insts={draft.previousInstallments || []}
            fe={fe}
            onChange={s("previousInstallments")}
          />
          {/* Budget Snapshot */}
          <SH>Budget Snapshot (This Installment)</SH>
          {draft.budgetSnapshot ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Head of Account", "Amount (₹)"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#64748b",
                          textTransform: "uppercase",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Non-Recurring (Equipment)",
                      draft.budgetSnapshot.non_recurring_total,
                    ],
                    ["Manpower", draft.budgetSnapshot.manpower_total],
                    ["Consumables", draft.budgetSnapshot.consumables],
                    ["Travel", draft.budgetSnapshot.travel],
                    ["Contingency", draft.budgetSnapshot.contingency],
                    ["SSR Budget", draft.budgetSnapshot.ssr_budget],
                    ["Overhead", draft.budgetSnapshot.overhead_total],
                  ]
                    .filter(([, v]) => parseFloat(v) > 0)
                    .map(([label, val], i) => (
                      <tr
                        key={label}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: i % 2 === 0 ? "#fff" : "#f8fafc",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 14px",
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          {label}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            fontWeight: 700,
                            color: "#1d4ed8",
                          }}
                        >
                          ₹{" "}
                          {parseFloat(val).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  <tr style={{ background: "#eff6ff" }}>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 800,
                        color: "#1d4ed8",
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 800,
                        color: "#1d4ed8",
                      }}
                    >
                      ₹{" "}
                      {(
                        draft.budgetSnapshot.non_recurring_total +
                        draft.budgetSnapshot.manpower_total +
                        draft.budgetSnapshot.consumables +
                        draft.budgetSnapshot.travel +
                        draft.budgetSnapshot.contingency +
                        draft.budgetSnapshot.ssr_budget +
                        draft.budgetSnapshot.overhead_total
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "16px",
              }}
            >
              No budget data available for this installment.
            </div>
          )}

          {/* Reappropriation details */}
          <SH>Re-appropriation Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="Re-appropriation Amount (₹)"
              value={draft.reapAmount}
              onChange={s("reapAmount")}
              disabled={!fe}
            />
            <EF
              label="Amount in Words"
              value={draft.reapAmountWords}
              onChange={s("reapAmountWords")}
              disabled={!fe}
              span
            />
            <EF
              label="From Head"
              value={draft.reapFromHead}
              onChange={s("reapFromHead")}
              disabled={!fe}
            />
            <EF
              label="To Head"
              value={draft.reapToHead}
              onChange={s("reapToHead")}
              disabled={!fe}
            />
            <EF
              label="Request Reference Cited (e.g. fourth)"
              value={draft.reapRefCited}
              onChange={s("reapRefCited")}
              disabled={!fe}
            />
          </div>

          <SH>Detail Rows From Table</SH>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Sl.", "From Head", "To Head", "Amount (₹)"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(draft.reapDetails || []).map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                      {h.fromHead || h.head || h.from || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                      {h.toHead || h.afterReap || h.to || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                    >
                      {h.amount
                        ? `${Number(h.amount).toLocaleString("en-IN")}/-`
                        : h.unspent
                          ? `${Number(h.unspent).toLocaleString("en-IN")}/-`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget heads table */}
          <SH extra={null}>Budget Heads Table (for report)</SH>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Sl.",
                    "Head of Account",
                    "Original Amount (₹)",
                    "After Re-appropriation Amount (₹)",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {h}
                    </th>
                  ))}

                  {fe && (
                    <th
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    ></th>
                  )}
                </tr>
              </thead>

              <tbody>
                {(fe ? draft.reapHeads || [] : draft.reportBudget || []).map(
                  (h, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "#94a3b8",
                        }}
                      >
                        {i + 1}
                      </td>

                      <td style={{ padding: "8px 14px" }}>
                        {fe ? (
                          <input
                            value={h.head}
                            onChange={(e) =>
                              patchHead(i, {
                                head: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{h.head}</span>
                        )}
                      </td>

                      <td style={{ padding: "8px 14px" }}>
                        {fe ? (
                          <input
                            type="number"
                            value={h.unspent}
                            onChange={(e) =>
                              patchHead(i, {
                                unspent: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <span>
                            {Number(h.original || 0).toLocaleString("en-IN")}/-
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "8px 14px" }}>
                        {fe ? (
                          <input
                            type="number"
                            value={h.afterReap}
                            onChange={(e) =>
                              patchHead(i, {
                                afterReap: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#1d4ed8",
                            }}
                          >
                            {Number(h.revised || 0).toLocaleString("en-IN")}/-
                          </span>
                        )}
                      </td>

                      {fe && (
                        <td style={{ padding: "8px 14px" }}>
                          <button
                            onClick={() => delHead(i)}
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#b91c1c",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            🗑
                          </button>
                        </td>
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {fe && (
              <div
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      reapHeads: [
                        ...(d.reapHeads || []),
                        {
                          head: "",
                          unspent: "",
                          afterReap: "",
                        },
                      ],
                    }))
                  }
                  style={{
                    border: "1px solid #bfdbfe",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ➕ Add Head
                </button>
              </div>
            )}
          </div>

          {/* Expenditure & Register */}
          <SH>Expenditure & Register Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="M.H. No."
              value={draft.mhNo}
              onChange={s("mhNo")}
              disabled={!fe}
              placeholder="e.g. M.H.No.15.1.34"
            />
            <EF
              label="Sanction Register Vol"
              value={draft.sanctionRegVol}
              onChange={s("sanctionRegVol")}
              disabled={!fe}
              placeholder="e.g. VIII"
            />
            <EF
              label="Sl. No."
              value={draft.sanctionRegSl}
              onChange={s("sanctionRegSl")}
              disabled={!fe}
            />
            <EF
              label="Page No."
              value={draft.sanctionRegPage}
              onChange={s("sanctionRegPage")}
              disabled={!fe}
            />
            <EF
              label="Expenditure Note (leave blank for auto)"
              value={draft.expenditureNote}
              onChange={s("expenditureNote")}
              disabled={!fe}
              span
              rows={3}
            />
          </div>

          {/* Tracking */}
          <SH>Transfer Tracking</SH>
          <TransferTimeline item={draft} />

          {/* Director decision */}
          {editable &&
            !isEditing &&
            role === "director" &&
            draft.status === "ASSIGNED TO DIRECTOR" && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "12px",
                  }}
                >
                  Final Decision
                </div>
                <button
                  className="btn-approve"
                  onClick={() => onDecide(draft)}
                  style={{ width: "100%" }}
                >
                  ✓ Approve
                </button>
              </div>
            )}
          {editable && isEditing && (
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="btn-approve" onClick={handleSave}>
                💾 Save Changes
              </button>
              <button
                className="btn-edit"
                onClick={() => {
                  setDraft(baseDraft);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div ref={reportRef}>
          <ReportWithout draft={draft} />
        </div>
      )}
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL B — With Installment (Details + Report tabs)
═══════════════════════════════════════════════════════════════════════════ */
function ManageModalWith({
  item,
  editable,
  onSave,
  onClose,
  onDecide,
  userRole: role,
}) {
  const [tab, setTab] = useState("details");
  const [baseDraft, setBaseDraft] = useState(() =>
    ensureReapWithInstShape(item),
  );
  const [draft, setDraft] = useState(() => ensureReapWithInstShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);
  const fe = editable && isEditing;
  const s = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  React.useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5100/api/sanctions/reappropriation/${item.id}`,
        );
        if (!active) return;
        const normalized = buildReapDraftFromDetail(item, res.data, true);
        setBaseDraft(normalized);
        setDraft(normalized);
        setTab("details");
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        if (!active) return;
        const fallback = ensureReapWithInstShape(item);
        setBaseDraft(fallback);
        setDraft(fallback);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (item?.id) {
      loadDetail();
    }

    return () => {
      active = false;
    };
  }, [item?.id]);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100000,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 700 }}>Loading...</div>
      </div>
    );
  }

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `${draft.id || "Reap"}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  const patchHead = (i, p) =>
    setDraft((d) => ({
      ...d,
      installmentHeads: d.installmentHeads.map((h, idx) =>
        idx === i ? { ...h, ...p } : h,
      ),
    }));
  const delHead = (i) =>
    setDraft((d) => ({
      ...d,
      installmentHeads: d.installmentHeads.filter((_, idx) => idx !== i),
    }));
  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };
  const heads = draft.installmentHeads || [];
  const totalUnspent = heads.reduce(
    (s, h) => s + (parseFloat(h.unspent) || 0),
    0,
  );
  const totalInst = heads.reduce(
    (s, h) => s + (parseFloat(h.installmentAmount) || 0),
    0,
  );
  const totalAvail = totalUnspent + totalInst;
  const budgetRows = draft.reportBudget || [];
  const totalOriginal = budgetRows.reduce(
    (s, h) => s + (parseFloat(h.original) || 0),
    0,
  );
  const totalAfterReap = budgetRows.reduce(
    (s, h) => s + (parseFloat(h.revised) || 0),
    0,
  );

  return (
    <ModalShell
      title={`REAPPROPRIATION (WITH INSTALMENT) — ${draft.id}`}
      draft={draft}
      tab={tab}
      setTab={setTab}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editable={editable}
      onClose={onClose}
      downloadPDF={downloadPDF}
    >
      {tab === "details" ? (
        <div>
          {/* Project info */}
          <SH>Project Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Request ID", val: draft.id },
              { label: "Funding Agency", val: draft.agency },
              { label: "Status", val: <StatusBadge status={draft.status} /> },
              { label: "Submitted On", val: draft.submittedOn },
            ].map(({ label, val }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    marginBottom: "3px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* PI & Project Info */}
          <SH>PI & Project Info</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="PI Name"
              value={draft.piName}
              onChange={s("piName")}
              disabled={!fe}
            />
            <EF
              label="PI Designation"
              value={draft.piDesig}
              onChange={s("piDesig")}
              disabled={!fe}
            />
            <EF
              label="Department"
              value={draft.piDept}
              onChange={s("piDept")}
              disabled={!fe}
              span
            />
            <EF
              label="Campus"
              value={draft.piCampus}
              onChange={s("piCampus")}
              disabled={!fe}
            />
            <EF
              label="Project Scheme"
              value={draft.projectScheme}
              onChange={s("projectScheme")}
              disabled={!fe}
              span
            />
            <EF
              label="Total Cost (₹)"
              value={draft.totalCost}
              onChange={s("totalCost")}
              disabled={!fe}
            />
            <EF
              label="Total Cost in Words"
              value={draft.totalCostWords}
              onChange={s("totalCostWords")}
              disabled={!fe}
              span
            />
            <EF
              label="Start Date"
              value={draft.startDate}
              onChange={s("startDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="End Date"
              value={draft.endDate}
              onChange={s("endDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="Duration (words)"
              value={draft.duration}
              onChange={s("duration")}
              disabled={!fe}
              placeholder="e.g. sixty months"
            />
            <EF
              label="Extended Upto"
              value={draft.extendedUpto}
              onChange={s("extendedUpto")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
          </div>

          {/* Proceedings */}
          <SH>Proceedings Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <EF
              label="Proceeding No"
              value={draft.proceedingNo}
              onChange={s("proceedingNo")}
              disabled={!fe}
            />
            <EF
              label="Proceeding Date"
              value={draft.proceedingDate}
              onChange={s("proceedingDate")}
              disabled={!fe}
              placeholder="DD-MM-YYYY"
            />
            <EF
              label="Director Name"
              value={draft.directorName}
              onChange={s("directorName")}
              disabled={!fe}
            />
          </div>

          {/* References */}
          <SH>References (Ref: list in proceedings)</SH>
          <RefEditor
            refs={draft.references || []}
            fe={fe}
            onChange={s("references")}
          />

          {/* Previous instalments */}
          <SH>Previous Instalments</SH>
          <PrevInstEditor
            insts={draft.previousInstallments || []}
            fe={fe}
            onChange={s("previousInstallments")}
          />

          {/* Current instalment */}
          <SH>Current Instalment</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="Instalment No."
              value={draft.currentInstallmentNo}
              onChange={s("currentInstallmentNo")}
              disabled={!fe}
              placeholder="e.g. IV Instalment"
            />
            <EF
              label="Amount (₹)"
              value={draft.currentInstallmentAmount}
              onChange={s("currentInstallmentAmount")}
              disabled={!fe}
            />
            <EF
              label="Amount in Words"
              value={draft.currentInstallmentWords}
              onChange={s("currentInstallmentWords")}
              disabled={!fe}
              span
            />
            <EF
              label="Bank Name"
              value={draft.bankName}
              onChange={s("bankName")}
              disabled={!fe}
              placeholder="UNION BANK OF INDIA"
            />
            <EF
              label="PFMS A/c No."
              value={draft.pfmsRefNo}
              onChange={s("pfmsRefNo")}
              disabled={!fe}
            />
            <EF
              label="PFMS Ref Cited (e.g. fifth)"
              value={draft.pfmsRefCited}
              onChange={s("pfmsRefCited")}
              disabled={!fe}
            />
            <EF
              label="TSA Account String"
              value={draft.tsa}
              onChange={s("tsa")}
              disabled={!fe}
              span
              placeholder="TSA A/c – Receipt – Income – 1-40-46-20[17]"
            />
            <EF
              label="TSA Ref Cited (e.g. sixth)"
              value={draft.tsaRefCited}
              onChange={s("tsaRefCited")}
              disabled={!fe}
            />
            <EF
              label="Reap Ref Cited (e.g. seventh)"
              value={draft.reapRefCited}
              onChange={s("reapRefCited")}
              disabled={!fe}
            />
            <EF
              label="To Designation"
              value={draft.toDesig}
              onChange={s("toDesig")}
              disabled={!fe}
              placeholder="e.g. The Coordinator"
            />
          </div>

          <SH>Detail Rows From Table</SH>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Sl.", "From Head", "To Head", "Amount (₹)"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(draft.reapDetails || []).map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                      {h.fromHead || h.head || h.from || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                      {h.toHead || h.afterReap || h.to || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                    >
                      {h.amount
                        ? `${Number(h.amount).toLocaleString("en-IN")}/-`
                        : h.installmentAmount
                          ? `${Number(h.installmentAmount).toLocaleString("en-IN")}/-`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Budget heads table */}
          {/* Budget heads table */}
          <SH
            extra={
              <span
                style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}
              >
                Total after re-appropriation:{" "}
                {totalAfterReap ? totalAfterReap.toLocaleString("en-IN") : "—"}
                /-
              </span>
            }
          >
            Budget Heads & Re-appropriation
          </SH>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Sl.",
                    "Head of Account",
                    "Original Amount (₹)",
                    "After Re-appropriation (₹)",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                      {h.head}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {Number(h.original || 0).toLocaleString("en-IN")}/-
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 600,
                        color: "#1d4ed8",
                      }}
                    >
                      {Number(h.revised || 0).toLocaleString("en-IN")}/-
                    </td>
                  </tr>
                ))}
                {budgetRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        color: "#94a3b8",
                        fontSize: "12px",
                      }}
                    >
                      No budget heads found
                    </td>
                  </tr>
                )}
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td
                    colSpan={2}
                    style={{ padding: "10px 14px", textAlign: "right" }}
                  >
                    Total
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {totalOriginal
                      ? `${totalOriginal.toLocaleString("en-IN")}/-`
                      : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#1d4ed8" }}>
                    {totalAfterReap
                      ? `${totalAfterReap.toLocaleString("en-IN")}/-`
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenditure & Register */}
          <SH>Expenditure & Register Details</SH>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <EF
              label="M.H. No."
              value={draft.mhNo}
              onChange={s("mhNo")}
              disabled={!fe}
              placeholder="e.g. M.H.No.15.1.11"
            />
            <EF
              label="Sanction Register Vol"
              value={draft.sanctionRegVol}
              onChange={s("sanctionRegVol")}
              disabled={!fe}
              placeholder="e.g. VIII"
            />
            <EF
              label="Sl. No."
              value={draft.sanctionRegSl}
              onChange={s("sanctionRegSl")}
              disabled={!fe}
            />
            <EF
              label="Page No."
              value={draft.sanctionRegPage}
              onChange={s("sanctionRegPage")}
              disabled={!fe}
            />
            <EF
              label="Expenditure Note (leave blank for auto)"
              value={draft.expenditureNote}
              onChange={s("expenditureNote")}
              disabled={!fe}
              span
              rows={3}
            />
          </div>

          {/* Tracking */}
          <SH>Transfer Tracking</SH>
          <TransferTimeline item={draft} />

          {/* Director decision */}
          {editable &&
            !isEditing &&
            role === "director" &&
            draft.status === "ASSIGNED TO DIRECTOR" && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "12px",
                  }}
                >
                  Final Decision
                </div>
                <button
                  className="btn-approve"
                  onClick={() => onDecide(draft)}
                  style={{ width: "100%" }}
                >
                  ✓ Approve
                </button>
              </div>
            )}
          {editable && isEditing && (
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="btn-approve" onClick={handleSave}>
                💾 Save Changes
              </button>
              <button
                className="btn-edit"
                onClick={() => {
                  setDraft(baseDraft);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div ref={reportRef}>
          <ReportWith draft={draft} />
        </div>
      )}
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING — Type Selection Cards
═══════════════════════════════════════════════════════════════════════════ */
function TypeSelectionLanding({ onSelect }) {
  console.log("[Reap] TypeSelectionLanding render");
  const cards = [
    {
      type: "without",
      icon: "🔄",
      title: "Re-appropriation without Instalment",
      description:
        "Re-allocate funds between budget heads from the existing unspent balance. No new instalment amount involved.",
      features: [
        "Sub, Ref list, and body paragraphs",
        "Previous instalments table",
        "Unspent | After Re-appropriation (4-col table)",
        "Expenditure note and sanction register line",
      ],
      accent: "#7c3aed",
      accentLight: "#f5f3ff",
      accentBorder: "#ddd6fe",
    },
    {
      type: "with",
      icon: "📦",
      title: "Re-appropriation with Instalment",
      description:
        "Combine a new instalment release with re-appropriation of available funds across budget heads.",
      features: [
        "Sub, Ref list, and body paragraphs",
        "Previous instalments + new instalment (PFMS) details",
        "6-col table (Unspent | Instalment | Total | After Reap)",
        "TSA account string and sanction register entry",
      ],
      accent: "#0369a1",
      accentLight: "#f0f9ff",
      accentBorder: "#bae6fd",
    },
  ];
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "12px",
          }}
        >
          CSRC — Re-appropriation Module
        </div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
        >
          Select Claim Type
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#64748b",
            margin: 0,
            maxWidth: "480px",
          }}
        >
          Both types generate official CSRC proceedings in the correct format
          matching the sanction documents.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          maxWidth: "760px",
          width: "100%",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => {
              console.log("[Reap] Type selected", {
                type: card.type,
                title: card.title,
              });
              onSelect(card.type);
            }}
            style={{
              background: "#fff",
              border: `2px solid ${card.accentBorder}`,
              borderRadius: "20px",
              padding: "32px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
              e.currentTarget.style.borderColor = card.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = card.accentBorder;
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: card.accentLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              {card.description}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {card.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontSize: "12px",
                    color: "#475569",
                    marginBottom: "5px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      color: card.accent,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: card.accent }}
            >
              Get Started →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function OfficeReappropriationPage() {
  const navigate = useNavigate();
  const role = userRole();
  const [mounted, setMounted] = useState(false);
  const [claimType, setClaimType] = useState(null);

  const [reapActive, setReapActive] = useState([]);
  const [reapTransferred, setReapTransferred] = useState([]);
  const [reapCompleted, setReapCompleted] = useState([]);
  const [dashboard, setDashboard] = useState({});

  const [manageItem, setManageItem] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      let dashboardResponse = { data: {} };

      for (const type of reapTypeCandidates(claimType)) {
        dashboardResponse = await axios.get(
          "http://localhost:5100/api/sanctions/reappropriation/dashboard-counts",
          {
            params: {
              username: userName(),
              role,
              type,
            },
          },
        );

        const counts = dashboardResponse.data || {};
        if (
          Number(counts.new || 0) > 0 ||
          Number(counts.transferred || 0) > 0 ||
          Number(counts.completed || 0) > 0
        ) {
          break;
        }
      }

      setDashboard(dashboardResponse.data);
    } catch (err) {
      console.error("[Reap] fetchDashboard error", err);
    }
  };

  const fetchReapRows = async (url) => {
    let lastRows = [];

    for (const type of reapTypeCandidates(claimType)) {
      const res = await axios.get(url, {
        params: {
          username: userName(),
          type,
        },
      });

      const rows = Array.isArray(res.data)
        ? res.data.map(normalizeReapRequest)
        : [];
      if (rows.length > 0) {
        return rows;
      }

      lastRows = rows;
    }

    return lastRows;
  };

  const fetchRequests = async () => {
    try {
      let activeEndpoint = "";

      if (role === "assistant") {
        activeEndpoint =
          "http://localhost:5100/api/sanctions/reappropriation/assigned-to-me";
      } else if (role === "superintendent") {
        activeEndpoint =
          "http://localhost:5100/api/sanctions/reappropriation/assigned-to-supervisor";
      } else if (role === "dd") {
        activeEndpoint =
          "http://localhost:5100/api/sanctions/reappropriation/assigned-to-dd";
      } else {
        activeEndpoint =
          "http://localhost:5100/api/sanctions/reappropriation/assigned-to-director";
      }

      const [activeRows, transferredRows, completedRows] = await Promise.all([
        fetchReapRows(activeEndpoint),
        fetchReapRows(
          "http://localhost:5100/api/sanctions/reappropriation/transferred-by-me",
        ),
        fetchReapRows(
          "http://localhost:5100/api/sanctions/reappropriation/completed-by-me",
        ),
      ]);

      setReapActive(activeRows);
      setReapTransferred(transferredRows);
      setReapCompleted(completedRows);
    } catch (err) {
      console.error("[Reap] fetchRequests error", err);
    }
  };

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    if (claimType) {
      fetchDashboard();
      fetchRequests();
    }
  }, [claimType, role]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const sourceData =
    activeTab === "active"
      ? reapActive
      : activeTab === "transferred"
        ? reapTransferred
        : reapCompleted;

  const counts = dashboard || {
    total: 0,
    new: 0,
    transferred: 0,
    completed: 0,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sourceData.filter((r) => {
      const ms =
        !q ||
        r.projectName?.toLowerCase().includes(q) ||
        (typeof r.pi === "string"
          ? r.pi.toLowerCase().includes(q)
          : r.pi?.name?.toLowerCase().includes(q)) ||
        r.agency?.toLowerCase().includes(q) ||
        String(r.id).toLowerCase().includes(q);
      return ms;
    });
  }, [sourceData, search]);

  const handleApproveTransfer = async (item, staff) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/approve-and-assign`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();

      showToast("Transferred Successfully");
    } catch (err) {
      console.error("[Reap] handleApproveTransfer error", err);
    }
  };

  const handlePlainTransfer = async (item, staff) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/transfer`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();
    } catch (err) {
      console.error("[Reap] handlePlainTransfer error", err);
    }
  };

  const handleApproveForward = async (item, staff) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/approve-and-assign-dd`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();
    } catch (err) {
      console.error("[Reap] handleApproveForward error", err);
    }
  };

  const handlePlainForward = async (item, staff) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/transfer`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();

      showToast(`Transferred to ${staff.name}`);
    } catch (err) {
      console.error("[Reap] handlePlainForward error", err);
    }
  };

  // ── DD tier ──────────────────────────────────────────────────────────────
  const handleDdApprove = async (item, staff) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/approve-and-assign-director`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();

      showToast("Transferred Successfully");
    } catch (err) {
      console.error("[Reap] handleDdApprove error", err);
    }
  };

  const handleDdPlainTransfer = async (item, staff) => {
    try {
      // DD's "no approval" transfer sends the record BACK a stage to the
      // superviser, unlike every other role's plain transfer which stays
      // at the same stage.
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${item.id}/transfer-to-supervisor`,
        {
          assigned_to: staffIdentity(staff),
          assigned_from: userName(),
          remarks: item.remarks || "",
        },
      );

      fetchRequests();
      fetchDashboard();

      showToast(`Sent back to ${staff.name}`);
    } catch (err) {
      console.error("[Reap] handleDdPlainTransfer error", err);
    }
  };

  const handleFinalApprove = async (item) => {
    const id = item?.id ?? item;
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${id}/final-approve`,
        {
          assigned_from: userName(),
          remarks: (typeof item === "object" && item?.remarks) || "",
        },
      );

      fetchRequests();
      fetchDashboard();

      setManageItem(null);

      showToast(`Reappropriation #${id} approved ✓`);
    } catch (err) {
      console.error("[Reap] handleFinalApprove error", err);
    }
  };

  const handleSaveManaged = async (updated) => {
    try {
      await axios.put(
        `http://localhost:5100/api/sanctions/reappropriation/${updated.id}`,
        updated,
      );

      fetchRequests();
      fetchDashboard();

      setManageItem(null);

      showToast("Saved successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const tabs =
    role === "assistant"
      ? [
          { key: "active", label: `New Requests (${reapActive.length})` },
          {
            key: "transferred",
            label: `Transferred (${reapTransferred.length})`,
          },
          { key: "completed", label: `Completed (${reapCompleted.length})` },
        ]
      : role === "superintendent"
        ? [
            { key: "active", label: `In My Queue (${reapActive.length})` },
            {
              key: "transferred",
              label: `All Transferred (${reapTransferred.length})`,
            },
            { key: "completed", label: `Completed (${reapCompleted.length})` },
          ]
        : role === "dd"
          ? [
              { key: "active", label: `In My Queue (${reapActive.length})` },
              {
                key: "transferred",
                label: `All Transferred (${reapTransferred.length})`,
              },
              {
                key: "completed",
                label: `Completed (${reapCompleted.length})`,
              },
            ]
          : [
              {
                key: "active",
                label: `Awaiting Approval (${reapActive.length})`,
              },
              {
                key: "completed",
                label: `Completed (${reapCompleted.length})`,
              },
            ];
  const isWithInst = claimType === "with";
  const accentColor = isWithInst ? "#0369a1" : "#7c3aed";

  /* ─── Landing ─────────────────────────────────────────────────────────── */
  if (!claimType) {
    return (
      <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
        <div className="fs-top-nav">
          <button
            className="fs-btn-back"
            onClick={() => navigate("/projects/project-requests")}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
          <div className="fs-nav-right">
            <span className={`fs-role-chip fs-role-${role}`}>
              {role === "assistant"
                ? "🟢"
                : role === "superintendent"
                  ? "🔵"
                  : "🔴"}{" "}
              {role}
            </span>
          </div>
        </div>
        <TypeSelectionLanding onSelect={setClaimType} />
      </div>
    );
  }

  /* ─── Sub-page ────────────────────────────────────────────────────────── */
  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 999999,
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: toast.type === "success" ? "#15803d" : "#b91c1c",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => setClaimType(null)}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Claim Type
        </button>
        <div className="fs-nav-right">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "999px",
              background: isWithInst ? "#e0f2fe" : "#f5f3ff",
              color: accentColor,
            }}
          >
            {isWithInst ? "📦" : "🔄"}{" "}
            {isWithInst ? "With Instalment" : "Without Instalment"}
          </span>
          <span className={`fs-role-chip fs-role-${role}`}>
            {role === "assistant"
              ? "🟢"
              : role === "superintendent"
                ? "🔵"
                : "🔴"}{" "}
            {role}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="fs-header">
        <h1 className="fs-header-title">
          {isWithInst ? "📦" : "🔄"}{" "}
          {isWithInst
            ? "Re-appropriation with Instalment"
            : "Re-appropriation without Instalment"}
        </h1>
        <p className="fs-header-sub">
          {isWithInst
            ? "Instalment release + fund re-allocation across budget heads"
            : "Re-allocate existing unspent funds between budget heads"}
        </p>
      </div>

      <StatsRow counts={counts} />

      {/* Tabs */}
      <div className="tab-switcher">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          margin: "16px 0",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div className="fs-search-bar" style={{ flex: 1, margin: 0 }}>
          <div className="fs-search-inner">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by project, PI, agency, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="fs-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Request ID</th>
            <th>Project / PI</th>
            <th>Agency</th>
            {isWithInst && <th>Instalment</th>}
            <th>Submitted</th>
            <th>Status</th>
            {(activeTab === "transferred" ||
              (role !== "assistant" && activeTab === "active")) && (
              <th>Stage</th>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={10}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#94a3b8",
                }}
              >
                {search ? `No results for "${search}"` : "No items to display"}
              </td>
            </tr>
          )}
          {filtered.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{item.id}</td>
              <td>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>
                  {item.projectName}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {typeof item.pi === "string" ? item.pi : item.pi?.name}
                </div>
              </td>
              <td>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {item.agency}
                </span>
              </td>
              {isWithInst && (
                <td>
                  <span
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {item.currentInstallmentNo || "—"}
                  </span>
                </td>
              )}
              <td style={{ color: "#64748b", fontSize: "12px" }}>
                {item.submittedOn}
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              {(activeTab === "transferred" ||
                (role !== "assistant" && activeTab === "active")) && (
                <td>
                  <StageBadge role={item.currentHolder?.role} />
                </td>
              )}
              <td>
                <div className="fs-actions">
                  <button
                    className="btn-view"
                    onClick={() => setManageItem(item)}
                  >
                    👁 View
                  </button>
                  {role === "assistant" && activeTab === "active" && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveTransfer}
                      onPlainTransfer={handlePlainTransfer}
                    />
                  )}
                  {role === "superintendent" && activeTab === "active" && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveForward}
                      onPlainTransfer={handlePlainForward}
                    />
                  )}
                  {role === "dd" && activeTab === "active" && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleDdApprove}
                      onPlainTransfer={handleDdPlainTransfer}
                    />
                  )}
                  {role === "director" && activeTab === "active" && (
                    <button
                      className="btn-approve"
                      onClick={() => handleFinalApprove(item)}
                    >
                      ✓ Approve
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      {manageItem && !isWithInst && (
        <ManageModalWithout
          item={manageItem}
          editable={activeTab === "active"}
          onSave={handleSaveManaged}
          onClose={() => setManageItem(null)}
          onDecide={handleFinalApprove}
          userRole={role}
        />
      )}
      {manageItem && isWithInst && (
        <ManageModalWith
          item={manageItem}
          editable={activeTab === "active"}
          onSave={handleSaveManaged}
          onClose={() => setManageItem(null)}
          onDecide={handleFinalApprove}
          userRole={role}
        />
      )}
    </div>
  );
}
