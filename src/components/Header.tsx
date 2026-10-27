import React, { useState } from 'react';
import { Plus, FileDown, UploadCloud, User, Calendar, FolderPlus, CalendarPlus } from 'lucide-react';
import { getMonthKeysForYear } from '../data/initialFinanceData';

interface HeaderProps {
  activeYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
  onAddNewYear: () => void;
  activeMonth: string | 'all';
  onSelectMonth: (month: string | 'all') => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  onOpenAddExpense: () => void;
  onOpenExportPdf: () => void;
  onOpenBatchImport: () => void;
  onOpenAddCategory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeYear,
  availableYears,
  onSelectYear,
  onAddNewYear,
  activeMonth,
  onSelectMonth,
  currency,
  onCurrencyChange,
  userName,
  onUserNameChange,
  onOpenAddExpense,
  onOpenExportPdf,
  onOpenBatchImport,
  onOpenAddCategory,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const monthKeys = getMonthKeysForYear(activeYear);
  const nextYear = Math.max(...availableYears) + 1;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUserNameChange(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding and actions */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-white">
                  FinFlow
                </h1>
                <span className="text-xs text-slate-400 font-normal">
                  Personal Finance & Budget Matrix
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {/* Year Selection Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">Sheet:</span>
                  <select
                    value={activeYear}
                    onChange={(e) => onSelectYear(Number(e.target.value))}
                    className="bg-slate-800 text-emerald-400 font-bold border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        FY {y} {y === 2025 ? '(Real Data)' : y === 2026 ? '(Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* + New Year Auto Creator button */}
                <button
                  onClick={onAddNewYear}
                  className="hover:text-emerald-300 text-slate-300 bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title={`Start a new empty sheet for year ${nextYear}`}
                >
                  <CalendarPlus className="w-3 h-3 text-emerald-400" />
                  <span>+ {nextYear}</span>
                </button>

                <span aria-hidden="true">·</span>
                {isEditingName ? (
                  <form onSubmit={handleNameSubmit} className="inline-flex items-center">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleNameSubmit}
                      autoFocus
                      className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs border border-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="hover:text-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Click to change account name"
                  >
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="underline decoration-dotted decoration-slate-500">{userName}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>

            {/* Add Category On-the-Fly */}
            <button
              onClick={onOpenAddCategory}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
              title="Add custom category or subcategory on the fly"
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Category</span>
            </button>

            {/* Smart Import button */}
            <button
              onClick={onOpenBatchImport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
              title="Auto-categorize text or bank messages"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Paste</span>
            </button>

            {/* PDF Report Export button */}
            <button
              onClick={onOpenExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Primary Add Expense CTA */}
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Month Selector Horizontal Scrollbar */}
        <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 mr-2 flex items-center gap-1 font-medium whitespace-nowrap">
            <Calendar className="w-3 h-3 text-slate-400" /> Month:
          </span>

          <button
            onClick={() => onSelectMonth('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeMonth === 'all'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All {activeYear} (12 Mo)
          </button>

          {monthKeys.map((mKey) => {
            const isSelected = activeMonth === mKey;

            return (
              <button
                key={mKey}
                onClick={() => onSelectMonth(mKey)}
                className={`relative px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {mKey}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
