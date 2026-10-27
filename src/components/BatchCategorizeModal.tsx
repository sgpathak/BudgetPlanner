import React from 'react';
import { X, Sparkles, UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react';
import { ExpenseCategory, Transaction } from '../types/finance';
import { MonthKey, MONTH_KEYS } from '../data/initialFinanceData';
import { parseBatchExpenseText, ParsedBatchItem } from '../services/autoCategorizer';
import { formatCurrency } from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';

interface BatchCategorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  defaultMonth: MonthKey;
  currency: string;
  onBatchImport: (transactions: Array<Omit<Transaction, 'id'>>) => void;
}

export const BatchCategorizeModal: React.FC<BatchCategorizeModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultMonth,
  currency,
  onBatchImport,
}) => {
  const [targetMonth, setTargetMonth] = React.useState<MonthKey>(defaultMonth);
  const [inputText, setInputText] = React.useState(
`Shell Petrol Pump 2200
MSEDCL Electricity Power Bill 3150
Saoji Bhojnalaya dinner with family 1450
Airtel Fiber Broadband Net Bill 970
Apollo Diagnostics Blood Test 1200
Tanishq Gold accumulation 4400`
  );
  const [parsedItems, setParsedItems] = React.useState<ParsedBatchItem[]>([]);

  const parseMonthKey = (mKey: string) => {
    const parts = mKey.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = monthNames.indexOf(parts[0]);
    const yr = parts[1] ? 2000 + parseInt(parts[1], 10) : 2026;
    return { year: isNaN(yr) ? 2026 : yr, monthIndex: monthIdx >= 0 ? monthIdx : 9 };
  };

  React.useEffect(() => {
    if (isOpen) {
      setTargetMonth(defaultMonth);
      const { year, monthIndex } = parseMonthKey(defaultMonth);
      const parsed = parseBatchExpenseText(inputText, year, monthIndex, categories);
      setParsedItems(parsed);
    }
  }, [isOpen, defaultMonth]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    const { year, monthIndex } = parseMonthKey(targetMonth);
    const parsed = parseBatchExpenseText(text, year, monthIndex, categories);
    setParsedItems(parsed);
  };

  const handleMonthChange = (month: MonthKey) => {
    setTargetMonth(month);
    const { year, monthIndex } = parseMonthKey(month);
    const parsed = parseBatchExpenseText(inputText, year, monthIndex, categories);
    setParsedItems(parsed);
  };

  const handleUpdateItemCategory = (itemId: string, newCatId: string) => {
    const newCat = categories.find((c) => c.id === newCatId);
    if (!newCat) return;

    setParsedItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, category: newCat, confidence: 1 } : item))
    );
  };

  const handleImport = () => {
    const validItems = parsedItems.filter((item) => item.amount > 0);
    if (validItems.length === 0) return;

    const txs: Array<Omit<Transaction, 'id'>> = validItems.map((item) => ({
      description: item.description,
      amount: item.amount,
      categoryId: item.category.id,
      monthKey: item.monthKey,
      year: item.year,
      monthIndex: item.monthIndex,
      date: item.date,
      paymentMethod: 'UPI',
      isAutoCategorized: true,
      categoryConfidence: item.confidence,
      note: 'Imported via Smart Paste',
    }));

    onBatchImport(txs);
    onClose();
  };

  if (!isOpen) return null;

  const totalAmount = parsedItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Smart Paste & Auto-Categorize
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste bank SMS alerts, UPI notes, or unformatted text to categorize in bulk
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
          {/* Target Month */}
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-800">
              Target Month for Import:
            </label>
            <select
              value={targetMonth}
              onChange={(e) => handleMonthChange(e.target.value as MonthKey)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {MONTH_KEYS.map((m: string) => (
                <option key={m} value={m}>
                  {m} {m === 'Oct-26' ? '(Current Month)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Text Area */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Raw Text / SMS Snippets (One expense per line)
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste expenses here..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Live Categorized Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800">
                Live Auto-Categorized Items ({parsedItems.length})
              </span>
              <span className="font-bold text-emerald-700 text-xs">
                Total: {formatCurrency(totalAmount, currency)}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
              {parsedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="text-emerald-700 font-medium">
                        {Math.round(item.confidence * 100)}% match
                      </span>
                      <span>·</span>
                      <span className="text-slate-400 capitalize">{item.category.group}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={item.category.id}
                      onChange={(e) => handleUpdateItemCategory(item.id, e.target.value)}
                      className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <span className="font-bold text-slate-900 w-20 text-right">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            Will be added directly into <strong>{targetMonth}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={parsedItems.length === 0}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {parsedItems.length} Expenses</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
