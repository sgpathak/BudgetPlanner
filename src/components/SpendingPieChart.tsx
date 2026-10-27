import React, { useState } from 'react';
import { PieChart, Donut, ArrowRight, Layers, DollarSign } from 'lucide-react';
import { ExpenseCategory } from '../types/finance';
import { FinanceOverview, formatCurrency } from '../services/insightsEngine';

interface SpendingPieChartProps {
  overview: FinanceOverview;
  categories: ExpenseCategory[];
  currency: string;
}

type ChartViewMode = 'groups' | 'categories' | 'income_sources';

export const SpendingPieChart: React.FC<SpendingPieChartProps> = ({
  overview,
  categories,
  currency,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('groups');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Prepare data slices based on viewMode
  const slices = React.useMemo(() => {
    if (viewMode === 'groups') {
      const g = overview.groupTotals;
      const total = overview.yearTotalExpenses;
      if (total <= 0) return [];

      return [
        {
          label: 'Savings Category',
          value: g.savings.total,
          percent: g.savings.percentOfExpense,
          color: '#10b981', // emerald
        },
        {
          label: 'Fixed Expenses',
          value: g.fixed.total,
          percent: g.fixed.percentOfExpense,
          color: '#3b82f6', // blue
        },
        {
          label: 'Yearly Expenses',
          value: g.yearly.total,
          percent: g.yearly.percentOfExpense,
          color: '#f59e0b', // amber
        },
        {
          label: 'Miscellaneous',
          value: g.miscellaneous.total,
          percent: g.miscellaneous.percentOfExpense,
          color: '#a855f7', // purple
        },
      ].filter((item) => item.value > 0);
    }

    if (viewMode === 'categories') {
      const total = overview.yearTotalExpenses;
      if (total <= 0) return [];

      const list: Array<{ label: string; value: number; percent: number; color: string }> = [];

      categories.forEach((cat) => {
        const catStat = overview.categoryTotals[cat.id];
        if (catStat && catStat.total > 0) {
          list.push({
            label: cat.name,
            value: catStat.total,
            percent: catStat.percentOfExpense,
            color: cat.color,
          });
        }
      });

      return list.sort((a, b) => b.value - a.value);
    }

    // viewMode === 'income_sources'
    const totalInc = overview.yearTotalIncome;
    if (totalInc <= 0) return [];

    return Object.values(overview.incomeSourceTotals)
      .filter((item) => item.total > 0)
      .map((item) => ({
        label: item.sourceName,
        value: item.total,
        percent: item.percentOfIncome,
        color: item.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [viewMode, overview, categories]);

  const totalValue = slices.reduce((sum, s) => sum + s.value, 0);

  // SVG Donut Path calculations
  const size = 240;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Distribution Analysis (Pie Chart & %)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear visual breakdown of where money is spent or earned
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-center">
          <button
            onClick={() => setViewMode('groups')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              viewMode === 'groups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Group
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              viewMode === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setViewMode('income_sources')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              viewMode === 'income_sources' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income Sources
          </button>
        </div>
      </div>

      {/* Main Chart + Legend Area */}
      {slices.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <PieChart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-slate-600">No data available for chart yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {viewMode === 'income_sources'
              ? 'Add an income source (Salary, Shows, etc.) to view income distribution'
              : 'Add an expense to view category & group pie charts'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
          {/* Donut SVG */}
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {slices.map((slice, index) => {
                const strokeDasharray = `${(slice.value / totalValue) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += slice.value / totalValue;
                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={slice.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
              <span className="text-[11px] font-medium text-slate-400">
                {hoveredIndex !== null ? slices[hoveredIndex]?.label : viewMode === 'income_sources' ? 'Total Income' : 'Total Outflow'}
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                {hoveredIndex !== null
                  ? formatCurrency(slices[hoveredIndex]?.value || 0, currency)
                  : formatCurrency(totalValue, currency)}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 mt-0.5">
                {hoveredIndex !== null
                  ? `${slices[hoveredIndex]?.percent}%`
                  : '100%'}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {slices.map((slice, index) => {
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={slice.label}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`p-2 rounded-lg transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isHovered ? 'bg-slate-100 ring-1 ring-slate-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      style={{ backgroundColor: slice.color }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    ></span>
                    <span className="font-semibold text-slate-800 truncate" title={slice.label}>
                      {slice.label}
                    </span>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="font-bold text-slate-900 block">
                      {formatCurrency(slice.value, currency)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {slice.percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
