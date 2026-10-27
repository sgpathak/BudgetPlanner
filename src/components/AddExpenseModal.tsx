import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Calculator, Check, Plus, Calendar, Tag } from 'lucide-react';
import { ExpenseCategory, Transaction } from '../types/finance';
import {
  getMonthKey,
  getMonthKeysForYear,
} from '../data/initialFinanceData';
import {
  autoCategorizeTransaction,
  evaluateFormulaOrAmount,
  parseDateToYearMonth,
} from '../services/autoCategorizer';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  defaultMonthKey: string;
  defaultYear?: number;
  availableYears?: number[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onOpenAddCategoryModal: () => void;
  initialData?: Partial<Transaction>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultMonthKey,
  defaultYear = 2026,
  availableYears = [2025, 2026, 2027],
  onAddTransaction,
  onOpenAddCategoryModal,
  initialData,
}) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amountInput, setAmountInput] = useState(
    initialData?.formula ? initialData.formula : initialData?.amount ? String(initialData.amount) : ''
  );
  const [selectedYear, setSelectedYear] = useState<number>(initialData?.year || defaultYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    initialData?.monthIndex !== undefined ? initialData.monthIndex : 9
  );

  // Optional exact date feature requested by user
  const [hasSpecificDate, setHasSpecificDate] = useState<boolean>(Boolean(initialData?.date));
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData?.date || `${defaultYear}-${selectedMonthIndex + 1 < 10 ? '0' + (selectedMonthIndex + 1) : selectedMonthIndex + 1}-10`
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || 'misc_general'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialData?.subcategory || ''
  );
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>(
    initialData?.paymentMethod || 'UPI'
  );

  // Auto-categorization state
  const [autoCategory, setAutoCategory] = useState<ExpenseCategory | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [userOverrodeCategory, setUserOverrodeCategory] = useState(false);

  // Computed formula / amount
  const evalResult = useMemo(() => {
    return evaluateFormulaOrAmount(amountInput);
  }, [amountInput]);

  const monthKeys = useMemo(() => {
    return getMonthKeysForYear(selectedYear);
  }, [selectedYear]);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDescription(initialData.description || '');
        setAmountInput(initialData.formula ? initialData.formula : initialData.amount ? String(initialData.amount) : '');
        setSelectedYear(initialData.year || defaultYear);
        setSelectedMonthIndex(initialData.monthIndex !== undefined ? initialData.monthIndex : 9);
        setSelectedDate(initialData.date || `${defaultYear}-10-10`);
        setHasSpecificDate(Boolean(initialData.date));
        setSelectedCategoryId(initialData.categoryId || categories[0]?.id || 'misc_general');
        setSelectedSubcategory(initialData.subcategory || '');
        setNote(initialData.note || '');
        setPaymentMethod(initialData.paymentMethod || 'UPI');
        setUserOverrodeCategory(true);
      } else {
        setDescription('');
        setAmountInput('');
        setSelectedYear(defaultYear);
        // Extract month index from defaultMonthKey if available
        const mParts = defaultMonthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = monthNames.indexOf(mParts[0]);
        const finalMIdx = mIdx >= 0 ? mIdx : 9;

        setSelectedMonthIndex(finalMIdx);
        const mNumStr = finalMIdx + 1 < 10 ? `0${finalMIdx + 1}` : `${finalMIdx + 1}`;
        setSelectedDate(`${defaultYear}-${mNumStr}-10`);
        setHasSpecificDate(false); // optional by default as requested
        setSelectedSubcategory('');
        setNote('');
        setUserOverrodeCategory(false);
        setAutoCategory(null);
      }
    }
  }, [isOpen, defaultMonthKey, defaultYear, initialData, categories]);

  // Live auto-categorization when description changes
  const handleDescriptionChange = (text: string) => {
    setDescription(text);

    if (!userOverrodeCategory && text.trim().length > 1) {
      const result = autoCategorizeTransaction(text, categories);
      setAutoCategory(result.category);
      setConfidence(result.confidence);

      if (result.confidence >= 0.5) {
        setSelectedCategoryId(result.category.id);
        if (result.category.subcategories && result.category.subcategories.length > 0) {
          setSelectedSubcategory(result.category.subcategories[0]);
        }
      }
    }
  };

  const handleMonthChange = (monthIdx: number) => {
    setSelectedMonthIndex(monthIdx);
    const mNumStr = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
    setSelectedDate(`${selectedYear}-${mNumStr}-10`);
  };

  const handleYearChange = (yr: number) => {
    setSelectedYear(yr);
    const mNumStr = selectedMonthIndex + 1 < 10 ? `0${selectedMonthIndex + 1}` : `${selectedMonthIndex + 1}`;
    setSelectedDate(`${yr}-${mNumStr}-10`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || evalResult.amount <= 0) return;

    const mKey = getMonthKey(selectedMonthIndex, selectedYear);
    const mNumStr = selectedMonthIndex + 1 < 10 ? `0${selectedMonthIndex + 1}` : `${selectedMonthIndex + 1}`;
    const finalDate = hasSpecificDate && selectedDate ? selectedDate : `${selectedYear}-${mNumStr}-01`;

    onAddTransaction({
      description: description.trim(),
      amount: evalResult.amount,
      formula: evalResult.formula,
      categoryId: selectedCategoryId,
      subcategory: selectedSubcategory.trim() || undefined,
      monthKey: mKey,
      year: selectedYear,
      monthIndex: selectedMonthIndex,
      date: finalDate,
      note: note.trim() || undefined,
      paymentMethod,
      isAutoCategorized: !userOverrodeCategory && confidence >= 0.5,
      categoryConfidence: confidence,
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentMonthKey = getMonthKey(selectedMonthIndex, selectedYear);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Expense Entry' : 'Add New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned to: <strong className="text-emerald-700 font-bold">{currentMonthKey}</strong> (FY {selectedYear})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Expense Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Electric Bill, Shell Petrol, Gold SIP, Navashree classes..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />

            {autoCategory && !userOverrodeCategory && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Auto-detected: <strong>{autoCategory.name}</strong> ({autoCategory.group})
                </span>
                <span className="text-emerald-500 ml-auto">({Math.round(confidence * 100)}% match)</span>
              </div>
            )}
          </div>

          {/* Amount with Formula Support */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-800">
                Amount <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Formula supported (e.g. <code className="bg-slate-100 px-1 rounded">=20+210+275</code>)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 4104 or =20+210+275+10"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {evalResult.amount > 0 && (
              <div className="mt-1 text-[11px] text-slate-600 flex items-center justify-between px-1">
                <span>Calculated Total:</span>
                <span className="font-bold text-slate-900 text-xs">
                  ₹{evalResult.amount.toLocaleString()}
                  {evalResult.formula && <span className="text-slate-400 font-normal ml-1">({evalResult.formula})</span>}
                </span>
              </div>
            )}
          </div>

          {/* Year & Month Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Year Selector */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Sheet Year</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Expense Month</label>
              <select
                value={selectedMonthIndex}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {monthKeys.map((mk, idx) => (
                  <option key={mk} value={idx}>{mk}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Past/Specific Date feature as requested */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={hasSpecificDate}
                  onChange={(e) => setHasSpecificDate(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Specify exact date (Optional for past expenses)</span>
                </span>
              </label>
              <span className="text-[10px] text-slate-400">
                {hasSpecificDate ? 'Date included' : 'Month level default'}
              </span>
            </div>

            {hasSpecificDate && (
              <div className="pt-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    const parsed = parseDateToYearMonth(e.target.value);
                    setSelectedYear(parsed.year);
                    setSelectedMonthIndex(parsed.monthIndex);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Select any past date; it will automatically be placed in that month.
                </span>
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-800">Category</label>
              <button
                type="button"
                onClick={onOpenAddCategoryModal}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Custom Category</span>
              </button>
            </div>

            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setUserOverrodeCategory(true);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
            >
              <optgroup label="Savings Category">
                {categories
                  .filter((c) => c.group === 'savings')
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Fixed Expenses Category">
                {categories
                  .filter((c) => c.group === 'fixed')
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Yearly Expenses Category">
                {categories
                  .filter((c) => c.group === 'yearly')
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Miscellaneous Expenses Category">
                {categories
                  .filter((c) => c.group === 'miscellaneous')
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Itemized Remark / Comment <span className="font-normal text-slate-400">(e.g. Just Dial, Swimming Class, Shell Bill)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Just Dial, Water Filter, Puna Bus Ticket"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Payment Mode</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['UPI', 'Cash', 'Bank Transfer', 'Credit Card', 'Debit Card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    paymentMethod === method ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || evalResult.amount <= 0}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : `Add to ${currentMonthKey}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
