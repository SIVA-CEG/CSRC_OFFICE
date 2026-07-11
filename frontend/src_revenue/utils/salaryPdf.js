// src_revenue/utils/salaryPdf.js
// ─────────────────────────────────────────────────────────────────────────
// Builds the printable CSRC salary bill (letter + annexure, matching the
// existing paper format) and exports it as a PDF via html2pdf.js.
// Shared by the Sanction Salary approval drawer and the Salary Reports page.
// ─────────────────────────────────────────────────────────────────────────

import html2pdf from 'html2pdf.js';
import { formatCurrency } from './salaryWorkflow';
import { formatDate } from './staffWorkflow';

function monthYearLabel(sanction) {
  return `${sanction.month} ${sanction.year}`;
}

function showsDayColumns(salaryType) {
  return salaryType !== 'Consolidated Pay';
}

function billHeadHtml(sanction) {
  const isApproved = sanction.status === 'approved';
  const directorEntry = (sanction.history || []).find((h) => h.role === 'director' && h.action === 'approved');
  const dateLabel = directorEntry ? formatDate(directorEntry.date) : formatDate(sanction.createdBy.date);

  return `
    <div style="text-align:center; margin-bottom:18px;">
      <div style="font-size:15px; font-weight:800; letter-spacing:0.02em;">CENTRE FOR SPONSORED RESEARCH AND CONSULTANCY</div>
      <div style="font-size:10.5px; color:#555; margin-top:2px;">(Formerly known as Centre for Technology Development and Transfer)</div>
      <div style="font-size:12px; font-weight:700; margin-top:2px;">ANNA UNIVERSITY :: CHENNAI 600025</div>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:10px;">
      <span>Proc No: ${sanction.procNo || '—'}/CSRC</span>
      <span>Date: ${dateLabel}</span>
    </div>
    <div style="font-size:12px; line-height:1.6; margin-bottom:10px;">
      <strong>Sub:</strong> CSRC – ${sanction.salaryType} staff members – Salary for the month of
      ${monthYearLabel(sanction)} – ${isApproved ? 'Sanction – Accorded – Reg.' : 'Sanction – Reg.'}
    </div>
    <div style="font-size:11.5px; line-height:1.6; margin-bottom:14px;">
      Based on the sanction accorded, the salary of the staff members listed below, working under CSRC
      on ${sanction.salaryType.toLowerCase()} for the month of ${monthYearLabel(sanction)}, is sanctioned for
      payment as detailed in the annexure below.
    </div>
  `;
}

function annexureTableHtml(sanction) {
  const showDays = showsDayColumns(sanction.salaryType);

  const headCells = [
    'S.No', 'Name &amp; Designation', 'Account Number',
    ...(showDays ? ['Days Worked', 'Wage/Day (Rs.)'] : []),
    'Gross Salary (Rs.)',
    ...(showDays ? ['Incentive Days', 'Incentive Amt (Rs.)'] : []),
    'Lump Sum (Rs.)', 'Net Salary (Rs.)',
  ];

  const rows = sanction.entries.map((e, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${e.staffName}<br/><span style="color:#666; font-size:10px;">${e.designation}</span></td>
      <td>${e.bankAccountNumber || '—'}</td>
      ${showDays ? `<td style="text-align:center;">${e.daysWorked}</td>` : ''}
      ${showDays ? `<td style="text-align:right;">${e.wagePerDay ? e.wagePerDay.toFixed(2) : '—'}</td>` : ''}
      <td style="text-align:right;">${e.grossSalary.toFixed(2)}</td>
      ${showDays ? `<td style="text-align:center;">${e.incentiveDays}</td>` : ''}
      ${showDays ? `<td style="text-align:right;">${e.incentiveAmount.toFixed(2)}</td>` : ''}
      <td style="text-align:right;">${e.lumpSum.toFixed(2)}</td>
      <td style="text-align:right; font-weight:700;">${e.netSalary.toFixed(2)}</td>
    </tr>
  `).join('');

  const colCount = headCells.length;

  return `
    <table style="width:100%; border-collapse:collapse; font-size:10.5px;">
      <thead>
        <tr style="background:#f0f3f8;">
          ${headCells.map((h) => `<th style="border:1px solid #ccc; padding:6px 5px; text-align:left;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="font-weight:800; background:#f7f9fc;">
          <td colspan="${colCount - 1}" style="border:1px solid #ccc; padding:6px; text-align:right;">Total</td>
          <td style="border:1px solid #ccc; padding:6px; text-align:right;">${sanction.totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function tdStyled(html) {
  return html.replace(/<td(?![^>]*style)/g, '<td style="border:1px solid #ccc; padding:6px 5px;"');
}

function signatureBlockHtml(sanction) {
  const rows = (sanction.history || [])
    .filter((h) => h.action === 'approved')
    .map((h) => `<div style="margin-top:4px;">${h.role.replace('_', ' ').toUpperCase()} — ${h.name} (${formatDate(h.date)})</div>`)
    .join('');

  return `
    <div style="margin-top:26px; font-size:11.5px;">
      <div>Total amount sanctioned: <strong>${formatCurrency(sanction.totalAmount)}</strong></div>
      ${rows ? `<div style="margin-top:10px; color:#333;">${rows}</div>` : ''}
      <div style="margin-top:36px; text-align:right; font-weight:700;">DIRECTOR, CSRC</div>
    </div>
  `;
}

export function buildSalaryBillHtml(sanction) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color:#111; padding:26px 30px; width:760px;">
      ${billHeadHtml(sanction)}
      ${tdStyled(annexureTableHtml(sanction))}
      ${signatureBlockHtml(sanction)}
    </div>
  `;
}

export function downloadSalaryBillPdf(sanction) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.innerHTML = buildSalaryBillHtml(sanction);
  document.body.appendChild(container);

  const filename = `Salary_${sanction.month}_${sanction.year}_${sanction.salaryType.replace(/\s+/g, '_')}.pdf`;

  return html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(container)
    .save()
    .then(() => {
      document.body.removeChild(container);
    })
    .catch((err) => {
      document.body.removeChild(container);
      throw err;
    });
}