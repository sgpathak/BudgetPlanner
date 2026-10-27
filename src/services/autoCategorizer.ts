import { ExpenseCategory } from '../types/finance';
import { INITIAL_CATEGORIES, getMonthKey } from '../data/initialFinanceData';

export interface CategorizationResult {
  category: ExpenseCategory;
  confidence: number;
  reason: string;
}

// Safely evaluates arithmetic expressions like "=20+210+275+10"
export function evaluateFormulaOrAmount(input: string | number): { amount: number; formula?: string } {
  if (typeof input === 'number') {
    return { amount: isNaN(input) ? 0 : input };
  }

  const cleanInput = input.trim();
  if (!cleanInput) {
    return { amount: 0 };
  }

  const isFormula = cleanInput.startsWith('=') || /[+\-*/]/.test(cleanInput);
  const expr = cleanInput.startsWith('=') ? cleanInput.substring(1) : cleanInput;

  if (/^[0-9.\s+\-*/()]+$/.test(expr)) {
    try {
      const sanitized = expr.replace(/[^0-9.+\-*/()]/g, '');
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const result = new Function(`'use strict'; return (${sanitized})`)();
      const numResult = typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : 0;
      return {
        amount: numResult,
        formula: isFormula ? (cleanInput.startsWith('=') ? cleanInput : `=${cleanInput}`) : undefined,
      };
    } catch {
      const parsed = parseFloat(cleanInput.replace(/[^0-9.]/g, ''));
      return { amount: isNaN(parsed) ? 0 : parsed };
    }
  }

  const fallback = parseFloat(cleanInput.replace(/[^0-9.]/g, ''));
  return { amount: isNaN(fallback) ? 0 : fallback };
}

// Automatically categorizes a transaction based on description
export function autoCategorizeTransaction(
  description: string,
  categories: ExpenseCategory[] = INITIAL_CATEGORIES
): CategorizationResult {
  const text = description.toLowerCase().trim();

  if (!text) {
    const fallback = categories.find((c) => c.id === 'misc_general') || categories[0];
    return {
      category: fallback,
      confidence: 0,
      reason: 'No description provided',
    };
  }

  let bestCategory: ExpenseCategory = categories.find((c) => c.id === 'misc_general') || categories[0];
  let highestScore = 0;
  let matchReason = 'Default categorization';

  for (const cat of categories) {
    let score = 0;
    let matchedWord = '';

    // Check category name itself
    if (text.includes(cat.name.toLowerCase())) {
      score += 0.85;
      matchedWord = cat.name;
    }

    // Check subcategories if any
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        if (text.includes(sub.toLowerCase())) {
          score += 0.95;
          matchedWord = sub;
        }
      }
    }

    // Check configured keywords
    for (const kw of cat.keywords) {
      const lowerKw = kw.toLowerCase();
      if (text.includes(lowerKw)) {
        const regex = new RegExp(`\\b${escapeRegExp(lowerKw)}\\b`, 'i');
        if (regex.test(text)) {
          score += 0.9;
        } else {
          score += 0.6;
        }
        matchedWord = kw;
      }
    }

    // Specific domain heuristics
    if (cat.id === 'petrol' && (text.includes('hp') || text.includes('fuel') || text.includes('pump') || text.includes('cng'))) {
      score += 0.85;
      matchedWord = 'fuel/petrol';
    }
    if (cat.id === 'electric_bill' && (text.includes('power') || text.includes('bijli') || text.includes('msedcl') || text.includes('light bill'))) {
      score += 0.9;
      matchedWord = 'electricity/power';
    }
    if (cat.id === 'liquor_hotel' && (text.includes('food') || text.includes('swiggy') || text.includes('zomato') || text.includes('restaurant') || text.includes('saoji') || text.includes('bus ticket'))) {
      score += 0.8;
      matchedWord = 'dining/social';
    }
    if (cat.id === 'net_bill' && (text.includes('wifi') || text.includes('broadband') || text.includes('fiber'))) {
      score += 0.85;
      matchedWord = 'internet/wifi';
    }
    if (cat.id === 'party_31st' && (text.includes('31st') || text.includes('new year'))) {
      score += 0.95;
      matchedWord = '31st celebration';
    }
    if (cat.id === 'ganpati' && (text.includes('ganesh') || text.includes('modak') || text.includes('puja'))) {
      score += 0.95;
      matchedWord = 'ganpati festival';
    }
    if (cat.id === 'car_sip' && (text.includes('car') && text.includes('sip'))) {
      score += 0.95;
      matchedWord = 'car sip';
    }
    if (cat.id === 'sip_nava_marriage' && (text.includes('nava') || text.includes('marriage'))) {
      score += 0.95;
      matchedWord = 'nava marriage fund';
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = cat;
      matchReason = `Matched "${matchedWord}"`;
    }
  }

  const finalConfidence = Math.min(1, Math.round(highestScore * 100) / 100);

  return {
    category: bestCategory,
    confidence: finalConfidence,
    reason: matchReason,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Convert date string YYYY-MM-DD to year, monthIndex, monthKey
export function parseDateToYearMonth(dateInput: string): { year: number; monthIndex: number; monthKey: string } {
  const parts = dateInput.split('-');
  if (parts.length >= 2) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
      return {
        year: y,
        monthIndex: m,
        monthKey: getMonthKey(m, y),
      };
    }
  }

  // Fallback to 2026 Oct
  return {
    year: 2026,
    monthIndex: 9,
    monthKey: getMonthKey(9, 2026),
  };
}

export interface ParsedBatchItem {
  id: string;
  rawText: string;
  date: string;
  year: number;
  monthIndex: number;
  monthKey: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  confidence: number;
}

export function parseBatchExpenseText(
  rawInput: string,
  targetYear: number = 2026,
  targetMonthIndex: number = 9,
  categories: ExpenseCategory[] = INITIAL_CATEGORIES
): ParsedBatchItem[] {
  const lines = rawInput.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: ParsedBatchItem[] = [];
  const monthKey = getMonthKey(targetMonthIndex, targetYear);
  const monthStr = targetMonthIndex + 1 < 10 ? `0${targetMonthIndex + 1}` : `${targetMonthIndex + 1}`;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const amountMatch = line.match(/(?:(?:rs\.?|inr|₹)\s*)?([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i);
    let amount = 0;
    let description = line;

    if (amountMatch) {
      const numStr = amountMatch[1].replace(/,/g, '');
      const parsed = parseFloat(numStr);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        description = line.replace(amountMatch[0], '').replace(/[#\-,:;]/g, ' ').trim();
      }
    }

    if (!description) {
      description = `Expense item ${i + 1}`;
    }

    const catResult = autoCategorizeTransaction(description, categories);

    items.push({
      id: `batch-${Date.now()}-${i}`,
      rawText: line,
      date: `${targetYear}-${monthStr}-${Math.min(28, 10 + (i % 15))}`,
      year: targetYear,
      monthIndex: targetMonthIndex,
      monthKey,
      description,
      amount,
      category: catResult.category,
      confidence: catResult.confidence,
    });
  }

  return items;
}
