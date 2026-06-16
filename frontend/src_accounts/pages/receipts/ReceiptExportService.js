import { prepareExportData } from "./ReceiptReportService";
import html2pdf from "html2pdf.js";

/**
 * CSV EXPORT
 */
export function exportToCSV(receipts, fileName = "Receipt_Report") {
  const rows = prepareExportData(receipts);

  if (!rows.length) {
    alert("No data available");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map(row =>
      headers
        .map(header =>
          `"${String(row[header] ?? "")
            .replace(/"/g, '""')}"`
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}



export function generateReceiptReportHTML(receipts) {
  const totalAmount = receipts.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const rows = receipts
    .map(
      (row, index) => `
      <tr>
        <td class="center">${index + 1}</td>

        <td>${row.receiptHead || ""}</td>

        <td>${row.fundType || ""}</td>

        <td>${row.payMode || ""}</td>

        <td class="unicode">
          ${row.digit1 || ""}-${row.digit23 || ""}-${row.digit45 || ""}-${row.digit67 || ""}-${row.digit89 || ""}
        </td>

        <td class="center">
          ${row.transactionDate || ""}
        </td>

        <td>
          ${row.mhNo || ""}
        </td>

        <td>
          ${row.fileNo || ""}
        </td>

        <td>
          ${row.department || ""}
        </td>

        <td>
          ${row.campus || ""}
        </td>

        <td class="center">
          ${row.accountOn || ""}
        </td>

        <td class="amount">
          ₹ ${Number(
            row.amount || 0
          ).toLocaleString("en-IN")}
        </td>

        <td>
          ${row.remarks || ""}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <html>
  <head>
    <style>

      body{
        font-family:Arial,sans-serif;
        padding:15px;
        color:#1e293b;
      }

      .header{
        text-align:center;
        margin-bottom:18px;
      }

      .header h1{
        margin:0;
        font-size:22px;
        color:#0f172a;
      }

      .header h2{
        margin:4px 0;
        font-size:14px;
        font-weight:600;
        color:#475569;
      }

      .meta{
        margin-top:10px;
        font-size:10px;
        color:#64748b;
      }

      table{
        width:100%;
        border-collapse:collapse;
        table-layout:fixed;
        font-size:9px;
      }

      thead th{
        background:#0f172a;
        color:white;
        border:1px solid #cbd5e1;
        padding:7px 5px;
        text-align:center;
      }

      tbody td{
        border:1px solid #e2e8f0;
        padding:6px 5px;
        vertical-align:top;
        word-wrap:break-word;
      }

      tbody tr:nth-child(even){
        background:#f8fafc;
      }

      .center{
        text-align:center;
      }

      .amount{
        text-align:right;
        font-weight:700;
        white-space:nowrap;
      }

      .unicode{
        white-space:nowrap;
        font-size:8px;
      }

      .total-row{
        background:#dbeafe !important;
        font-weight:700;
      }

      .footer{
        margin-top:12px;
        text-align:right;
        font-size:9px;
        color:#64748b;
      }

    </style>
  </head>

  <body>

    <div class="header">
      <h1>CSRC ACCOUNTS OFFICE</h1>

      <h2>Month Wise Receipt Report</h2>

      <div class="meta">
        Generated On :
        ${new Date().toLocaleString("en-IN")}
      </div>
    </div>

    <table>

      <thead>
        <tr>
          <th style="width:40px;">Sl.No</th>
          <th>Receipt Head</th>
          <th style="width:70px;">Fund Type</th>
          <th style="width:70px;">Pay Mode</th>
          <th style="width:130px;">Unicode</th>
          <th style="width:75px;">Txn Date</th>
          <th style="width:75px;">M.H.No</th>
          <th style="width:85px;">File No</th>
          <th style="width:80px;">Department</th>
          <th style="width:95px;">Campus</th>
          <th style="width:75px;">Acct On</th>
          <th style="width:90px;">Amount</th>
          <th style="width:130px;">Remarks</th>
        </tr>
      </thead>

      <tbody>

        ${rows}

        <tr class="total-row">
          <td colspan="11">
            Grand Total
          </td>

          <td class="amount">
            ₹ ${totalAmount.toLocaleString("en-IN")}
          </td>

          <td></td>
        </tr>

      </tbody>

    </table>

    <div class="footer">
      Total Receipts : ${receipts.length}
    </div>

  </body>
  </html>
  `;
}

export async function downloadPDF(
  receipts
) {
  const html =
    generateReceiptReportHTML(
      receipts
    );

  const element =
    document.createElement("div");

  element.innerHTML = html;

  await html2pdf()
    .from(element)
    .set({
  margin: 5,

  pagebreak: {
    mode: ["avoid-all", "css", "legacy"],
  },

  html2canvas: {
    scale: 1.5,
  },

  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  },
})
    .save();
}




export async function previewPDF(receipts) {
  const html =
    generateReceiptReportHTML(receipts);

  const element =
    document.createElement("div");

  element.innerHTML = html;

  const worker = html2pdf()
    .from(element)
    .set({
  margin: 5,

  pagebreak: {
    mode: ["avoid-all", "css", "legacy"],
  },

  html2canvas: {
    scale: 1.5,
  },

  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "landscape",
  },
});

  const pdfBlob = await worker.outputPdf("blob");

  const url =
    URL.createObjectURL(pdfBlob);

  window.open(url, "_blank");
}



/**
 * REPORT SUMMARY
 */
export function buildReportSummary(receipts) {
  const totalAmount = receipts.reduce(
    (sum, row) =>
      sum + Number(row.amount || 0),
    0
  );

  const accountTotals = {
    Project: 0,
    Revenue: 0,
    MOPR: 0,
    TTDF: 0,
    Tax: 0,
  };

  receipts.forEach(row => {
    if (accountTotals[row.account] !== undefined) {
      accountTotals[row.account] += Number(
        row.amount || 0
      );
    }
  });

  return {
    totalReceipts: receipts.length,
    totalAmount,

    accountTotals,
  };
}

/**
 * EXPORT PAYLOAD
 */
export function getExportPayload(receipts) {
  const summary =
    buildReportSummary(receipts);

  return {
    exportedAt:
      new Date().toISOString(),

    totalRecords:
      summary.totalReceipts,

    totalAmount:
      summary.totalAmount,

    accountTotals:
      summary.accountTotals,

    rows:
      prepareExportData(receipts),
  };
}