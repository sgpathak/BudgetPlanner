import {
  DAYS_IN_MONTH,
  getMonthKey,
  getMonthKeysForYear,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
} from '../data/initialFinanceData';
import {
  ExpenseCategory,
  ExpenseGroup,
  IncomeEntry,
  IncomeSource,
  MonthSummary,
  SpendingInsight,
  Transaction,
} from '../types/finance';

export interface FinanceOverview {
  year: number;
  yearTotalIncome: number;
  yearTotalExpenses: number;
  yearNetBalance: number;
  yearSavingsTotal: number;
  yearFixedTotal: number;
  yearYearlyTotal: number;
  yearMiscTotal: number;
  yearlySavingsRate: number;
  monthlyAverageExpenses: number;
  dailyAverageSpend: number;
  monthSummaries: Record<string, MonthSummary>;
  categoryTotals: Record<string, { total: number; monthlyAvg: number; percentOfIncome: number; percentOfExpense: number }>;
  incomeSourceTotals: Record<string, { sourceName: string; total: number; percentOfIncome: number; color: string }>;
  groupTotals: {
    savings: { total: number; percentOfIncome: number; percentOfExpense: number };
    fixed: { total: number; percentOfIncome: number; percentOfExpense: number };
    yearly: { total: number; percentOfIncome: number; percentOfExpense: number };
    miscellaneous: { total: number; percentOfIncome: number; percentOfExpense: number };
  };
}

