import React from 'react';
import { X, Plus, Trash2, Edit2, Calculator, Tag, Sparkles } from 'lucide-react';
import { ExpenseCategory, Transaction } from '../types/finance';
import { MonthKey } from '../data/initialFinanceData';
import { formatCurrency } from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';

interface CellDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ExpenseCategory | null;
  monthKey: MonthKey | null;
  transactions: Transaction[];
  currency: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const CellDetailsModal: React.FC<CellDetailsModalProps> = ({
  isOpen,
  onClose,
  category,
  monthKey,
  transactions,
  currency,
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
}) => {
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newDesc, setNewDesc] = React.useState('');
  const [newAmount, setNewAmount] = React.useState('');
  const [newNote, setNewNote] = React.useState('');

  if (!isOpen || !category || !monthKey) return null;

  // Contributing transactions to this cell
  const cellTransactions = transactions.filter(
    (t) => t.categoryId === category.id && t.monthKey === monthKey
  );

  const cellTotal = cellTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(parsed) || parsed <= 0) return;

    onAddTransaction({
      description: newDesc.trim(),
      amount: parsed,
      categoryId: category.id,
      monthKey,
      year: parseInt(monthKey.split('-')[1], 10) ? 2000 + parseInt(monthKey.split('-')[1], 10) : 2026,
      monthIndex: 0,
      date: `2026-10-15`,
      note: newNote.trim() || undefined,
      paymentMethod: 'UPI',
    });

    setNewDesc('');
    setNewAmount('');
    setNewNote('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold"
            >
              <CategoryIcon name={category.iconName} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{category.name}</h3>
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  {category.group}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly Cell Record for <strong className="text-slate-900">{monthKey}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-xs block">Month Cell Total</span>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(cellTotal, currency)}
              </span>
            </div>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Form to add another item to this cell */}
          {isAddingNew && (
            <form onSubmit={handleAddNewSubmit} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
              <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Item to {category.name} ({monthKey})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Item description (e.g. Bus ticket, Dinner)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder="Optional remark / comment (e.g. Puna Bus Ticket)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200/50 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 text-white rounded font-medium text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {/* Transactions contributing to this cell */}
          <div>
            <div className="font-semibold text-slate-800 mb-2">
              Constituent Entries ({cellTransactions.length})
            </div>

            {cellTransactions.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg">
                No entries recorded for this cell yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cellTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{tx.description}</div>
                      {tx.formula && (
                        <div className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
                          <Calculator className="w-3 h-3 text-emerald-600" />
                          <span>Formula: {tx.formula}</span>
                        </div>
                      )}
                      {tx.note && (
                        <div className="text-slate-600 italic text-[11px] flex items-center gap-1">
                          <span>Note: &ldquo;{tx.note}&rdquo;</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        {tx.date} · {tx.paymentMethod || 'UPI'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
