import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, DollarSign, Wallet, Sparkles, Check } from 'lucide-react';
import { IncomeEntry, IncomeSource } from '../types/finance';
import { formatCurrency } from '../services/insightsEngine';
import { evaluateFormulaOrAmount } from '../services/autoCategorizer';
import { getMonthKeysForYear, SUPPORTED_YEARS } from '../data/initialFinanceData';

interface ManageIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  monthIndex: number;
  monthKey: string;
  incomeSources: IncomeSource[];
  incomeEntries: IncomeEntry[];
  currency: string;
  onAddIncomeEntry: (entry: Omit<IncomeEntry, 'id'>) => void;
  onDeleteIncomeEntry: (id: string) => void;
  onAddIncomeSource: (source: IncomeSource) => void;
}

export const ManageIncomeModal: React.FC<ManageIncomeModalProps> = ({
  isOpen,
  onClose,
  year,
  monthIndex,
  monthKey,
  incomeSources,
  incomeEntries,
  currency,
  onAddIncomeEntry,
  onDeleteIncomeEntry,
  onAddIncomeSource,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    incomeSources[0]?.id || 'salary'
  );
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');

  // Creating a new source on the fly
  const [isCreatingNewSource, setIsCreatingNewSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  if (!isOpen) return null;

  // Filter entries for this specific year and month
  const currentMonthEntries = incomeEntries.filter(
    (item) => item.year === year && item.monthIndex === monthIndex
  );

  const monthTotal = currentMonthEntries.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    const newSource: IncomeSource = {
      id: `src_${Date.now()}`,
      name: newSourceName.trim(),
      color: '#f59e0b',
      isCustom: true,
    };

    onAddIncomeSource(newSource);
    setSelectedSourceId(newSource.id);
    setNewSourceName('');
    setIsCreatingNewSource(false);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluated = evaluateFormulaOrAmount(amountInput);
    if (evaluated.amount <= 0) return;

    const sourceObj = incomeSources.find((s) => s.id === selectedSourceId);
    const sourceName = sourceObj ? sourceObj.name : 'Income';

    onAddIncomeEntry({
      year,
      monthIndex,
      monthKey,
      sourceId: selectedSourceId,
      sourceName,
      amount: evaluated.amount,
      note: note.trim() || undefined,
      date: `${year}-${monthIndex + 1 < 10 ? '0' + (monthIndex + 1) : monthIndex + 1}-01`,
    });

    setAmountInput('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Manage Income Streams ({monthKey})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add multiple income sources (Salary, Shows, Freelance, etc.)
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
          {/* Month Total Summary Card */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
            <div>
              <span className="text-[11px] font-medium text-emerald-800">
                Total Month Income ({monthKey})
              </span>
              <div className="text-xl font-bold text-emerald-950 mt-0.5">
                {formatCurrency(monthTotal, currency)}
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-md">
              {currentMonthEntries.length} Stream{currentMonthEntries.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* New Source Creator Toggle */}
          {isCreatingNewSource ? (
            <form onSubmit={handleCreateSource} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-900 block text-xs">
                Create New Income Source
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Shows, Consulting, Royalties, Rent..."
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-md text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Save Source
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewSource(false)}
                  className="px-2 py-1.5 text-slate-600 hover:bg-slate-200 rounded-md text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {/* Form: Add Income Entry */}
          <form onSubmit={handleAddEntry} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                + Add Income to {monthKey}
              </span>
              {!isCreatingNewSource && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewSource(true)}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Source Type</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Source Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Income Source
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  {incomeSources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount (or formula)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 150000 or =50000+25000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Note / Description */}
            <div>
              <input
                type="text"
                placeholder="Optional remark (e.g. Pune Stage Show, Bonus, Monthly Salary)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!amountInput.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stream</span>
              </button>
            </div>
          </form>

          {/* Existing Income Streams for this Month */}
          <div>
            <span className="font-bold text-slate-800 block mb-2">
              Current Recorded Streams ({currentMonthEntries.length})
            </span>

            {currentMonthEntries.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg">
                No income entered for {monthKey} yet. Use the form above to add Salary, Shows, etc.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentMonthEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{item.sourceName}</span>
                      </div>
                      {item.note && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {item.note}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.amount, currency)}
                      </span>
                      <button
                        onClick={() => onDeleteIncomeEntry(item.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                        title="Delete stream"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
            className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
