import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MONTH_KEYS, MonthKey } from '../data/initialFinanceData';
import { ExpenseCategory, Transaction } from '../types/finance';
import { FinanceOverview, formatCurrency } from './insightsEngine';

export interface PdfExportOptions {
  type: 'full-year' | 'monthly';
  selectedMonth?: MonthKey;
  userName?: string;
  currency?: string;
}

export function generateFinancePdfReport(
  overview: FinanceOverview,
  transactions: Transaction[],
  categories: ExpenseCategory[],
  options: PdfExportOptions
) {
  const userName = options.userName || 'Saval Pathak';
  const currency = options.currency || 'INR';

  if (options.type === 'full-year') {
    generateFullYearPdf(overview, transactions, categories, userName, currency);
  } else {
    const month = options.selectedMonth || 'Oct-26';
    generateMonthlyPdf(overview, transactions, categories, month, userName, currency);
  }
}

// Full Year Landscape PDF with the exact matrix from the Excel sheet!
function generateFullYearPdf(
  overview: FinanceOverview,
  transactions: Transaction[],
  categories: ExpenseCategory[],
  userName: string,
  currency: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Document Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FinFlow - Monthly Budget & Expense Statement (2026)', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Account Holder: ${userName}  |  Generated: ${new Date().toLocaleDateString()}  |  Currency: ${currency}`, 14, 20);

  // High-Level KPI Summary Cards on top of PDF
  const cardY = 33;
  const cardW = 48;
  const cardH = 18;
  const cardGap = 8;
  let currX = 14;

  const kpis = [
    { label: 'Total Yearly Income', value: formatCurrency(overview.yearTotalIncome, currency), bg: [240, 253, 244], border: [187, 247, 208], text: [22, 101, 52] },
    { label: 'Total Yearly Expenses', value: formatCurrency(overview.yearTotalExpenses, currency), bg: [254, 242, 242], border: [254, 202, 202], text: [153, 27, 27] },
    { label: 'Net Annual Surplus', value: formatCurrency(overview.yearNetBalance, currency), bg: [239, 246, 255], border: [191, 219, 254], text: [30, 64, 175] },
    { label: 'Annual Savings Rate', value: `${overview.yearlySavingsRate}% (${formatCurrency(overview.yearSavingsTotal, currency)})`, bg: [245, 243, 255], border: [221, 214, 254], text: [91, 33, 182] },
    { label: 'Daily Average Spend', value: `${formatCurrency(overview.dailyAverageSpend, currency)} / day`, bg: [254, 249, 195], border: [253, 224, 71], text: [133, 77, 14] },
  ];

  kpis.forEach((kpi) => {
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.roundedRect(currX, cardY, cardW, cardH, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, currX + 3, cardY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, currX + 3, cardY + 14);

    currX += cardW + cardGap;
  });

  // Build the 12-Month Matrix Table (matching the user's Excel sheet)
  const headers = ['Category', 'Yearly', 'Monthly Avg', '%', ...MONTH_KEYS];

  // Helper to compute row for a category
  const makeCategoryRow = (cat: ExpenseCategory) => {
    const stats = overview.categoryTotals[cat.id] || { total: 0, monthlyAvg: 0, percentOfIncome: 0 };
    const monthVals = MONTH_KEYS.map((mKey: string) => {
      const sum = transactions
        .filter((t) => t.monthKey === mKey && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0);
      return sum > 0 ? sum.toLocaleString() : '-';
    });

    return [
      cat.name,
      stats.total.toLocaleString(),
      stats.monthlyAvg.toLocaleString(),
      `${stats.percentOfIncome}%`,
      ...monthVals,
    ];
  };

  const bodyData: any[] = [];

  // 1. Total Income Row
  const incomeRow = [
    'Total Income',
    overview.yearTotalIncome.toLocaleString(),
    Math.round(overview.yearTotalIncome / 12).toLocaleString(),
    '100%',
    ...MONTH_KEYS.map((m: string) => (overview.monthSummaries[m]?.income || 0).toLocaleString()),
  ];
  bodyData.push(incomeRow);

  // 2. Net Balance / Surplus Row
  const netRow = [
    'Net Balance (Surplus)',
    overview.yearNetBalance.toLocaleString(),
    Math.round(overview.yearNetBalance / 12).toLocaleString(),
    `${Math.round((overview.yearNetBalance / (overview.yearTotalIncome || 1)) * 100)}%`,
    ...MONTH_KEYS.map((m: string) => {
      const net = overview.monthSummaries[m]?.netBalance || 0;
      return (net >= 0 ? '+' : '') + net.toLocaleString();
    }),
  ];
  bodyData.push(netRow);

  // 3. Savings Group Header
  bodyData.push([
    { content: `SAVINGS (${overview.groupTotals.savings.percentOfIncome}% of income - Total: ${formatCurrency(overview.groupTotals.savings.total, currency)})`, colSpan: headers.length, styles: { fillColor: [209, 250, 229], textColor: [6, 95, 70], fontStyle: 'bold' } },
  ]);
  categories
    .filter((c) => c.group === 'savings')
    .forEach((c) => bodyData.push(makeCategoryRow(c)));

  // 4. Fixed Expenses Group Header
  bodyData.push([
    { content: `FIXED EXPENSES (${overview.groupTotals.fixed.percentOfIncome}% of income - Total: ${formatCurrency(overview.groupTotals.fixed.total, currency)})`, colSpan: headers.length, styles: { fillColor: [224, 242, 254], textColor: [7, 89, 133], fontStyle: 'bold' } },
  ]);
  categories
    .filter((c) => c.group === 'fixed')
    .forEach((c) => bodyData.push(makeCategoryRow(c)));

  // 5. Yearly Expenses Group Header
  bodyData.push([
    { content: `YEARLY EXPENSES (${overview.groupTotals.yearly.percentOfIncome}% of income - Total: ${formatCurrency(overview.groupTotals.yearly.total, currency)})`, colSpan: headers.length, styles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold' } },
  ]);
  categories
    .filter((c) => c.group === 'yearly')
    .forEach((c) => bodyData.push(makeCategoryRow(c)));

  // 6. Miscellaneous Expenses Group Header
  bodyData.push([
    { content: `MISCELLANEOUS EXPENSES (${overview.groupTotals.miscellaneous.percentOfIncome}% of income - Total: ${formatCurrency(overview.groupTotals.miscellaneous.total, currency)})`, colSpan: headers.length, styles: { fillColor: [243, 232, 255], textColor: [107, 33, 168], fontStyle: 'bold' } },
  ]);
  categories
    .filter((c) => c.group === 'miscellaneous')
    .forEach((c) => bodyData.push(makeCategoryRow(c)));

  // 6. Total Expenses Row
  const totalExpRow = [
    'TOTAL EXPENSES',
    overview.yearTotalExpenses.toLocaleString(),
    overview.monthlyAverageExpenses.toLocaleString(),
    `${Math.round((overview.yearTotalExpenses / (overview.yearTotalIncome || 1)) * 100)}%`,
    ...MONTH_KEYS.map((m: string) => (overview.monthSummaries[m]?.totalExpenses || 0).toLocaleString()),
  ];
  bodyData.push(totalExpRow);

  autoTable(doc, {
    startY: cardY + cardH + 6,
    head: [headers],
    body: bodyData,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', halign: 'left' },
      1: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 17, halign: 'right' },
      3: { cellWidth: 12, halign: 'center' },
    },
    didParseCell: (data) => {
      // Highlight Net Balance row
      if (data.row.index === 1) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
      // Highlight Total Income row
      if (data.row.index === 0) {
        data.cell.styles.fillColor = [240, 253, 244];
        data.cell.styles.fontStyle = 'bold';
      }
      // Highlight Grand Total row
      if (data.row.index === bodyData.length - 1) {
        data.cell.styles.fillColor = [254, 226, 226];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('FinFlow Personal Finance System · Confidential Financial Record', 14, pageHeight - 6);

  doc.save(`FinFlow-Annual-Budget-Report-2026-${userName.replace(/\s+/g, '_')}.pdf`);
}

// Single Month Portrait Report
function generateMonthlyPdf(
  overview: FinanceOverview,
  transactions: Transaction[],
  categories: ExpenseCategory[],
  month: MonthKey,
  userName: string,
  currency: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const summary = overview.monthSummaries[month];
  const monthTransactions = transactions.filter((t) => t.monthKey === month);

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Monthly Expense & Budget Statement: ${month}`, 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Account: ${userName}  |  Generated: ${new Date().toLocaleDateString()}  |  Currency: ${currency}`, 14, 20);

  // KPI Overview for the month
  const cardY = 32;
  const cardW = 42;
  const cardH = 16;
  const gap = 5;
  let currX = 14;

  const monthKpis = [
    { label: 'Monthly Income', value: formatCurrency(summary?.income || 0, currency), bg: [240, 253, 244], text: [22, 101, 52] },
    { label: 'Total Expenses', value: formatCurrency(summary?.totalExpenses || 0, currency), bg: [254, 242, 242], text: [153, 27, 27] },
    { label: 'Net Cashflow', value: formatCurrency(summary?.netBalance || 0, currency), bg: [239, 246, 255], text: [30, 64, 175] },
    { label: 'Savings Rate', value: `${summary?.savingsRate || 0}%`, bg: [245, 243, 255], text: [91, 33, 182] },
  ];

  monthKpis.forEach((kpi) => {
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.roundedRect(currX, cardY, cardW, cardH, 2, 2, 'F');

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, currX + 3, cardY + 5.5);

    doc.setFontSize(10);
    doc.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, currX + 3, cardY + 12.5);

    currX += cardW + gap;
  });

  // Table 1: Category Summary for this Month
  const catSummaryRows: any[] = [];
  for (const cat of categories) {
    const total = monthTransactions
      .filter((t) => t.categoryId === cat.id)
      .reduce((s, t) => s + t.amount, 0);

    if (total > 0) {
      const shareOfIncome = summary?.income ? Math.round((total / summary.income) * 1000) / 10 : 0;
      const shareOfExpenses = summary?.totalExpenses ? Math.round((total / summary.totalExpenses) * 1000) / 10 : 0;
      catSummaryRows.push([
        cat.group.toUpperCase(),
        cat.name,
        formatCurrency(total, currency),
        `${shareOfIncome}%`,
        `${shareOfExpenses}%`,
      ]);
    }
  }

  autoTable(doc, {
    startY: cardY + cardH + 6,
    head: [['Group', 'Category', 'Amount', '% of Income', '% of Expenses']],
    body: catSummaryRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
  });

  // Table 2: Itemized Transactions Ledger for this Month
  const txRows = monthTransactions.map((tx) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    const details = [
      tx.formula ? `Formula: ${tx.formula}` : '',
      tx.note ? `Note: ${tx.note}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    return [
      tx.date,
      tx.description,
      cat ? cat.name : 'Other',
      formatCurrency(tx.amount, currency),
      tx.paymentMethod || 'UPI',
      details || '-',
    ];
  });

  // Get current Y position from previous table
  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Itemized Transaction Ledger', 14, finalY + 8);

  autoTable(doc, {
    startY: finalY + 11,
    head: [['Date', 'Description', 'Category', 'Amount', 'Mode', 'Formulas / Notes']],
    body: txRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 50 },
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`FinFlow Statement · ${month} · Confidential Financial Record`, 14, pageHeight - 6);

  doc.save(`FinFlow-Statement-${month}-${userName.replace(/\s+/g, '_')}.pdf`);
}
