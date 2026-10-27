import React from 'react';
import { MONTH_KEYS, MonthKey } from '../data/initialFinanceData';
import { ExpenseCategory, Transaction } from '../types/finance';
import { formatCurrency } from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';
import { Search, Plus, Trash2, Edit2, Download, Filter, Sparkles } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: ExpenseCategory[];
  activeMonth: MonthKey | 'all';
  onSelectMonth: (month: MonthKey | 'all') => void;
  currency: string;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddExpense: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  activeMonth,
  onSelectMonth,
  currency,
  onDeleteTransaction,
  onEditTransaction,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedGroup, setSelectedGroup] = React.useState<'all' | 'savings' | 'fixed' | 'yearly'>('all');

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, ExpenseCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter
      if (activeMonth !== 'all' && tx.monthKey !== activeMonth) return false;

      // Group filter
      const cat = categoryMap.get(tx.categoryId);
      if (selectedGroup !== 'all' && cat?.group !== selectedGroup) return false;

      // Category filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesNote = (tx.note || '').toLowerCase().includes(query);
        const matchesFormula = (tx.formula || '').toLowerCase().includes(query);
        const matchesCat = (cat?.name || '').toLowerCase().includes(query);
        return matchesDesc || matchesNote || matchesFormula || matchesCat;
      }

      return true;
    });
  }, [transactions, activeMonth, selectedGroup, selectedCategory, searchTerm, categoryMap]);

  // Sort by date descending
  const sortedTransactions = React.useMemo(() => {
    return [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  const totalFilteredAmount = sortedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Month', 'Description', 'Category', 'Group', 'Amount', 'Payment Method', 'Formula', 'Notes'];
    const rows = sortedTransactions.map((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      return [
        tx.id,
        tx.date,
        tx.monthKey,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${cat?.name || ''}"`,
        cat?.group || '',
        tx.amount,
        tx.paymentMethod || 'UPI',
        `"${(tx.formula || '').replace(/"/g, '""')}"`,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow-Transactions-${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Transaction Ledger
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Showing {sortedTransactions.length} records</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-900">
                Total: {formatCurrency(totalFilteredAmount, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Download filtered transactions as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Month Dropdown */}
          <select
            value={activeMonth}
            onChange={(e) => onSelectMonth(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All 2026 (Full Year)</option>
            {MONTH_KEYS.map((m: string) => (
              <option key={m} value={m}>
                {m} {m === 'Oct-26' ? '(Current Month)' : ''}
              </option>
            ))}
          </select>

          {/* Group Dropdown */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Groups</option>
            <option value="savings">Savings Category</option>
            <option value="fixed">Fixed Expenses</option>
            <option value="yearly">Yearly Expenses</option>
            <option value="miscellaneous">Miscellaneous Expenses</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.group})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No transactions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Group</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Notes / Formula</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <span className="font-mono text-[11px]">{tx.date}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.monthKey}</span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{tx.description}</div>
                        {tx.isAutoCategorized && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Auto-categorized</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          {cat && <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{cat?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-medium capitalize ${
                          cat?.group === 'savings'
                            ? 'text-emerald-700'
                            : cat?.group === 'fixed'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}>
                          {cat?.group || '-'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {tx.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* Notes / Formula */}
                      <td className="px-4 py-3 text-slate-600 max-w-xs">
                        {tx.formula && (
                          <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block mb-1">
                            {tx.formula}
                          </div>
                        )}
                        {tx.note ? (
                          <div className="text-slate-700 text-xs italic">{tx.note}</div>
                        ) : !tx.formula ? (
                          <span className="text-slate-300">-</span>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
