/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Receipt,
  Sparkles,
  RotateCcw,
  Plus,
  Check,
  CalendarRange,
  FolderPlus,
  Wallet,
} from 'lucide-react';
import {
  INITIAL_CATEGORIES,
  INITIAL_INCOME_SOURCES,
  generateBlankTransactions,
  getReal2025Transactions,
  generateBlankIncomeEntries,
  getReal2025IncomeEntries,
  getMonthKey,
  getMonthKeysForYear,
} from './data/initialFinanceData';
import { ExpenseCategory, IncomeEntry, IncomeSource, Transaction } from './types/finance';
import {
  calculateFinanceOverview,
  generateSpendingInsights,
  formatCurrency,
} from './services/insightsEngine';
import { autoCategorizeTransaction } from './services/autoCategorizer';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { TransactionsView } from './components/TransactionsView';
import { InsightsView } from './components/InsightsView';
import { MultiYearComparisonView } from './components/MultiYearComparisonView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { ManageIncomeModal } from './components/ManageIncomeModal';
import { CellDetailsModal } from './components/CellDetailsModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { BatchCategorizeModal } from './components/BatchCategorizeModal';

type ActiveTab = 'dashboard' | 'sheet' | 'multiyear' | 'transactions' | 'insights';

export default function App() {
  // Available Years: defaults to 2025 (real data) and 2026 (blank testing). Users can click '+ 2027' etc.
  const [availableYears, setAvailableYears] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('finflow_available_years_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [2025, 2026];
  });

  // 1. Transactions: Real 2025 data + Blank 2026 for user testing
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finflow_transactions_v4');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [...getReal2025Transactions(), ...generateBlankTransactions()];
  });

  // 2. Multi-source Income Entries: Real 2025 data + Blank 2026
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('finflow_income_entries_v4');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [...getReal2025IncomeEntries(), ...generateBlankIncomeEntries()];
  });

  // 3. Income Sources (Salary, Shows, Freelance, etc.)
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    try {
      const saved = localStorage.getItem('finflow_income_sources_v4');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_INCOME_SOURCES;
  });

  // 4. Categories: Customizable, left-side editable, on-the-fly additions
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    try {
      const saved = localStorage.getItem('finflow_categories_v4');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CATEGORIES;
  });

  const [activeYear, setActiveYear] = useState<number>(2026);
  const [activeMonth, setActiveMonth] = useState<string | 'all'>('Oct-26');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currency, setCurrency] = useState<string>('INR');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('finflow_user_name') || 'Saval Pathak';
  });

  // Modal dialog states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isManageIncomeOpen, setIsManageIncomeOpen] = useState(false);
  const [incomeModalMonthKey, setIncomeModalMonthKey] = useState<string>('Oct-26');
  const [incomeModalMonthIndex, setIncomeModalMonthIndex] = useState<number>(9);

  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [inspectingCell, setInspectingCell] = useState<{
    category: ExpenseCategory;
    monthKey: string;
    currentAmount: number;
  } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('finflow_available_years_v4', JSON.stringify(availableYears));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [availableYears]);

  useEffect(() => {
    try {
      localStorage.setItem('finflow_transactions_v4', JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('finflow_income_entries_v4', JSON.stringify(incomeEntries));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [incomeEntries]);

  useEffect(() => {
    try {
      localStorage.setItem('finflow_income_sources_v4', JSON.stringify(incomeSources));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [incomeSources]);

  useEffect(() => {
    try {
      localStorage.setItem('finflow_categories_v4', JSON.stringify(categories));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finflow_user_name', userName);
  }, [userName]);

  // When activeYear changes, sync activeMonth
  const handleSelectYear = (yr: number) => {
    setActiveYear(yr);
    if (activeMonth !== 'all') {
      const monthShort = activeMonth.split('-')[0];
      const yrShort = String(yr).slice(-2);
      setActiveMonth(`${monthShort}-${yrShort}`);
    }
  };

  // Add a new fiscal year (e.g., 2027, 2028) seamlessly
  const handleAddNewYear = () => {
    const nextYear = Math.max(...availableYears) + 1;
    const updated = [...availableYears, nextYear].sort((a, b) => a - b);
    setAvailableYears(updated);
    setActiveYear(nextYear);
    setActiveMonth(getMonthKey(0, nextYear)); // Jan of next year e.g. Jan-27
    showToast(`Started fresh sheet for FY ${nextYear}! Switched to Jan-${String(nextYear).slice(-2)}.`);
  };

  // Calculate overview for activeYear with multi-source income
  const overview = useMemo(() => {
    return calculateFinanceOverview(transactions, incomeEntries, categories, incomeSources, activeYear);
  }, [transactions, incomeEntries, categories, incomeSources, activeYear]);

  // Month keys for active year
  const activeMonthKeys = useMemo(() => {
    return getMonthKeysForYear(activeYear);
  }, [activeYear]);

  const effectiveMonthKey: string =
    activeMonth === 'all' ? activeMonthKeys[9] || activeMonthKeys[0] : activeMonth;

  // Generate spending insights
  const insights = useMemo(() => {
    return generateSpendingInsights(overview, effectiveMonthKey, categories, transactions);
  }, [overview, effectiveMonthKey, categories, transactions]);

  // Handler: Add new transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tx: Transaction = { ...newTx, id };

    setTransactions((prev) => [tx, ...prev]);

    const cat = categories.find((c) => c.id === tx.categoryId);
    showToast(
      `Added ${formatCurrency(tx.amount, currency)} to ${tx.monthKey} · ${cat?.name || 'Expense'}`
    );
  };

  // Handler: Quick add from dashboard
  const handleQuickAdd = (description: string, amount: number) => {
    const catResult = autoCategorizeTransaction(description, categories);
    const targetMonth = activeMonth === 'all' ? getMonthKey(9, activeYear) : activeMonth;
    const monthIdx = activeMonthKeys.indexOf(targetMonth);

    handleAddTransaction({
      description,
      amount,
      categoryId: catResult.category.id,
      monthKey: targetMonth,
      year: activeYear,
      monthIndex: monthIdx >= 0 ? monthIdx : 9,
      date: `${activeYear}-10-15`,
      paymentMethod: 'UPI',
      isAutoCategorized: true,
      categoryConfidence: catResult.confidence,
    });
  };

  // Handler: Add Income Entry (Salary, Shows, etc.)
  const handleAddIncomeEntry = (entry: Omit<IncomeEntry, 'id'>) => {
    const id = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEntry: IncomeEntry = { ...entry, id };

    setIncomeEntries((prev) => [newEntry, ...prev]);
    showToast(`Added ${formatCurrency(entry.amount, currency)} income from ${entry.sourceName} to ${entry.monthKey}`);
  };

  const handleDeleteIncomeEntry = (id: string) => {
    setIncomeEntries((prev) => prev.filter((item) => item.id !== id));
    showToast('Income entry removed');
  };

  const handleAddIncomeSource = (source: IncomeSource) => {
    setIncomeSources((prev) => [...prev, source]);
    showToast(`Created new income stream: "${source.name}"`);
  };

  // Handler: Open income modal for a specific month
  const handleOpenIncomeModalForMonth = (mKey: string, mIdx: number) => {
    setIncomeModalMonthKey(mKey);
    setIncomeModalMonthIndex(mIdx);
    setIsManageIncomeOpen(true);
  };

  // Handler: Rename predefined category on left side as requested
  const handleUpdateCategoryName = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, name: newName } : cat))
    );
    showToast(`Category renamed to "${newName}"`);
  };

  // Handler: Add custom category on the fly
  const handleAddCategory = (newCategory: ExpenseCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newCategory.id);
      if (exists) {
        return prev.map((c) => (c.id === newCategory.id ? newCategory : c));
      }
      return [...prev, newCategory];
    });

    showToast(`Added on-the-fly category: "${newCategory.name}" (${newCategory.group})`);
  };

  // Handler: Edit transaction
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddExpenseOpen(true);
  };

  const handleUpdateTransaction = (updatedTx: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTransaction.id ? { ...updatedTx, id: editingTransaction.id } : t))
    );

    setEditingTransaction(null);
    showToast(`Updated entry for ${updatedTx.monthKey}`);
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Entry removed from ledger');
  };

  // Handler: Batch import
  const handleBatchImport = (importedTxs: Array<Omit<Transaction, 'id'>>) => {
    const newItems: Transaction[] = importedTxs.map((item, idx) => ({
      ...item,
      id: `batch-${Date.now()}-${idx}`,
    }));

    setTransactions((prev) => [...newItems, ...prev]);
    showToast(`Categorized and imported ${newItems.length} expenses into ${activeYear}!`);
  };

  // Reset to initial blank 2026 + real 2025 dataset
  const handleResetData = () => {
    if (window.confirm('Reset data back to your real 2025 statement and blank 2026 sheet?')) {
      const freshTxs = [...getReal2025Transactions(), ...generateBlankTransactions()];
      const freshInc = [...getReal2025IncomeEntries(), ...generateBlankIncomeEntries()];
      setTransactions(freshTxs);
      setIncomeEntries(freshInc);
      setCategories(INITIAL_CATEGORIES);
      setIncomeSources(INITIAL_INCOME_SOURCES);
      setAvailableYears([2025, 2026]);
      localStorage.removeItem('finflow_transactions_v4');
      localStorage.removeItem('finflow_income_entries_v4');
      localStorage.removeItem('finflow_categories_v4');
      localStorage.removeItem('finflow_income_sources_v4');
      localStorage.removeItem('finflow_available_years_v4');
      showToast('Loaded real 2025 data and blanked 2026 sheet for user testing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        activeYear={activeYear}
        availableYears={availableYears}
        onSelectYear={handleSelectYear}
        onAddNewYear={handleAddNewYear}
        activeMonth={activeMonth}
        onSelectMonth={setActiveMonth}
        currency={currency}
        onCurrencyChange={setCurrency}
        userName={userName}
        onUserNameChange={setUserName}
        onOpenAddExpense={() => {
          setEditingTransaction(null);
          setIsAddExpenseOpen(true);
        }}
        onOpenExportPdf={() => setIsExportPdfOpen(true)}
        onOpenBatchImport={() => setIsBatchImportOpen(true)}
        onOpenAddCategory={() => setIsAddCategoryOpen(true)}
      />

      {/* Navigation Sub-Header Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-2 overflow-x-auto no-scrollbar">
            {/* 1. Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard & Pie Charts</span>
            </button>

            {/* 2. Spreadsheet Matrix Tab (1:1 with 4 Category Groups & Rename) */}
            <button
              onClick={() => setActiveTab('sheet')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Budget Sheet Matrix</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                {activeYear} Matrix
              </span>
            </button>

            {/* 3. Multi-Year Comparison Tab */}
            <button
              onClick={() => setActiveTab('multiyear')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'multiyear'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-blue-500" />
              <span>Comparison View</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                {Math.min(...availableYears)}–{Math.max(...availableYears)}
              </span>
            </button>

            {/* 4. Transactions Ledger Tab */}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Transaction Ledger</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                {transactions.filter((t) => t.year === activeYear).length}
              </span>
            </button>

            {/* 5. Spending Insights Tab */}
            <button
              onClick={() => setActiveTab('insights')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Spending Insights</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            overview={overview}
            activeYear={activeYear}
            activeMonth={activeMonth}
            onSelectMonth={setActiveMonth}
            categories={categories}
            incomeSources={incomeSources}
            transactions={transactions}
            insights={insights}
            currency={currency}
            onOpenAddExpense={() => {
              setEditingTransaction(null);
              setIsAddExpenseOpen(true);
            }}
            onOpenAddIncome={() => {
              const currentMKey = activeMonth === 'all' ? activeMonthKeys[9] : activeMonth;
              const idx = activeMonthKeys.indexOf(currentMKey);
              handleOpenIncomeModalForMonth(currentMKey, idx >= 0 ? idx : 9);
            }}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
            onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            onNavigateToTab={setActiveTab}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === 'sheet' && (
          <SpreadsheetView
            overview={overview}
            categories={categories}
            transactions={transactions}
            activeYear={activeYear}
            activeMonth={activeMonth}
            onSelectMonth={setActiveMonth}
            currency={currency}
            onCellClick={(category, monthKey, currentAmount) => {
              setInspectingCell({ category, monthKey, currentAmount });
            }}
            onIncomeCellClick={(monthKey, monthIndex) => {
              handleOpenIncomeModalForMonth(monthKey, monthIndex);
            }}
            onOpenAddExpense={() => {
              setEditingTransaction(null);
              setIsAddExpenseOpen(true);
            }}
            onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            onUpdateCategoryName={handleUpdateCategoryName}
          />
        )}

        {activeTab === 'multiyear' && (
          <MultiYearComparisonView
            transactions={transactions}
            incomeEntries={incomeEntries}
            categories={categories}
            currency={currency}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions.filter((t) => activeMonth === 'all' || t.year === activeYear)}
            categories={categories}
            activeMonth={activeMonth}
            onSelectMonth={setActiveMonth}
            currency={currency}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
            onOpenAddExpense={() => {
              setEditingTransaction(null);
              setIsAddExpenseOpen(true);
            }}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            overview={overview}
            activeMonth={effectiveMonthKey}
            onSelectMonth={setActiveMonth}
            categories={categories}
            transactions={transactions}
            insights={insights}
            currency={currency}
          />
        )}
      </main>

      {/* Clean Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FinFlow Personal Finance</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Source Income & Left-side Category Name Editing</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const currentMKey = activeMonth === 'all' ? activeMonthKeys[9] : activeMonth;
                const idx = activeMonthKeys.indexOf(currentMKey);
                handleOpenIncomeModalForMonth(currentMKey, idx >= 0 ? idx : 9);
              }}
              className="hover:text-sky-700 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Wallet className="w-3 h-3 text-sky-600" />
              <span>Add Income Stream</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="hover:text-purple-700 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <FolderPlus className="w-3 h-3 text-purple-600" />
              <span>Add Category</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="hover:text-slate-800 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
              title="Blank all 2026 months for fresh user entry"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Clear & Blank 2026</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Add Expense Shortcut */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsAddExpenseOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-3.5 shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
        title="Add Expense"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        defaultMonthKey={effectiveMonthKey}
        defaultYear={activeYear}
        availableYears={availableYears}
        onAddTransaction={(tx) => {
          if (editingTransaction) {
            handleUpdateTransaction(tx);
          } else {
            handleAddTransaction(tx);
          }
        }}
        onOpenAddCategoryModal={() => setIsAddCategoryOpen(true)}
        initialData={editingTransaction || undefined}
      />

      {/* Add Category On-the-Fly Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={categories}
        defaultGroup="miscellaneous"
      />

      {/* Manage Multi-Source Income Modal */}
      <ManageIncomeModal
        isOpen={isManageIncomeOpen}
        onClose={() => setIsManageIncomeOpen(false)}
        year={activeYear}
        monthIndex={incomeModalMonthIndex}
        monthKey={incomeModalMonthKey}
        incomeSources={incomeSources}
        incomeEntries={incomeEntries}
        currency={currency}
        onAddIncomeEntry={handleAddIncomeEntry}
        onDeleteIncomeEntry={handleDeleteIncomeEntry}
        onAddIncomeSource={handleAddIncomeSource}
      />

      {/* Spreadsheet Cell Details Inspector Modal */}
      <CellDetailsModal
        isOpen={Boolean(inspectingCell)}
        onClose={() => setInspectingCell(null)}
        category={inspectingCell?.category || null}
        monthKey={inspectingCell?.monthKey || null}
        transactions={transactions}
        currency={currency}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={handleEditTransaction}
      />

      {/* Export to PDF Modal */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        overview={overview}
        transactions={transactions}
        categories={categories}
        currentMonth={effectiveMonthKey}
        userName={userName}
        currency={currency}
      />

      {/* Smart Paste / Batch Import Modal */}
      <BatchCategorizeModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        categories={categories}
        defaultMonth={effectiveMonthKey}
        currency={currency}
        onBatchImport={handleBatchImport}
      />
    </div>
  );
}
