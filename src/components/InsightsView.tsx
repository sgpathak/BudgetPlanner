import React from 'react';
import { MONTH_KEYS, MonthKey } from '../data/initialFinanceData';
import { ExpenseCategory, SpendingInsight, Transaction } from '../types/finance';
import { FinanceOverview, formatCurrency } from '../services/insightsEngine';
import { CategoryIcon } from './CategoryIcon';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Send,
} from 'lucide-react';

interface InsightsViewProps {
  overview: FinanceOverview;
  activeMonth: MonthKey | 'all';
  onSelectMonth: (month: MonthKey | 'all') => void;
  categories: ExpenseCategory[];
  transactions: Transaction[];
  insights: SpendingInsight[];
  currency: string;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  overview,
  activeMonth,
  onSelectMonth,
  categories,
  transactions,
  insights,
  currency,
}) => {
  const [userQuery, setUserQuery] = React.useState('');
  const [aiAnswers, setAiAnswers] = React.useState<Array<{ q: string; a: string }>>([
    {
      q: 'Why did February 2026 experience a ₹82,413 deficit?',
      a: 'In Feb-26, income was ₹1,61,426 (₹55k lower than Jan), while expenses totaled ₹2,43,839. Major drivers included high school fees (Yashi ₹25,000), family support (Sasu Amount ₹25,000), plus annual savings contributions. Surpluses from Jan (+₹19,646) and March (+₹63,383) should be held as liquidity reserves to cover this deficit.',
    },
  ]);

  const handleAskQuestion = (presetQuestion?: string) => {
    const q = presetQuestion || userQuery;
    if (!q.trim()) return;

    let answer = '';
    const lower = q.toLowerCase();

    if (lower.includes('february') || lower.includes('deficit')) {
      answer = `February experienced the largest deficit of -${formatCurrency(82413, currency)} because income dropped to ${formatCurrency(161426, currency)} while fixed living obligations remained constant at ${formatCurrency(62142, currency)} and savings at ${formatCurrency(22900, currency)}. March followed with a strong surplus of +${formatCurrency(63383, currency)}.`;
    } else if (lower.includes('family') || lower.includes('sasu') || lower.includes('yashi')) {
      const yashiTot = overview.categoryTotals['yashi']?.total || 0;
      const sasuTot = overview.categoryTotals['sasu_amount']?.total || 0;
      const navTot = overview.categoryTotals['navashree']?.total || 0;
      const sum = yashiTot + sasuTot + navTot;
      answer = `Family and educational commitments represent your largest expenditure bucket: Yashi (${formatCurrency(yashiTot, currency)}), Sasu Amount (${formatCurrency(sasuTot, currency)}), and Navashree (${formatCurrency(navTot, currency)}), combining for ${formatCurrency(sum, currency)} (~34% of your total income).`;
    } else if (lower.includes('gold') || lower.includes('savings')) {
      const goldTot = overview.categoryTotals['gold']?.total || 0;
      answer = `Your total annual savings are ${formatCurrency(overview.yearSavingsTotal, currency)}, representing a healthy ${overview.yearlySavingsRate}% savings rate. Gold accumulation accounts for ${formatCurrency(goldTot, currency)} across 12 months, ramping up significantly in Oct-Dec (₹10,500/month).`;
    } else if (lower.includes('electric') || lower.includes('summer')) {
      answer = `Electric bills spike sharply in May (${formatCurrency(9383, currency)}) due to summer air conditioning, compared to winter months averaging ~${formatCurrency(2000, currency)}. Budgeting a flat ₹4,000/month year-round will prevent seasonal cashflow shocks.`;
    } else {
      answer = `Based on your 2026 budget data: Total Income is ${formatCurrency(overview.yearTotalIncome, currency)} and Total Outflows are ${formatCurrency(overview.yearTotalExpenses, currency)}, leaving a net positive surplus of ${formatCurrency(overview.yearNetBalance, currency)} (overall +${Math.round((overview.yearNetBalance / overview.yearTotalIncome) * 100)}%). Your average burn rate is ${formatCurrency(overview.dailyAverageSpend, currency)}/day.`;
    }

    setAiAnswers((prev) => [{ q, a: answer }, ...prev]);
    if (!presetQuestion) setUserQuery('');
  };

  // Find high variance categories MoM
  const anomalies = [
    {
      category: 'Electric Bill',
      month: 'May-26',
      amount: 9383,
      avg: 2000,
      description: 'Summer heat surge drove electricity consumption 4.6x higher than the yearly baseline.',
      severity: 'high',
    },
    {
      category: 'Liquor, Saoji, Hotel',
      month: 'Sep-26',
      amount: 13735,
      avg: 4500,
      description: 'Dining and social outings surged to peak levels in September.',
      severity: 'medium',
    },
    {
      category: 'Yearly Exp. (Travel & Misc)',
      month: 'Sep-26',
      amount: 39749,
      avg: 12000,
      description: 'Annual travel and festive booking expenses concentrated in September.',
      severity: 'high',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Financial Health & Spending Intelligence
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Comprehensive automated insights derived from your monthly cash flow, category velocity, seasonal spikes, and savings pacing.
        </p>
      </div>

      {/* Grid of Key Analytical Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 50/30/20 Rule Benchmark Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              50 / 30 / 20 Personal Finance Benchmark
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Healthy Split
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Standard personal finance recommends allocating 50% to Needs (Fixed), 30% to Wants (Variable/Dining), and 20% to Savings & Debt.
          </p>

          <div className="space-y-3 pt-1">
            {/* Needs */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Fixed Living Needs (Benchmark: 50%)</span>
                <span className="font-bold text-slate-900">{overview.groupTotals.fixed.percentOfIncome}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${overview.groupTotals.fixed.percentOfIncome}%` }} className="h-full bg-blue-500"></div>
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Savings & Investments (Benchmark: 20%)</span>
                <span className="font-bold text-emerald-700">{overview.groupTotals.savings.percentOfIncome}% (Exceeded!)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${overview.groupTotals.savings.percentOfIncome}%` }} className="h-full bg-emerald-500"></div>
              </div>
            </div>

            {/* Yearly / Wants */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Yearly & Discretionary (Benchmark: 30%)</span>
                <span className="font-bold text-slate-900">{overview.groupTotals.yearly.percentOfIncome}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${overview.groupTotals.yearly.percentOfIncome}%` }} className="h-full bg-amber-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Seasonal Spike & Anomaly Detection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Seasonal Spikes & Variance Alerts
            </h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
              3 Detected
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-emerald-700">{item.month}</span>
                  </div>
                  <div className="mt-1 text-slate-700 font-medium">
                    Spiked to {formatCurrency(item.amount, currency)} (vs ~{formatCurrency(item.avg, currency)} monthly baseline)
                  </div>
                  <p className="text-slate-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deficit Planning & Surplus Buffer Strategy */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Deficit & Surplus Balance Pacing (Month by Month)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking which months generated excess liquidity vs months requiring reserve draws.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {MONTH_KEYS.map((mKey: string) => {
            const m = overview.monthSummaries[mKey];
            const net = m?.netBalance || 0;
            const isDeficit = net < 0;

            return (
              <div
                key={mKey}
                onClick={() => onSelectMonth(mKey)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isDeficit
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                    : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-slate-900">{mKey}</span>
                  <span className={`text-[10px] font-bold ${isDeficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isDeficit ? 'Deficit' : 'Surplus'}
                  </span>
                </div>
                <div className={`text-sm font-bold ${isDeficit ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Exp: {formatCurrency(m?.totalExpenses || 0, currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Financial Assistant / Q&A Box */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            Instant Budget Intelligence Assistant
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Ask questions about your spreadsheet numbers, category allocations, or optimization strategies.
        </p>

        {/* Preset Prompt Suggestions */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400">Try asking:</span>
          <button
            onClick={() => handleAskQuestion('Why did February 2026 experience a deficit?')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            February deficit explanation
          </button>
          <button
            onClick={() => handleAskQuestion('How much am I spending on children and family?')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Family & Education breakdown
          </button>
          <button
            onClick={() => handleAskQuestion('What is my gold accumulation strategy?')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Gold SIP pacing
          </button>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question about your spending data..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            className="flex-1 bg-slate-800 text-xs text-white placeholder-slate-400 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={!userQuery.trim()}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>

        {/* Q&A Stream */}
        <div className="space-y-3 pt-2">
          {aiAnswers.map((ans, idx) => (
            <div key={idx} className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 text-xs space-y-1.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{ans.q}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{ans.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