export function calculateFinanceOverview(
  transactions: Transaction[],
  incomeEntries: IncomeEntry[],
  categories: ExpenseCategory[],
  incomeSources: IncomeSource[],
  targetYear: number = 2026
): FinanceOverview {
  const categoryMap = new Map<string, ExpenseCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const monthKeys = getMonthKeysForYear(targetYear);
  const monthSummaries: Record<string, MonthSummary> = {};
  const catSums: Record<string, number> = {};
  categories.forEach((c) => {
    catSums[c.id] = 0;
  });

  let yearTotalIncome = 0;
  let yearTotalExpenses = 0;
  let yearSavingsTotal = 0;
  let yearFixedTotal = 0;
  let yearYearlyTotal = 0;
  let yearMiscTotal = 0;

  // Track income sources totals
  const incomeSourceSums: Record<string, { sourceName: string; total: number; color: string }> = {};
  incomeSources.forEach((s) => {
    incomeSourceSums[s.id] = { sourceName: s.name, total: 0, color: s.color };
  });

  // Initialize all 12 month summaries for targetYear
  monthKeys.forEach((mKey, monthIndex) => {
    const monthIncomes = incomeEntries.filter(
      (inc) => inc.year === targetYear && inc.monthIndex === monthIndex
    );
    const incAmt = monthIncomes.reduce((sum, item) => sum + item.amount, 0);
    yearTotalIncome += incAmt;

    // Accumulate income sources
    monthIncomes.forEach((item) => {
      if (!incomeSourceSums[item.sourceId]) {
        incomeSourceSums[item.sourceId] = { sourceName: item.sourceName, total: 0, color: '#64748b' };
      }
      incomeSourceSums[item.sourceId].total += item.amount;
    });

    monthSummaries[mKey] = {
      monthKey: mKey,
      year: targetYear,
      monthIndex,
      income: incAmt,
      totalExpenses: 0,
      savingsTotal: 0,
      fixedTotal: 0,
      yearlyTotal: 0,
      miscTotal: 0,
      netBalance: incAmt,
      savingsRate: 0,
      dailyAverage: 0,
      incomeEntries: monthIncomes,
    };
  });

  // Filter transactions for targetYear
  const yearTxs = transactions.filter((t) => t.year === targetYear);

  for (const tx of yearTxs) {
    const mKey = tx.monthKey;
    if (!monthSummaries[mKey]) continue;

    const cat = categoryMap.get(tx.categoryId);
    const group: ExpenseGroup = cat ? cat.group : 'miscellaneous';

    monthSummaries[mKey].totalExpenses += tx.amount;
    yearTotalExpenses += tx.amount;

    if (group === 'savings') {
      monthSummaries[mKey].savingsTotal += tx.amount;
      yearSavingsTotal += tx.amount;
    } else if (group === 'fixed') {
      monthSummaries[mKey].fixedTotal += tx.amount;
      yearFixedTotal += tx.amount;
    } else if (group === 'yearly') {
      monthSummaries[mKey].yearlyTotal += tx.amount;
      yearYearlyTotal += tx.amount;
    } else {
      monthSummaries[mKey].miscTotal += tx.amount;
      yearMiscTotal += tx.amount;
    }

    catSums[tx.categoryId] = (catSums[tx.categoryId] || 0) + tx.amount;
  }

  // Calculate final metrics per month
  monthKeys.forEach((mKey, monthIndex) => {
    const m = monthSummaries[mKey];
    m.netBalance = m.income - m.totalExpenses;
    m.savingsRate = m.income > 0 ? Math.round((m.savingsTotal / m.income) * 1000) / 10 : 0;
    const days = DAYS_IN_MONTH[monthIndex] || 30;
    m.dailyAverage = Math.round(m.totalExpenses / days);
  });

  const categoryTotals: Record<string, { total: number; monthlyAvg: number; percentOfIncome: number; percentOfExpense: number }> = {};
  for (const cat of categories) {
    const total = catSums[cat.id] || 0;
    categoryTotals[cat.id] = {
      total,
      monthlyAvg: Math.round(total / 12),
      percentOfIncome: yearTotalIncome > 0 ? Math.round((total / yearTotalIncome) * 10000) / 100 : 0,
      percentOfExpense: yearTotalExpenses > 0 ? Math.round((total / yearTotalExpenses) * 10000) / 100 : 0,
    };
  }

  const incomeSourceTotals: Record<string, { sourceName: string; total: number; percentOfIncome: number; color: string }> = {};
  for (const [id, data] of Object.entries(incomeSourceSums)) {
    incomeSourceTotals[id] = {
      sourceName: data.sourceName,
      total: data.total,
      percentOfIncome: yearTotalIncome > 0 ? Math.round((data.total / yearTotalIncome) * 1000) / 10 : 0,
      color: data.color,
    };
  }

  const monthlyAverageExpenses = Math.round(yearTotalExpenses / 12);
  const dailyAverageSpend = Math.round(yearTotalExpenses / 365);
  const yearNetBalance = yearTotalIncome - yearTotalExpenses;
  const yearlySavingsRate = yearTotalIncome > 0 ? Math.round((yearSavingsTotal / yearTotalIncome) * 1000) / 10 : 0;

  const groupTotals = {
    savings: {
      total: yearSavingsTotal,
      percentOfIncome: yearTotalIncome > 0 ? Math.round((yearSavingsTotal / yearTotalIncome) * 100) : 0,
      percentOfExpense: yearTotalExpenses > 0 ? Math.round((yearSavingsTotal / yearTotalExpenses) * 100) : 0,
    },
    fixed: {
      total: yearFixedTotal,
      percentOfIncome: yearTotalIncome > 0 ? Math.round((yearFixedTotal / yearTotalIncome) * 100) : 0,
      percentOfExpense: yearTotalExpenses > 0 ? Math.round((yearFixedTotal / yearTotalExpenses) * 100) : 0,
    },
    yearly: {
      total: yearYearlyTotal,
      percentOfIncome: yearTotalIncome > 0 ? Math.round((yearYearlyTotal / yearTotalIncome) * 100) : 0,
      percentOfExpense: yearTotalExpenses > 0 ? Math.round((yearYearlyTotal / yearTotalExpenses) * 100) : 0,
    },
    miscellaneous: {
      total: yearMiscTotal,
      percentOfIncome: yearTotalIncome > 0 ? Math.round((yearMiscTotal / yearTotalIncome) * 100) : 0,
      percentOfExpense: yearTotalExpenses > 0 ? Math.round((yearMiscTotal / yearTotalExpenses) * 100) : 0,
    },
  };

  return {
    year: targetYear,
    yearTotalIncome,
    yearTotalExpenses,
    yearNetBalance,
    yearSavingsTotal,
    yearFixedTotal,
    yearYearlyTotal,
    yearMiscTotal,
    yearlySavingsRate,
    monthlyAverageExpenses,
    dailyAverageSpend,
    monthSummaries,
    categoryTotals,
    incomeSourceTotals,
    groupTotals,
  };
}

