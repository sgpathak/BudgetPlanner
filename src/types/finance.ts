export type ExpenseGroup = 'savings' | 'fixed' | 'yearly' | 'miscellaneous';

export interface ExpenseCategory {
  id: string;
  name: string;
  group: ExpenseGroup;
  color: string;
  iconName: string;
  description?: string;
  keywords: string[];
  subcategories?: string[];
  isCustom?: boolean;
}

export interface IncomeSource {
  id: string;
  name: string; // e.g. "Salary", "Shows", "Freelance"
  color: string;
  isCustom?: boolean;
}

export interface IncomeEntry {
  id: string;
  year: number;
  monthIndex: number; // 0-11
  monthKey: string; // e.g. 'Jan-26'
  sourceId: string;
  sourceName: string;
  amount: number;
  date?: string;
  note?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  monthKey: string; // e.g. 'Jan-26', 'Feb-26', etc.
  year: number; // e.g. 2026, 2025, 2024
  monthIndex: number; // 0 for Jan, 11 for Dec
  description: string;
  amount: number;
  categoryId: string;
  subcategory?: string;
  formula?: string; // e.g. '=20+210+275+10'
  note?: string;
  paymentMethod?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Debit Card';
  isAutoCategorized?: boolean;
  categoryConfidence?: number;
}

export interface MonthlyIncome {
  year: number;
  monthIndex: number;
  monthKey: string;
  amount: number;
  note?: string;
}

export interface MonthSummary {
  monthKey: string;
  year: number;
  monthIndex: number;
  income: number;
  totalExpenses: number;
  savingsTotal: number;
  fixedTotal: number;
  yearlyTotal: number;
  miscTotal: number;
  netBalance: number;
  savingsRate: number; // percentage
  dailyAverage: number;
  incomeEntries?: IncomeEntry[];
}

export interface SpendingInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'variance';
  title: string;
  message: string;
  monthKey?: string;
  categoryName?: string;
  amountDiff?: number;
  percentChange?: number;
}

export interface CategoryYearSummary {
  categoryId: string;
  categoryName: string;
  group: ExpenseGroup;
  yearTotals: Record<number, number>;
  monthlyTotals: Record<number, Record<number, number>>;
}
