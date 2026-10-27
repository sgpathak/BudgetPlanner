import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
} from 'lucide-react';
import {
  MONTH_NAMES_FULL,
  SUPPORTED_YEARS,
} from '../data/initialFinanceData';
import { ExpenseCategory, IncomeEntry, Transaction } from '../types/finance';
import {
  compareMonthAcrossYears,
  formatCurrency,
  generateMultiYearReport,
} from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';

interface MultiYearComparisonViewProps {
  transactions: Transaction[];
  incomeEntries: IncomeEntry[];
  categories: ExpenseCategory[];
  currency: string;
}

export const MultiYearComparisonView: React.FC<MultiYearComparisonViewProps> = ({
  transactions,
  incomeEntries,
  categories,
  currency,
}) => {
  // Available years dynamically derived from transactions and income records
  const allYears = useMemo(() => {
    const yrs = new Set<number>([2025, 2026]);
    transactions.forEach((t) => yrs.add(t.year));
    incomeEntries.forEach((i) => yrs.add(i.year));
    return Array.from(yrs).sort((a, b) => a - b);
  }, [transactions, incomeEntries]);

  // Year Range State (Default 2025 to 2026, or whatever is in sheet)
  const [startYear, setStartYear] = useState<number>(() => (allYears[0] ? allYears[0] : 2025));
  const [endYear, setEndYear] = useState<number>(() => (allYears[allYears.length - 1] ? allYears[allYears.length - 1] : 2026));

  // Tab: 'annual' | 'month-compare'
  const [activeSubTab, setActiveSubTab] = useState<'annual' | 'month-compare'>('annual');

  // Month-compare specific controls
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(4); // May (monthIndex 4) default as user mentioned in prompt!
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('electric_bill'); // Electricity default as user mentioned!

  // Category filter in annual view
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 'savings' | 'fixed' | 'yearly' | 'miscellaneous'>('all');

  // Multi-Year Report Generation
  const multiYearReport = useMemo(() => {
    return generateMultiYearReport(transactions, incomeEntries, categories, startYear, endYear);
  }, [transactions, incomeEntries, categories, startYear, endYear]);

  // Month-by-month cross year comparison
  const monthComparison = useMemo(() => {
    return compareMonthAcrossYears(
      transactions,
      categories,
      selectedMonthIndex,
      multiYearReport.years,
      selectedCategoryId === 'all_expenses' ? undefined : selectedCategoryId
    );
  }, [transactions, categories, selectedMonthIndex, multiYearReport.years, selectedCategoryId]);

  // Quick Range Presets
  const handleSetPreset = (presetStart: number, presetEnd: number) => {
    setStartYear(presetStart);
    setEndYear(presetEnd);
  };

  // Filter categories in table
  const filteredCategoryComparisons = multiYearReport.categoryComparison.filter((c) => {
    if (selectedGroupFilter === 'all') return true;
    return c.group === selectedGroupFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Range Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Multi-Year Historical Comparison ({startYear} – {endYear})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare spending trends, category growth, and cumulative savings across up to 10 years.
            </p>
          </div>

          {/* Quick Year Range Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
            <button
              onClick={() => handleSetPreset(2024, 2026)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                startYear === 2024 && endYear === 2026 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3 Years (2024–26)
            </button>
            <button
              onClick={() => handleSetPreset(2021, 2026)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                startYear === 2021 && endYear === 2026 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              5 Years (2021–26)
            </button>
            <button
              onClick={() => handleSetPreset(2017, 2026)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                startYear === 2017 && endYear === 2026 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              10 Years (2017–26)
            </button>
          </div>
        </div>

        {/* Custom Start Year / End Year Selectors & Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Custom Dropdowns */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">From Year:</span>
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {allYears.map((y: number) => (
                <option key={y} value={y} disabled={y > endYear}>
                  {y}
                </option>
              ))}
            </select>

            <span className="font-semibold text-slate-700 ml-2">To Year:</span>
            <select
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {allYears.map((y: number) => (
                <option key={y} value={y} disabled={y < startYear}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('annual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Annual Trends & Cumulative</span>
            </button>
            <button
              onClick={() => setActiveSubTab('month-compare')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'month-compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Specific Month Comparison (e.g. May Electricity)</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: ANNUAL TRENDS & CUMULATIVE ACCUMULATION */}
      {activeSubTab === 'annual' && (
        <div className="space-y-6">
          {/* Cumulative Totals Banner ("Savings or expenses until now from 2021 to 2026") */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Cumulative Financial Standing ({startYear} – {endYear})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Aggregated across {multiYearReport.years.length} years
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {/* Total Income Accumulated */}
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
                <span className="text-[11px] text-slate-400 block">Total Income (Until Now)</span>
                <span className="text-lg font-bold text-white tracking-tight mt-1 block">
                  {formatCurrency(multiYearReport.cumulativeTotals.income, currency)}
                </span>
              </div>

              {/* Total Savings Accumulated */}
              <div className="bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block">Total Savings Accumulated</span>
                <span className="text-lg font-bold text-emerald-300 tracking-tight mt-1 block">
                  {formatCurrency(multiYearReport.cumulativeTotals.savings, currency)}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                  Overall Savings Rate: {multiYearReport.cumulativeTotals.savingsRate}%
                </span>
              </div>

              {/* Total Expenses Incurred */}
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
                <span className="text-[11px] text-slate-400 block">Total Living Expenses</span>
                <span className="text-lg font-bold text-slate-200 tracking-tight mt-1 block">
                  {formatCurrency(multiYearReport.cumulativeTotals.expenses - multiYearReport.cumulativeTotals.savings, currency)}
                </span>
              </div>

              {/* Net Surplus Retained */}
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
                <span className="text-[11px] text-slate-400 block">Net Surplus Cushion</span>
                <span className="text-lg font-bold text-emerald-400 tracking-tight mt-1 block">
                  +{formatCurrency(multiYearReport.cumulativeTotals.netBalance, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Year-by-Year Comparison Table & Trend */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Yearly Trajectory & Group Outflow Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Year</th>
                    <th className="px-3 py-2.5 text-right">Income</th>
                    <th className="px-3 py-2.5 text-right text-emerald-700">Savings & SIPs</th>
                    <th className="px-3 py-2.5 text-right text-blue-700">Fixed Living</th>
                    <th className="px-3 py-2.5 text-right text-amber-700">Yearly & Fest</th>
                    <th className="px-3 py-2.5 text-right text-slate-700">Miscellaneous</th>
                    <th className="px-3 py-2.5 text-right font-bold text-slate-900">Total Outflow</th>
                    <th className="px-3 py-2.5 text-right">Net Balance</th>
                    <th className="px-3 py-2.5 text-center">Savings Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {multiYearReport.annualData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-slate-900">{row.year}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(row.income, currency)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">{formatCurrency(row.savings, currency)}</td>
                      <td className="px-3 py-2.5 text-right text-blue-800">{formatCurrency(row.fixed, currency)}</td>
                      <td className="px-3 py-2.5 text-right text-amber-800">{formatCurrency(row.yearly, currency)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{formatCurrency(row.misc, currency)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(row.expenses, currency)}</td>
                      <td className={`px-3 py-2.5 text-right font-bold ${row.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {row.netBalance >= 0 ? '+' : ''}{formatCurrency(row.netBalance, currency)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-700">{row.savingsRate}%</td>
                    </tr>
                  ))}
                  {/* Cumulative Row */}
                  <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900">
                    <td className="px-3 py-3">Cumulative ({startYear}–{endYear})</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(multiYearReport.cumulativeTotals.income, currency)}</td>
                    <td className="px-3 py-3 text-right text-emerald-800">{formatCurrency(multiYearReport.cumulativeTotals.savings, currency)}</td>
                    <td className="px-3 py-3 text-right text-blue-900">{formatCurrency(multiYearReport.cumulativeTotals.fixed, currency)}</td>
                    <td className="px-3 py-3 text-right text-amber-900">{formatCurrency(multiYearReport.cumulativeTotals.yearly, currency)}</td>
                    <td className="px-3 py-3 text-right text-slate-700">{formatCurrency(multiYearReport.cumulativeTotals.misc, currency)}</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(multiYearReport.cumulativeTotals.expenses, currency)}</td>
                    <td className={`px-3 py-3 text-right ${multiYearReport.cumulativeTotals.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                      +{formatCurrency(multiYearReport.cumulativeTotals.netBalance, currency)}
                    </td>
                    <td className="px-3 py-3 text-center text-emerald-800">{multiYearReport.cumulativeTotals.savingsRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Category-by-Category Across Years Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Category Spend & Savings Across Years
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  See how each individual category evolved year by year
                </p>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {(['all', 'savings', 'fixed', 'yearly', 'miscellaneous'] as const).map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroupFilter(grp)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                      selectedGroupFilter === grp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {grp === 'all' ? 'All Groups' : grp}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Group</th>
                    {multiYearReport.years.map((y) => (
                      <th key={y} className="px-3 py-2.5 text-right">{y}</th>
                    ))}
                    <th className="px-3 py-2.5 text-right font-bold text-emerald-800 bg-emerald-50/50">
                      Cumulative Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategoryComparisons.map((row) => (
                    <tr key={row.categoryId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.categoryName}</td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {row.group}
                        </span>
                      </td>
                      {multiYearReport.years.map((y) => (
                        <td key={y} className="px-3 py-2 text-right text-slate-700">
                          {row.valuesByYear[y] > 0 ? formatCurrency(row.valuesByYear[y], currency) : '-'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-bold text-emerald-700 bg-emerald-50/40">
                        {formatCurrency(row.cumulativeTotal, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SPECIFIC MONTH COMPARISON ACROSS YEARS */}
      {/* "like how much I spend on Electricity in last year / last year May month with compare to current year / current year month etc." */}
      {activeSubTab === 'month-compare' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Month-over-Month Multi-Year Deep Dive
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare a specific calendar month (e.g. May) across multiple years to analyze inflation, heat spikes, and seasonal habits.
              </p>
            </div>

            {/* Selectors for Month and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Select Month */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Select Calendar Month to Compare:
                </label>
                <select
                  value={selectedMonthIndex}
                  onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name} {idx === 4 ? '(May - Summer Spike)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Select Category to Compare:
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all_expenses">All Categories (Total Monthly Spend)</option>
                  <optgroup label="Fixed Expenses">
                    <option value="electric_bill">Eletric Bill (Electricity)</option>
                    <option value="petrol">Petrol</option>
                    <option value="maintenance">Maintance</option>
                    <option value="net_bill">Net Bill</option>
                    <option value="liquor_hotel">Liquor, Saoji, Hotel</option>
                    <option value="yashi">Yashi</option>
                    <option value="sasu_amount">Sasu Amount</option>
                  </optgroup>
                  <optgroup label="Savings">
                    <option value="gold">Gold</option>
                    <option value="bc">BC</option>
                    <option value="car_sip">Car SIP</option>
                    <option value="sip_nava_marriage">SIP - Nava Marriage</option>
                  </optgroup>
                  <optgroup label="Yearly">
                    <option value="car_service">Car Service & Insurance</option>
                    <option value="ganpati">Ganpati</option>
                    <option value="party_31st">31 st Party</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Month Comparison Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Average Spend in {monthComparison.monthName}</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(monthComparison.averageAmount, currency)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Across {multiYearReport.years.length} years</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Peak Year for {monthComparison.monthName}</span>
              <div className="text-xl font-bold text-rose-700 mt-1">
                {formatCurrency(monthComparison.highestYear.amount, currency)}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Year: {monthComparison.highestYear.year}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Lowest Year for {monthComparison.monthName}</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(monthComparison.lowestYear.amount, currency)}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Year: {monthComparison.lowestYear.year}</span>
            </div>
          </div>

          {/* Detailed Side-by-Side Table for this Month */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              {monthComparison.categoryName} — {monthComparison.monthName} Comparison Matrix
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Period</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-right">Spend Amount</th>
                    <th className="px-4 py-2.5 text-right">Vs Prior Year</th>
                    <th className="px-4 py-2.5 text-right">% Change</th>
                    <th className="px-4 py-2.5">Trend Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthComparison.dataByYear.map((item, idx) => (
                    <tr key={item.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {monthComparison.monthName} {item.year}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{monthComparison.categoryName}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {idx === 0 ? (
                          <span className="text-slate-400">Baseline</span>
                        ) : item.prevYearDiff && item.prevYearDiff !== 0 ? (
                          <span className={item.prevYearDiff > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                            {item.prevYearDiff > 0 ? '+' : ''}{formatCurrency(item.prevYearDiff, currency)}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {idx === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : item.percentChange !== undefined ? (
                          <span className={item.percentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            {item.percentChange > 0 ? '+' : ''}{item.percentChange}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {idx > 0 && item.prevYearDiff !== undefined && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                            item.prevYearDiff > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {item.prevYearDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{item.prevYearDiff > 0 ? 'Increased' : 'Decreased'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