// Multi-Year Report with Income Entries
export interface MultiYearReport {
  years: number[];
  annualData: Array<{
    year: number;
    income: number;
    expenses: number;
    savings: number;
    fixed: number;
    yearly: number;
    misc: number;
    netBalance: number;
    savingsRate: number;
  }>;
  cumulativeTotals: {
    income: number;
    expenses: number;
    savings: number;
    fixed: number;
    yearly: number;
    misc: number;
    netBalance: number;
    savingsRate: number;
  };
  categoryComparison: Array<{
    categoryId: string;
    categoryName: string;
    group: ExpenseGroup;
    valuesByYear: Record<number, number>;
    cumulativeTotal: number;
  }>;
}

export function generateMultiYearReport(
  transactions: Transaction[],
  incomeEntries: IncomeEntry[],
  categories: ExpenseCategory[],
  startYear: number,
  endYear: number
): MultiYearReport {
  const years: number[] = [];
  for (let y = Math.min(startYear, endYear); y <= Math.max(startYear, endYear); y++) {
    years.push(y);
  }

  const categoryMap = new Map<string, ExpenseCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  let cumIncome = 0;
  let cumExpenses = 0;
  let cumSavings = 0;
  let cumFixed = 0;
  let cumYearly = 0;
  let cumMisc = 0;

  const annualData = years.map((yr) => {
    const yrTxs = transactions.filter((t) => t.year === yr);
    const yrIncomes = incomeEntries.filter((i) => i.year === yr);
    const totalIncome = yrIncomes.reduce((sum, i) => sum + i.amount, 0);

    let savings = 0;
    let fixed = 0;
    let yearly = 0;
    let misc = 0;

    for (const tx of yrTxs) {
      const cat = categoryMap.get(tx.categoryId);
      const grp = cat ? cat.group : 'miscellaneous';
      if (grp === 'savings') savings += tx.amount;
      else if (grp === 'fixed') fixed += tx.amount;
      else if (grp === 'yearly') yearly += tx.amount;
      else misc += tx.amount;
    }

    const expenses = savings + fixed + yearly + misc;
    const netBalance = totalIncome - expenses;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 1000) / 10 : 0;

    cumIncome += totalIncome;
    cumExpenses += expenses;
    cumSavings += savings;
    cumFixed += fixed;
    cumYearly += yearly;
    cumMisc += misc;

    return {
      year: yr,
      income: totalIncome,
      expenses,
      savings,
      fixed,
      yearly,
      misc,
      netBalance,
      savingsRate,
    };
  });

  const categoryComparison = categories.map((cat) => {
    const valuesByYear: Record<number, number> = {};
    let catCum = 0;

    for (const yr of years) {
      const sum = transactions
        .filter((t) => t.year === yr && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0);
      valuesByYear[yr] = sum;
      catCum += sum;
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      group: cat.group,
      valuesByYear,
      cumulativeTotal: catCum,
    };
  });

  const cumulativeTotals = {
    income: cumIncome,
    expenses: cumExpenses,
    savings: cumSavings,
    fixed: cumFixed,
    yearly: cumYearly,
    misc: cumMisc,
    netBalance: cumIncome - cumExpenses,
    savingsRate: cumIncome > 0 ? Math.round((cumSavings / cumIncome) * 1000) / 10 : 0,
  };

  return {
    years,
    annualData,
    cumulativeTotals,
    categoryComparison,
  };
}

export interface MonthMultiYearComparison {
  monthIndex: number;
  monthName: string;
  categoryId?: string;
  categoryName: string;
  dataByYear: Array<{
    year: number;
    amount: number;
    prevYearDiff?: number;
    percentChange?: number;
  }>;
  averageAmount: number;
  highestYear: { year: number; amount: number };
  lowestYear: { year: number; amount: number };
}

