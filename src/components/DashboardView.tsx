import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  CalendarRange,
  Wallet,
  PieChart,
} from 'lucide-react';
import { getMonthKeysForYear } from '../data/initialFinanceData';
import { ExpenseCategory, IncomeEntry, IncomeSource, SpendingInsight, Transaction } from '../types/finance';
import { FinanceOverview, formatCurrency } from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';
import { SpendingPieChart } from './SpendingPieChart';

interface DashboardViewProps {
  overview: FinanceOverview;
  activeYear: number;
  activeMonth: string | 'all';
  onSelectMonth: (month: string | 'all') => void;
  categories: ExpenseCategory[];
  incomeSources: IncomeSource[];
  transactions: Transaction[];
  insights: SpendingInsight[];
  currency: string;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenBatchImport: () => void;
  onOpenAddCategory: () => void;
  onNavigateToTab: (tab: 'sheet' | 'transactions' | 'insights' | 'multiyear') => void;
  onQuickAdd: (description: string, amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  activeYear,
  activeMonth,
  onSelectMonth,
  categories,
  incomeSources,
  transactions,
  insights,
  currency,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenBatchImport,
  onOpenAddCategory,
  onNavigateToTab,
  onQuickAdd,
}) => {
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');

  const isAll = activeMonth === 'all';
  const currSummary = !isAll ? overview.monthSummaries[activeMonth] : null;
  const monthKeys = getMonthKeysForYear(activeYear);

  const displayIncome = isAll ? overview.yearTotalIncome : (currSummary?.income || 0);
  const displayExpenses = isAll ? overview.yearTotalExpenses : (currSummary?.totalExpenses || 0);
  const displayNet = isAll ? overview.yearNetBalance : (currSummary?.netBalance || 0);
  const displaySavings = isAll ? overview.yearSavingsTotal : (currSummary?.savingsTotal || 0);
  const displaySavingsRate = isAll ? overview.yearlySavingsRate : (currSummary?.savingsRate || 0);
  const displayDailyAvg = isAll ? overview.dailyAverageSpend : (currSummary?.dailyAverage || 0);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(quickAmount);
    if (quickDesc.trim() && !isNaN(parsedAmt) && parsedAmt > 0) {
      onQuickAdd(quickDesc.trim(), parsedAmt);
      setQuickDesc('');
      setQuickAmount('');
    }
  };

  // Sort categories by expenditure
  const sortedCategories = [...categories].sort((a, b) => {
    const totalA = overview.categoryTotals[a.id]?.total || 0;
    const totalB = overview.categoryTotals[b.id]?.total || 0;
    return totalB - totalA;
  });

  return (
    <div className="space-y-6">
      {/* Active Period & Multi-Year Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isAll ? `FY ${activeYear} Financial Dashboard` : `${activeMonth} Performance`}
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {isAll ? '12 Months' : 'Monthly View'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time calculations, multi-source income tracking (Salary, Shows, etc.), and visual pie chart distribution
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddIncome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ Add Income (Salary / Shows)</span>
          </button>
          <button
            onClick={() => onNavigateToTab('multiyear')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <CalendarRange className="w-3.5 h-3.5 text-emerald-400" />
            <span>10-Year Comparison</span>
          </button>
        </div>
      </div>

      {/* 5 Core Financial KPIs matching user's spreadsheet summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* 1. Total Income */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{isAll ? 'Total Income' : 'Monthly Income'}</span>
            <span className="p-1 rounded bg-sky-50 text-sky-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(displayIncome, currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isAll ? `${activeYear} Year Total` : activeMonth}</span>
            <button
              onClick={onOpenAddIncome}
              className="text-sky-600 font-semibold hover:underline cursor-pointer"
            >
              + Edit
            </button>
          </div>
        </div>

        {/* 2. Total Outflows */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{isAll ? 'Total Expenses' : 'Monthly Expenses'}</span>
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(displayExpenses, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>{displayIncome > 0 ? Math.round((displayExpenses / displayIncome) * 100) : 0}% of income</span>
          </div>
        </div>

        {/* 3. Net Cashflow (Surplus/Deficit) */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          displayNet >= 0
            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
            : 'bg-rose-50/60 border-rose-200/80 text-rose-950'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={displayNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              {displayNet >= 0 ? 'Net Surplus' : 'Net Deficit'}
            </span>
            <span className={`p-1 rounded ${displayNet >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {displayNet >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </span>
          </div>
          <div className={`mt-2 text-xl font-bold tracking-tight ${displayNet >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            {displayNet >= 0 ? '+' : ''}{formatCurrency(displayNet, currency)}
          </div>
          <div className="mt-1 text-[11px] opacity-80">
            <span>{displayNet >= 0 ? 'Retained cash buffer' : 'Draw from reserve needed'}</span>
          </div>
        </div>

        {/* 4. Total Savings & Savings Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Savings</span>
            <span className="p-1 rounded bg-violet-50 text-violet-600">
              <PiggyBank className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(displaySavings, currency)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-semibold truncate">
            <span>{displaySavingsRate}% Savings Rate</span>
          </div>
        </div>

        {/* 5. Daily Burn Velocity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Daily Burn</span>
            <span className="p-1 rounded bg-amber-50 text-amber-600">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(displayDailyAvg, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Per day average</span>
          </div>
        </div>
      </div>

      {/* Fast In-Dashboard Quick-Add Form */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <form onSubmit={handleQuickAddSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 self-start sm:self-center text-xs font-semibold text-emerald-400 whitespace-nowrap">
            <PlusCircle className="w-4 h-4" />
            <span>Quick Add Expense:</span>
          </div>
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Electric Bill 2500, Petrol 1500, Gold 5000..."
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              className="flex-1 bg-slate-800 text-xs text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Amount (or =20+150)"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="w-full sm:w-36 bg-slate-800 text-xs text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={!quickDesc.trim() || !quickAmount.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Full Form
            </button>
          </div>
        </form>
      </div>

      {/* Dedicated Pie Chart & Income Stream Visualizer Component */}
      <SpendingPieChart
        overview={overview}
        categories={categories}
        currency={currency}
      />

      {/* Main Grid: Cashflow Chart & 4 Category Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Cashflow Trend & Matrix Shortcut */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Cashflow Bar Visualizer */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Cash Flow Profile ({activeYear})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any month bar to filter and inspect details
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span>
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  <span>Expenses</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Chart */}
            <div className="pt-2">
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 h-48 items-end border-b border-slate-200 pb-2">
                {monthKeys.map((mKey) => {
                  const mSummary = overview.monthSummaries[mKey];
                  const inc = mSummary?.income || 0;
                  const exp = mSummary?.totalExpenses || 0;
                  const net = mSummary?.netBalance || 0;
                  const maxVal = Math.max(250000, overview.yearTotalIncome / 10 || 100000);

                  const incHeight = inc > 0 ? Math.min(100, Math.max(12, (inc / maxVal) * 100)) : 4;
                  const expHeight = exp > 0 ? Math.min(100, Math.max(12, (exp / maxVal) * 100)) : 4;
                  const isSelected = activeMonth === mKey;

                  return (
                    <button
                      key={mKey}
                      onClick={() => onSelectMonth(mKey)}
                      className={`group relative flex flex-col items-center justify-end h-full p-1 rounded-lg transition-all cursor-pointer ${
                        isSelected ? 'bg-emerald-50/80 ring-1 ring-emerald-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap pointer-events-none">
                        <span className="font-semibold">{mKey}</span>
                        <span>Inc: {formatCurrency(inc, currency)}</span>
                        <span>Exp: {formatCurrency(exp, currency)}</span>
                        <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          Net: {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                        </span>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div
                          style={{ height: `${incHeight}%` }}
                          className="w-1/2 bg-slate-800 rounded-t-xs transition-all group-hover:brightness-110"
                        ></div>
                        <div
                          style={{ height: `${expHeight}%` }}
                          className={`w-1/2 rounded-t-xs transition-all group-hover:brightness-110 ${
                            net < 0 ? 'bg-rose-500' : exp > 0 ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        ></div>
                      </div>

                      <span className={`text-[10px] mt-1.5 font-medium ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                        {mKey.slice(0, 3)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Click any month column to inspect details</span>
                <button
                  onClick={() => onNavigateToTab('sheet')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Spreadsheet Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Insights Box */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Automated Spending Insights
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('insights')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View all analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {insights.slice(0, 3).map((ins) => (
                <div
                  key={ins.id}
                  className="bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-3 text-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {ins.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : ins.type === 'positive' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{ins.title}</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{ins.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Category Groups & Income Sources */}
        <div className="space-y-6">
          {/* Income Sources Widget */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-sky-600" />
                <span>Income Streams</span>
              </h3>
              <button
                onClick={onOpenAddIncome}
                className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
              >
                + Add Stream
              </button>
            </div>

            {overview.yearTotalIncome <= 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No income sources recorded yet. Click &ldquo;+ Add Stream&rdquo; to add Salary, Shows, etc.
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.values(overview.incomeSourceTotals)
                  .filter((s) => s.total > 0)
                  .map((src) => (
                    <div key={src.sourceName} className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span style={{ backgroundColor: src.color }} className="w-2.5 h-2.5 rounded-full"></span>
                        <span className="font-medium text-slate-800">{src.sourceName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{formatCurrency(src.total, currency)}</span>
                        <span className="text-slate-400 ml-1 text-[11px]">({src.percentOfIncome}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Allocation by 4 Groups */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Group-Wise Outflow Summary
            </h3>

            <div className="space-y-3">
              {/* Savings */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-800">Savings Category</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(overview.groupTotals.savings.total, currency)}
                  </span>
                  <span className="text-slate-500 ml-1.5">({overview.groupTotals.savings.percentOfIncome}%)</span>
                </div>
              </div>

              {/* Fixed Expenses */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-medium text-slate-800">Fixed Expenses Category</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(overview.groupTotals.fixed.total, currency)}
                  </span>
                  <span className="text-slate-500 ml-1.5">({overview.groupTotals.fixed.percentOfIncome}%)</span>
                </div>
              </div>

              {/* Yearly Expenses */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-medium text-slate-800">Yearly Expenses Category</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(overview.groupTotals.yearly.total, currency)}
                  </span>
                  <span className="text-slate-500 ml-1.5">({overview.groupTotals.yearly.percentOfIncome}%)</span>
                </div>
              </div>

              {/* Miscellaneous Expenses */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="font-medium text-slate-800">Miscellaneous Category</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(overview.groupTotals.miscellaneous.total, currency)}
                  </span>
                  <span className="text-slate-500 ml-1.5">({overview.groupTotals.miscellaneous.percentOfIncome}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
