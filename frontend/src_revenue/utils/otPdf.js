// src_revenue/utils/otPdf.js
// Builds the printable CSRC OT bill and exports it as a PDF via html2pdf.js.
// Mirrors salaryPdf.js — annexure lists total OT hours & amount per staff,
// with a day-wise breakdown table per staff underneath.

import html2pdf from 'html2pdf.js';
import { formatCurrency } from './otWorkflow';
import { formatDate } from './staffWorkflow';

function monthYearLabel(sanction) {
  return `${sanction.month} ${sanction.year}`;
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
      <strong>Sub:</strong> CSRC – Overtime allowance for staff members – ${monthYearLabel(sanction)} –
      ${isApproved ? 'Sanction – Accorded – Reg.' : 'Sanction – Reg.'}
    </div>
    <div style="font-size:11.5px; line-height:1.6; margin-bottom:14px;">
      Based on the sanction accorded, the overtime allowance of the staff members listed below, for the
      month of ${monthYearLabel(sanction)}, is sanctioned for payment as detailed in the annexure below.
    </div>
  `;
}

function summaryTableHtml(sanction) {
  const rows = sanction.entries
    .map(
      (e, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${e.staffName}<br/><span style="color:#666; font-size:10px;">${e.designation}</span></td>
      <td>${e.bankAccountNumber || '—'}</td>
      <td style="text-align:center;">${e.totalHours}</td>
      <td style="text-align:right;">${e.ratePerHour.toFixed(2)}</td>
      <td style="text-align:right; font-weight:700;">${e.totalAmount.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <table style="width:100%; border-collapse:collapse; font-size:10.5px;">
      <thead>
        <tr style="background:#f0f3f8;">
          <th>S.No</th><th>Name &amp; Designation</th><th>Account Number</th>
          <th>Total OT Hours</th><th>Rate / Hour (Rs.)</th><th>Amount (Rs.)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="font-weight:800; background:#f7f9fc;">
          <td colspan="5" style="text-align:right;">Total</td>
          <td style="text-align:right;">${sanction.totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function dayWiseTableHtml(entry) {
  const rows = entry.days
    .map(
      (d) => `
    <tr>
      <td>${formatDate(d.date)}</td>
      <td style="text-align:center;">${d.inTime || '—'}</td>
      <td style="text-align:center;">${d.outTime || '—'}</td>
      <td style="text-align:center;">${d.otBeforeOfficeHours}</td>
      <td style="text-align:center;">${d.otAfterOfficeHours}</td>
      <td style="text-align:center;">${d.totalHoursForDay}</td>
      <td>${d.remarks || ''}</td>
    </tr>
  `
    )
    .join('');

  return `
    <div style="margin-top:14px; page-break-inside:avoid;">
      <div style="font-size:11px; font-weight:700; margin-bottom:4px;">${entry.staffName} — ${entry.designation}</div>
      <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
        <thead>
          <tr style="background:#f7f9fc;">
            <th>Date</th><th>In Time</th><th>Out Time</th><th>OT Before</th><th>OT After</th><th>Hours/Day</th><th>Remarks</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function tdStyled(html) {
  return html.replace(/<t[hd](?![^>]*style)/g, (m) => `${m} style="border:1px solid #ccc; padding:5px 4px; text-align:left;"`);
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

export function buildOTBillHtml(sanction) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color:#111; padding:26px 30px; width:760px;">
      ${billHeadHtml(sanction)}
      ${tdStyled(summaryTableHtml(sanction))}
      ${sanction.entries.map((e) => tdStyled(dayWiseTableHtml(e))).join('')}
      ${signatureBlockHtml(sanction)}
    </div>
  `;
}

export function downloadOTBillPdf(sanction) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.innerHTML = buildOTBillHtml(sanction);
  document.body.appendChild(container);

  const filename = `OT_${sanction.month}_${sanction.year}.pdf`;

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
    .then(() => document.body.removeChild(container))
    .catch((err) => {
      document.body.removeChild(container);
      throw err;
    });
}