export function compareMonthAcrossYears(
  transactions: Transaction[],
  categories: ExpenseCategory[],
  monthIndex: number,
  years: number[],
  categoryId?: string
): MonthMultiYearComparison {
  const monthName = MONTH_NAMES_FULL[monthIndex];
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : null;
  const categoryName = cat ? cat.name : 'Total Monthly Expenses';

  const dataByYear: Array<{
    year: number;
    amount: number;
    prevYearDiff?: number;
    percentChange?: number;
  }> = [];

  let total = 0;
  let count = 0;
  let highest = { year: years[0], amount: -Infinity };
  let lowest = { year: years[0], amount: Infinity };

  for (let i = 0; i < years.length; i++) {
    const yr = years[i];
    const monthTxs = transactions.filter(
      (t) => t.year === yr && t.monthIndex === monthIndex && (!categoryId || t.categoryId === categoryId)
    );
    const amount = monthTxs.reduce((sum, t) => sum + t.amount, 0);

    let prevYearDiff: number | undefined;
    let percentChange: number | undefined;

    if (i > 0) {
      const prevAmount = dataByYear[i - 1].amount;
      prevYearDiff = amount - prevAmount;
      if (prevAmount > 0) {
        percentChange = Math.round(((amount - prevAmount) / prevAmount) * 100);
      }
    }

    dataByYear.push({
      year: yr,
      amount,
      prevYearDiff,
      percentChange,
    });

    total += amount;
    count++;

    if (amount > highest.amount) highest = { year: yr, amount };
    if (amount < lowest.amount) lowest = { year: yr, amount };
  }

  return {
    monthIndex,
    monthName,
    categoryId,
    categoryName,
    dataByYear,
    averageAmount: count > 0 ? Math.round(total / count) : 0,
    highestYear: highest,
    lowestYear: lowest,
  };
}

export function generateSpendingInsights(
  overview: FinanceOverview,
  activeMonthKey: string,
  categories: ExpenseCategory[],
  transactions: Transaction[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const currMonthSummary = overview.monthSummaries[activeMonthKey];

  if (overview.yearTotalExpenses === 0 && overview.yearTotalIncome === 0) {
    insights.push({
      id: 'ins-blank-start',
      type: 'info',
      title: 'Blank Sheet Ready For Your Data',
      message: 'Add your income streams (Salary, Shows, etc.) and category expenses to begin seeing real-time charts and calculations.',
    });
    return insights;
  }

  if (overview.yearlySavingsRate >= 20) {
    insights.push({
      id: 'ins-savings-target',
      type: 'positive',
      title: `Annual Savings Target Met: ${overview.yearlySavingsRate}%`,
      message: `Total savings of ${formatCurrency(overview.yearSavingsTotal)} exceeds the 20% personal finance benchmark.`,
    });
  } else if (overview.yearlySavingsRate > 0) {
    insights.push({
      id: 'ins-savings-target',
      type: 'warning',
      title: `Savings Rate: ${overview.yearlySavingsRate}%`,
      message: `Current savings are below 20%. Allocate funds to SIP Nava Marriage or Gold early in the month.`,
    });
  }

  if (currMonthSummary) {
    if (currMonthSummary.netBalance < 0) {
      insights.push({
        id: `ins-deficit-${activeMonthKey}`,
        type: 'warning',
        title: `${activeMonthKey} Deficit: ${formatCurrency(Math.abs(currMonthSummary.netBalance))}`,
        monthKey: activeMonthKey,
        message: `In ${activeMonthKey}, outflows exceed income. Cushion this period using surplus from higher income months.`,
      });
    } else if (currMonthSummary.netBalance > 0) {
      insights.push({
        id: `ins-surplus-${activeMonthKey}`,
        type: 'positive',
        title: `${activeMonthKey} Positive Surplus: +${formatCurrency(currMonthSummary.netBalance)}`,
        monthKey: activeMonthKey,
        message: `Retained +${formatCurrency(currMonthSummary.netBalance)} surplus buffer in ${activeMonthKey}.`,
      });
    }
  }

  return insights;
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }
  if (currency === 'USD') {
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${Math.round(amount).toLocaleString('de-DE')}`;
  }
  return `${currency} ${Math.round(amount).toLocaleString()}`;
}
