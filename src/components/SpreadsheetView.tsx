import React, { useState } from 'react';
import { getMonthKeysForYear } from '../data/initialFinanceData';
import { ExpenseCategory, ExpenseGroup, MonthlyIncome, Transaction } from '../types/finance';
import { FinanceOverview, formatCurrency } from '../services/insightsEngine';
import { Search, Plus, Filter, FolderPlus, Edit2, Check, X, Wallet } from 'lucide-react';

interface SpreadsheetViewProps {
  overview: FinanceOverview;
  categories: ExpenseCategory[];
  transactions: Transaction[];
  incomes?: MonthlyIncome[];
  activeYear: number;
  activeMonth: string | 'all';
  onSelectMonth: (month: string | 'all') => void;
  currency: string;
  onCellClick: (category: ExpenseCategory, monthKey: string, currentAmount: number) => void;
  onIncomeCellClick: (monthKey: string, monthIndex: number) => void;
  onOpenAddExpense: () => void;
  onOpenAddCategory: () => void;
  onUpdateCategoryName: (categoryId: string, newName: string) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  overview,
  categories,
  transactions,
  activeYear,
  activeMonth,
  onSelectMonth,
  currency,
  onCellClick,
  onIncomeCellClick,
  onOpenAddExpense,
  onOpenAddCategory,
  onUpdateCategoryName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | ExpenseGroup>('all');

  // Inline editing state for left-side category names
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState<string>('');

