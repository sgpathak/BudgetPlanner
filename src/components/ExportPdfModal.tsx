import React from 'react';
import { X, FileDown, CheckCircle, FileText, Calendar, Sparkles } from 'lucide-react';
import { MONTH_KEYS, MonthKey } from '../data/initialFinanceData';
import { ExpenseCategory, Transaction } from '../types/finance';
import { FinanceOverview, formatCurrency } from '../services/insightsEngine';
import { generateFinancePdfReport, PdfExportOptions } from '../services/pdfGenerator';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: FinanceOverview;
  transactions: Transaction[];
  categories: ExpenseCategory[];
  currentMonth: MonthKey;
  userName: string;
  currency: string;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  overview,
  transactions,
  categories,
  currentMonth,
  userName,
  currency,
}) => {
  const [reportType, setReportType] = React.useState<'full-year' | 'monthly'>('full-year');
  const [selectedMonth, setSelectedMonth] = React.useState<MonthKey>(currentMonth);
  const [accountHolder, setAccountHolder] = React.useState(userName);
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      // Allow UI to render spinner
      setTimeout(() => {
        const options: PdfExportOptions = {
          type: reportType,
          selectedMonth,
          userName: accountHolder,
          currency,
        };
        generateFinancePdfReport(overview, transactions, categories, options);
        setIsGenerating(false);
        onClose();
      }, 300);
    } catch (err) {
      console.error('PDF export error:', err);
      setIsGenerating(false);
    }
  };

  const currMonthSummary = overview.monthSummaries[selectedMonth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export Financial Report to PDF
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate clean, publication-ready PDF statements with tables and metrics
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Report Type Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Select Statement Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Full Year Matrix */}
              <button
                type="button"
                onClick={() => setReportType('full-year')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'full-year'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Full Year 2026 Matrix</span>
                  {reportType === 'full-year' && (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Landscape layout with 12-month spreadsheet matrix, group totals, and annual KPIs.
                </p>
              </button>

              {/* Option 2: Single Month Statement */}
              <button
                type="button"
                onClick={() => setReportType('monthly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Monthly Statement</span>
                  {reportType === 'monthly' && (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Portrait layout with detailed transaction ledger, formulas, notes, and category breakdown.
                </p>
              </button>
            </div>
          </div>

          {/* Month Selector if Monthly statement chosen */}
          {reportType === 'monthly' && (
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Statement Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as MonthKey)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {MONTH_KEYS.map((m: string) => (
                  <option key={m} value={m}>
                    {m} {m === 'Oct-26' ? '(Current Month)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account Holder Name */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Account Holder Name on Report
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Statement Preview Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
              Summary Included in PDF:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Period:</span>
                <span className="font-bold text-slate-900 ml-1.5">
                  {reportType === 'full-year' ? 'Fiscal Year 2026 (12 Months)' : selectedMonth}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Total Outflow:</span>
                <span className="font-bold text-slate-900 ml-1.5">
                  {formatCurrency(
                    reportType === 'full-year'
                      ? overview.yearTotalExpenses
                      : currMonthSummary?.totalExpenses || 0,
                    currency
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Total Income:</span>
                <span className="font-bold text-slate-900 ml-1.5">
                  {formatCurrency(
                    reportType === 'full-year'
                      ? overview.yearTotalIncome
                      : currMonthSummary?.income || 0,
                    currency
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Net Surplus:</span>
                <span className="font-bold text-emerald-700 ml-1.5">
                  {formatCurrency(
                    reportType === 'full-year'
                      ? overview.yearNetBalance
                      : currMonthSummary?.netBalance || 0,
                    currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
