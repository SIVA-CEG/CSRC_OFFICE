const FINANCIAL_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

export function getReceipts() {
  return JSON.parse(
    localStorage.getItem("receipt_entries") || "[]"
  );
}

export function saveReceipts(data) {
  localStorage.setItem(
    "receipt_entries",
    JSON.stringify(data)
  );
}

export function buildUnicode(receipt) {
  return [
    receipt.digit1,
    receipt.digit23,
    receipt.digit45,
    receipt.digit67,
    receipt.digit89,
  ]
    .filter(Boolean)
    .join("-");
}

export function getReceiptAmount(receipt) {
  return Number(receipt.amount || 0);
}

export function getFinancialYear(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
}

export function getMonthName(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    month: "long",
  });
}

export function filterReceipts({
  receipts,
  account,
  month,
  financialYear,
  search,
}) {
  return receipts.filter(receipt => {
    const accountMatch =
      !account ||
      receipt.account === account;

    const monthMatch =
      !month ||
      getMonthName(
        receipt.accountOn
      ) === month;

    const fyMatch =
      !financialYear ||
      getFinancialYear(
        receipt.accountOn
      ) === financialYear;

    const searchText =
      JSON.stringify(receipt)
        .toLowerCase();

    const searchMatch =
      !search ||
      searchText.includes(
        search.toLowerCase()
      );

    return (
      accountMatch &&
      monthMatch &&
      fyMatch &&
      searchMatch
    );
  });
}

export function calculateTotals(
  receipts
) {
  return {
    count: receipts.length,

    amount: receipts.reduce(
      (sum, row) =>
        sum +
        Number(
          row.amount || 0
        ),
      0
    ),

    project: receipts.filter(
      r =>
        r.account === "Project"
    ).length,

    revenue: receipts.filter(
      r =>
        r.account === "Revenue"
    ).length,

    mopr: receipts.filter(
      r =>
        r.account === "MOPR"
    ).length,

    ttdf: receipts.filter(
      r =>
        r.account === "TTDF"
    ).length,

    tax: receipts.filter(
      r =>
        r.account === "Tax"
    ).length,
  };
}

export function prepareExportData(
  receipts
) {
  return receipts.map(
    (receipt, index) => ({
      "Sl.No": index + 1,

      Account:
        receipt.account,

      "Receipt Head":
        receipt.receiptHead,

      Unicode:
        buildUnicode(
          receipt
        ),

      "Transaction Date":
        receipt.transactionDate,

      "Account On":
        receipt.accountOn,

      "M.H.No":
        receipt.mhNo,

      "File No":
        receipt.fileNo,

      Department:
        receipt.department,

      Campus:
        receipt.campus,

      Amount:
        receipt.amount,

      Remarks:
        receipt.remarks,
    })
  );
}

export function updateReceipt(
  updatedReceipt
) {
  const receipts =
    getReceipts();

  const updated =
    receipts.map(row =>
      row.id ===
      updatedReceipt.id
        ? updatedReceipt
        : row
    );

  saveReceipts(updated);

  return updated;
}

export function deleteReceipt(id) {
  const receipts =
    getReceipts();

  const updated =
    receipts.filter(
      r => r.id !== id
    );

  saveReceipts(updated);

  return updated;
}

export function calculateAccountWiseTotals(receipts) {
  const accounts = ["Project", "Revenue", "MOPR", "TTDF", "Tax"];

  const summary = {};
  accounts.forEach(acc => {
    summary[acc] = { count: 0, amount: 0 };
  });

  receipts.forEach(r => {
    if (summary[r.account]) {
      summary[r.account].count += 1;
      summary[r.account].amount += Number(r.amount || 0);
    }
  });

  const totalAmount = receipts.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  return {
    totalCount: receipts.length,
    totalAmount,
    accounts: summary,
  };
}