  const monthKeys = getMonthKeysForYear(activeYear);

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || cat.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const getCellAmount = (categoryId: string, monthKey: string): number => {
    return transactions
      .filter((t) => t.categoryId === categoryId && t.monthKey === monthKey && t.year === activeYear)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCellMetadata = (categoryId: string, monthKey: string) => {
    const txs = transactions.filter(
      (t) => t.categoryId === categoryId && t.monthKey === monthKey && t.year === activeYear
    );
    const hasFormula = txs.some((t) => Boolean(t.formula));
    const hasNote = txs.some((t) => Boolean(t.note));
    return { count: txs.length, hasFormula, hasNote };
  };

  const handleStartRename = (cat: ExpenseCategory) => {
    setEditingCategoryId(cat.id);
    setTempCategoryName(cat.name);
  };

  const handleSaveRename = (catId: string) => {
    if (tempCategoryName.trim()) {
      onUpdateCategoryName(catId, tempCategoryName.trim());
    }
    setEditingCategoryId(null);
  };

  const handleCancelRename = () => {
    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category (e.g. Gold, Electric, Shows)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-56 sm:w-64"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setGroupFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                groupFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Rows
            </button>
            <button
              onClick={() => setGroupFilter('savings')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                groupFilter === 'savings' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Savings
            </button>
            <button
              onClick={() => setGroupFilter('fixed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                groupFilter === 'fixed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fixed Expenses
            </button>
            <button
              onClick={() => setGroupFilter('yearly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                groupFilter === 'yearly' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Expenses
            </button>
            <button
              onClick={() => setGroupFilter('miscellaneous')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                groupFilter === 'miscellaneous' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Miscellaneous
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Create new category or subcategory on the fly"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Category</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Banner Header */}
              <tr className="border-b border-slate-200">
                <th className="bg-rose-500 text-white font-bold px-3 py-2 text-center border-r border-rose-600 w-52">
                  Categories ({activeYear})
                </th>
                <th className="bg-rose-500 text-white font-bold px-2 py-2 text-center border-r border-rose-600 w-24">
                  Yearly
                </th>
                <th className="bg-rose-500 text-white font-bold px-2 py-2 text-center border-r border-rose-600 w-24">
                  Monthly Avg
                </th>
                <th
                  className="bg-rose-500 text-white font-bold px-1.5 py-2 text-center border-r border-slate-300 w-14 cursor-help"
                  title="% of Total Income: (Category Amount / Total Income) * 100"
                >
                  %
                </th>
                {monthKeys.map((mKey) => {
                  const isSelected = activeMonth === mKey;
                  return (
                    <th
                      key={mKey}
                      onClick={() => onSelectMonth(mKey)}
                      className={`px-2 py-2 text-center border-r border-slate-200 font-bold transition-colors cursor-pointer min-w-[76px] ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                      title={`Click to set ${mKey} active`}
                    >
                      {mKey}
                    </th>
                  );
                })}
              </tr>

              {/* Row 2: Top Aggregate Summary Values */}
              <tr className="bg-slate-50 font-semibold border-b border-slate-300 text-slate-800">
                <td className="px-3 py-2 border-r border-slate-200 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Total Expenses</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Per Day: <strong className="text-slate-800 font-bold">{formatCurrency(overview.dailyAverageSpend, currency)}</strong>
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 text-right border-r border-slate-200 font-bold text-slate-900">
                  {formatCurrency(overview.yearTotalExpenses, currency)}
                </td>
                <td className="px-2 py-2 text-right border-r border-slate-200 font-bold text-slate-900">
                  {formatCurrency(overview.monthlyAverageExpenses, currency)}
                </td>
                <td
                  className="px-1.5 py-2 text-center border-r border-slate-300 font-bold text-slate-900 cursor-help"
                  title="Total Expenses as % of Total Annual Income"
                >
                  {overview.yearTotalIncome > 0
                    ? `${(Math.round((overview.yearTotalExpenses / overview.yearTotalIncome) * 10000) / 100).toFixed(1)}%`
                    : '-'}
                </td>
                {monthKeys.map((mKey) => {
                  const total = overview.monthSummaries[mKey]?.totalExpenses || 0;
                  return (
                    <td
                      key={mKey}
                      className="px-2 py-2 text-right border-r border-slate-200 font-bold text-slate-900"
                    >
                      {total > 0 ? formatCurrency(total, currency) : '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Total Income Row (Clickable to manage income streams like Salary, Shows, etc.) */}
              <tr className="bg-sky-50/80 font-semibold border-b border-sky-200 text-sky-950">
                <td className="px-3 py-2 border-r border-sky-200 font-bold">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-sky-600" />
                      <span>Total Income</span>
                    </span>
                    <span className="text-[10px] text-sky-700 bg-sky-100 px-1 rounded font-normal">
                      Click cell to add
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 text-right border-r border-sky-200 font-bold text-sky-900">
                  {formatCurrency(overview.yearTotalIncome, currency)}
                </td>
                <td className="px-2 py-2 text-right border-r border-sky-200 text-sky-800">
                  {formatCurrency(Math.round(overview.yearTotalIncome / 12), currency)}
                </td>
                <td
                  className="px-1.5 py-2 text-center border-r border-sky-200 font-bold text-sky-900 cursor-help"
                  title="Total Income Baseline (100% of income)"
                >
                  {overview.yearTotalIncome > 0 ? '100%' : '-'}
                </td>
                {monthKeys.map((mKey, monthIndex) => {
                  const inc = overview.monthSummaries[mKey]?.income || 0;
                  const streamCount = overview.monthSummaries[mKey]?.incomeEntries?.length || 0;

                  return (
                    <td
                      key={mKey}
                      onClick={() => onIncomeCellClick(mKey, monthIndex)}
                      className="px-2 py-2 text-right border-r border-sky-200 font-bold text-sky-900 hover:bg-sky-100 cursor-pointer transition-colors relative group/inc"
                      title={`Click to manage income streams (Salary, Shows) for ${mKey}`}
                    >
                      {inc > 0 ? (
                        <div>
                          <span>{formatCurrency(inc, currency)}</span>
                          {streamCount > 1 && (
                            <span className="block text-[9px] text-sky-600 font-normal">
                              {streamCount} streams
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sky-300 group-hover/inc:text-sky-600 font-normal">+ Income</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Net Balance (Surplus/Deficit) Row */}
              <tr className="bg-amber-50/80 font-bold border-b-2 border-slate-300 text-slate-900">
                <td className="px-3 py-2 border-r border-amber-200 text-slate-900">
                  Net Balance (Total)
                </td>
                <td className={`px-2 py-2 text-right border-r border-amber-200 ${
                  overview.yearNetBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {overview.yearNetBalance >= 0 ? '+' : ''}{formatCurrency(overview.yearNetBalance, currency)}
                </td>
                <td className={`px-2 py-2 text-right border-r border-amber-200 ${
                  overview.yearNetBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatCurrency(Math.round(overview.yearNetBalance / 12), currency)}
                </td>
                <td className="px-1.5 py-2 text-center border-r border-amber-200">
                  {overview.yearTotalIncome > 0 ? `${Math.round((overview.yearNetBalance / overview.yearTotalIncome) * 100)}%` : '-'}
                </td>
                {monthKeys.map((mKey) => {
                  const net = overview.monthSummaries[mKey]?.netBalance || 0;
                  const hasActivity = (overview.monthSummaries[mKey]?.income || 0) > 0 || (overview.monthSummaries[mKey]?.totalExpenses || 0) > 0;

                  return (
                    <td
                      key={mKey}
                      className={`px-2 py-2 text-right border-r border-amber-200 font-bold ${
                        !hasActivity
                          ? 'text-slate-300'
                          : net >= 0
                          ? 'text-emerald-700 bg-emerald-50/40'
                          : 'text-rose-700 bg-rose-50/60'
                      }`}
                    >
                      {hasActivity ? (net >= 0 ? '+' : '') + formatCurrency(net, currency) : '-'}
                    </td>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* SECTION 1: SAVINGS CATEGORY */}
              {(groupFilter === 'all' || groupFilter === 'savings') && (
                <>
                  <tr className="bg-emerald-100/70 border-y border-emerald-300 text-emerald-950 font-bold">
                    <td className="px-3 py-1.5 border-r border-emerald-200">
                      Savings Category
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-emerald-200 text-emerald-900">
                      {formatCurrency(overview.groupTotals.savings.total, currency)}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-emerald-200 text-emerald-900">
                      {formatCurrency(Math.round(overview.groupTotals.savings.total / 12), currency)}
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-emerald-200 text-emerald-900">
                      {overview.groupTotals.savings.percentOfIncome}%
                    </td>
                    {monthKeys.map((mKey) => (
                      <td
                        key={mKey}
                        className="px-2 py-1.5 text-right border-r border-emerald-200 text-emerald-900 font-semibold"
                      >
                        {overview.monthSummaries[mKey]?.savingsTotal ? formatCurrency(overview.monthSummaries[mKey].savingsTotal, currency) : '-'}
                      </td>
                    ))}
                  </tr>
                  {filteredCategories
                    .filter((c) => c.group === 'savings')
                    .map((cat) => renderCategoryRow(cat))}
                </>
              )}

              {/* SECTION 2: FIXED EXPENSES CATEGORY */}
              {(groupFilter === 'all' || groupFilter === 'fixed') && (
                <>
                  <tr className="bg-blue-100/70 border-y border-blue-300 text-blue-950 font-bold">
                    <td className="px-3 py-1.5 border-r border-blue-200">
                      Fixed Expenses Category
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-blue-200 text-blue-900">
                      {formatCurrency(overview.groupTotals.fixed.total, currency)}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-blue-200 text-blue-900">
                      {formatCurrency(Math.round(overview.groupTotals.fixed.total / 12), currency)}
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-blue-200 text-blue-900">
                      {overview.groupTotals.fixed.percentOfIncome}%
                    </td>
                    {monthKeys.map((mKey) => (
                      <td
                        key={mKey}
                        className="px-2 py-1.5 text-right border-r border-blue-200 text-blue-900 font-semibold"
                      >
                        {overview.monthSummaries[mKey]?.fixedTotal ? formatCurrency(overview.monthSummaries[mKey].fixedTotal, currency) : '-'}
                      </td>
                    ))}
                  </tr>
                  {filteredCategories
                    .filter((c) => c.group === 'fixed')
                    .map((cat) => renderCategoryRow(cat))}
                </>
              )}

              {/* SECTION 3: YEARLY EXPENSES CATEGORY */}
              {(groupFilter === 'all' || groupFilter === 'yearly') && (
                <>
                  <tr className="bg-amber-100/70 border-y border-amber-300 text-amber-950 font-bold">
                    <td className="px-3 py-1.5 border-r border-amber-200">
                      Yearly Expenses Category
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-amber-200 text-amber-900">
                      {formatCurrency(overview.groupTotals.yearly.total, currency)}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-amber-200 text-amber-900">
                      {formatCurrency(Math.round(overview.groupTotals.yearly.total / 12), currency)}
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-amber-200 text-amber-900">
                      {overview.groupTotals.yearly.percentOfIncome}%
                    </td>
                    {monthKeys.map((mKey) => (
                      <td
                        key={mKey}
                        className="px-2 py-1.5 text-right border-r border-amber-200 text-amber-900 font-semibold"
                      >
                        {overview.monthSummaries[mKey]?.yearlyTotal ? formatCurrency(overview.monthSummaries[mKey].yearlyTotal, currency) : '-'}
                      </td>
                    ))}
                  </tr>
                  {filteredCategories
                    .filter((c) => c.group === 'yearly')
                    .map((cat) => renderCategoryRow(cat))}
                </>
              )}

              {/* SECTION 4: MISCELLANEOUS EXPENSES CATEGORY */}
              {(groupFilter === 'all' || groupFilter === 'miscellaneous') && (
                <>
                  <tr className="bg-purple-100/70 border-y border-purple-300 text-purple-950 font-bold">
                    <td className="px-3 py-1.5 border-r border-purple-200">
                      Miscellaneous Expenses Category (On the fly)
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-purple-200 text-purple-900">
                      {formatCurrency(overview.groupTotals.miscellaneous.total, currency)}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-purple-200 text-purple-900">
                      {formatCurrency(Math.round(overview.groupTotals.miscellaneous.total / 12), currency)}
                    </td>
                    <td className="px-1.5 py-1.5 text-center border-r border-purple-200 text-purple-900">
                      {overview.groupTotals.miscellaneous.percentOfIncome}%
                    </td>
                    {monthKeys.map((mKey) => (
                      <td
                        key={mKey}
                        className="px-2 py-1.5 text-right border-r border-purple-200 text-purple-900 font-semibold"
                      >
                        {overview.monthSummaries[mKey]?.miscTotal ? formatCurrency(overview.monthSummaries[mKey].miscTotal, currency) : '-'}
                      </td>
                    ))}
                  </tr>
                  {filteredCategories
                    .filter((c) => c.group === 'miscellaneous')
                    .map((cat) => renderCategoryRow(cat))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function renderCategoryRow(cat: ExpenseCategory) {
    const stat = overview.categoryTotals[cat.id] || { total: 0, monthlyAvg: 0, percentOfIncome: 0 };
    const isEditing = editingCategoryId === cat.id;

    return (
      <tr key={cat.id} className="border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors group/row">
        {/* Left Side Category Name with Inline Rename Option as requested */}
        <td className="px-3 py-2 border-r border-slate-200 font-medium text-slate-800">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 truncate flex-1">
              <span style={{ backgroundColor: cat.color }} className="w-2.5 h-2.5 rounded-full shrink-0"></span>

              {isEditing ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={tempCategoryName}
                    onChange={(e) => setTempCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(cat.id);
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    autoFocus
                    className="w-full px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(cat.id)}
                    className="p-1 hover:bg-emerald-100 text-emerald-700 rounded cursor-pointer"
                    title="Save name"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCancelRename}
                    className="p-1 hover:bg-slate-200 text-slate-500 rounded cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span
                  onDoubleClick={() => handleStartRename(cat)}
                  className="truncate cursor-pointer hover:underline"
                  title="Double click or click pencil to rename category"
                >
                  {cat.name}
                </span>
              )}

              {cat.isCustom && !isEditing && (
                <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-semibold shrink-0">
                  custom
                </span>
              )}
            </div>

            {/* Rename Pencil button */}
            {!isEditing && (
              <button
                onClick={() => handleStartRename(cat)}
                className="opacity-0 group-hover/row:opacity-100 p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded cursor-pointer transition-opacity"
                title="Edit category name"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </td>

        <td className="px-2 py-2 text-right border-r border-slate-200 font-semibold text-slate-900">
          {stat.total > 0 ? formatCurrency(stat.total, currency) : '-'}
        </td>

        <td className="px-2 py-2 text-right border-r border-slate-200 text-slate-600">
          {stat.monthlyAvg > 0 ? formatCurrency(stat.monthlyAvg, currency) : '-'}
        </td>

        <td
          className="px-1.5 py-2 text-center border-r border-slate-200 text-slate-600 font-mono text-[11px] cursor-help"
          title={
            overview.yearTotalIncome > 0
              ? `${cat.name}: ${stat.percentOfIncome}% of total income (${formatCurrency(stat.total, currency)} ÷ ${formatCurrency(overview.yearTotalIncome, currency)} × 100)`
              : `${cat.name}: ${stat.percentOfIncome}% (Total income is ₹0)`
          }
        >
          {stat.percentOfIncome > 0 ? `${stat.percentOfIncome}%` : '-'}
        </td>

        {monthKeys.map((mKey) => {
          const amt = getCellAmount(cat.id, mKey);
          const meta = getCellMetadata(cat.id, mKey);
          const isSelectedMonth = activeMonth === mKey;

          return (
            <td
              key={mKey}
              onClick={() => onCellClick(cat, mKey, amt)}
              className={`px-2 py-2 text-right border-r border-slate-200 font-medium cursor-pointer transition-colors relative group/cell ${
                isSelectedMonth
                  ? 'bg-emerald-50/70 font-semibold text-emerald-950'
                  : amt > 0
                  ? 'text-slate-800 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {amt > 0 ? (
                <div className="flex items-center justify-end gap-1">
                  <span>{amt.toLocaleString()}</span>
                  {meta.hasFormula && (
                    <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 rounded font-mono font-bold" title="Formula">
                      fx
                    </span>
                  )}
                  {meta.hasNote && !meta.hasFormula && (
                    <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded font-bold" title="Note">
                      *
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-300 group-hover/cell:text-emerald-600">+</span>
              )}

              <span className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity text-slate-400">
                <Edit2 className="w-2.5 h-2.5" />
              </span>
            </td>
          );
        })}
      </tr>
    );
  }
};
