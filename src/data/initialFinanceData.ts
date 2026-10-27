import { ExpenseCategory, IncomeEntry, IncomeSource, Transaction } from '../types/finance';

// Supported & active years. Users can create new years (2027, 2028, etc.) dynamically!
export const DEFAULT_YEARS = [2025, 2026] as const;
export const SUPPORTED_YEARS = [2025, 2026] as const;

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

export function getMonthKey(monthIndex: number, year: number): string {
  const shortName = MONTH_NAMES_SHORT[monthIndex];
  const shortYear = String(year).slice(-2);
  return `${shortName}-${shortYear}`;
}

export function getMonthKeysForYear(year: number): string[] {
  return MONTH_NAMES_SHORT.map((_, idx) => getMonthKey(idx, year));
}

export const MONTH_KEYS: string[] = getMonthKeysForYear(2026);
export type MonthKey = string;

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;


export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Default Income Sources
export const INITIAL_INCOME_SOURCES: IncomeSource[] = [
  { id: 'salary', name: 'Salary', color: '#10b981' },
  { id: 'shows', name: 'Shows', color: '#f59e0b' },
  { id: 'freelance', name: 'Freelance & Consulting', color: '#06b6d4' },
  { id: 'investments', name: 'Investments & Returns', color: '#8b5cf6' },
  { id: 'other_income', name: 'Other Income', color: '#64748b' },
];

// Unified categories covering both 2025 real sheet & 2026 tracking
export const INITIAL_CATEGORIES: ExpenseCategory[] = [
  // 1. Savings Category
  {
    id: 'sip',
    name: 'SIP',
    group: 'savings',
    color: '#059669',
    iconName: 'PiggyBank',
    description: 'Mutual fund SIP investments',
    keywords: ['sip', 'nava marriage', 'car sip', 'mutual fund'],
  },
  {
    id: 'my_saving',
    name: 'My Saving',
    group: 'savings',
    color: '#10b981',
    iconName: 'Landmark',
    description: 'Personal savings reserve',
    keywords: ['my saving', 'personal saving'],
  },
  {
    id: 'gold',
    name: 'Gold',
    group: 'savings',
    color: '#eab308',
    iconName: 'Coins',
    description: 'Gold accumulation & SGB',
    keywords: ['gold', 'tanishq', 'kalyan', 'jewel', 'bullion'],
  },
  {
    id: 'bc',
    name: 'BC',
    group: 'savings',
    color: '#14b8a6',
    iconName: 'Users',
    description: 'Bishi / Chit committee fund',
    keywords: ['bc', 'bishi', 'chit', 'committee'],
  },
  {
    id: 'policy_savings',
    name: 'Policy',
    group: 'savings',
    color: '#06b6d4',
    iconName: 'ShieldCheck',
    description: 'LIC & endowment policy savings',
    keywords: ['policy', 'lic', 'insurance saving'],
  },
  {
    id: 'wainganga',
    name: 'Wainganga',
    group: 'savings',
    color: '#6366f1',
    iconName: 'Landmark',
    description: 'Wainganga cooperative bank fund',
    keywords: ['wainganga', 'cooperative'],
  },
  {
    id: 'fd',
    name: 'FD',
    group: 'savings',
    color: '#8b5cf6',
    iconName: 'Landmark',
    description: 'Fixed Deposits in Bank',
    keywords: ['fd', 'fixed deposit'],
  },
  {
    id: 'old_age',
    name: 'Old Age',
    group: 'savings',
    color: '#a855f7',
    iconName: 'PiggyBank',
    description: 'Retirement & pension fund',
    keywords: ['old age', 'retirement', 'pension'],
  },
  {
    id: 'bonus',
    name: 'Bonus',
    group: 'savings',
    color: '#3b82f6',
    iconName: 'Coins',
    description: 'Bonus allocation',
    keywords: ['bonus'],
  },

  // 2. Fixed Expenses Category
  {
    id: 'yashi',
    name: 'Yashi',
    group: 'fixed',
    color: '#3b82f6',
    iconName: 'GraduationCap',
    description: 'Education & student allowance',
    keywords: ['yashi', 'tuition', 'school fee', 'college fee'],
  },
  {
    id: 'navashree',
    name: 'Navashree',
    group: 'fixed',
    color: '#0284c7',
    iconName: 'BookOpen',
    description: 'Classes & coaching expenses',
    keywords: ['navashree', 'classes', 'coaching'],
  },
  {
    id: 'kamwali_bai',
    name: 'Kamwali Bai',
    group: 'fixed',
    color: '#ec4899',
    iconName: 'HeartHandshake',
    description: 'Domestic household helper salary',
    keywords: ['kamwali', 'maid', 'helper', 'bai'],
  },
  {
    id: 'electric_bill',
    name: 'Eletric Bill',
    group: 'fixed',
    color: '#f59e0b',
    iconName: 'Zap',
    description: 'Electricity utility power bill',
    keywords: ['electric', 'electricity', 'msedcl', 'power bill', 'bijli'],
  },
  {
    id: 'maintenance',
    name: 'Maintance',
    group: 'fixed',
    color: '#64748b',
    iconName: 'Building2',
    description: 'Society maintenance charges',
    keywords: ['maintance', 'maintenance', 'society dues'],
  },
  {
    id: 'net_bill',
    name: 'Net Bill',
    group: 'fixed',
    color: '#0ea5e9',
    iconName: 'Wifi',
    description: 'Broadband internet & fiber',
    keywords: ['net bill', 'wifi', 'internet', 'broadband', 'airtel fiber'],
  },
  {
    id: 'petrol',
    name: 'Petrol',
    group: 'fixed',
    color: '#ef4444',
    iconName: 'Fuel',
    description: 'Fuel for car & bike',
    keywords: ['petrol', 'fuel', 'diesel', 'shell', 'bpcl', 'hpcl'],
  },
  {
    id: 'medicines',
    name: 'Medicines',
    group: 'fixed',
    color: '#e11d48',
    iconName: 'Stethoscope',
    description: 'Pharmacy, prescriptions, health',
    keywords: ['medicines', 'pharmacy', 'medical shop', 'tablets'],
  },
  {
    id: 'liquor_hotel',
    name: 'Liquor, Saoji, Snacks',
    group: 'fixed',
    color: '#f97316',
    iconName: 'UtensilsCrossed',
    description: 'Dining out, Saoji restaurants, social snacks',
    keywords: ['saoji', 'liquor', 'hotel', 'snacks', 'restaurant', 'swiggy', 'zomato'],
  },
  {
    id: 'home_loan',
    name: 'Home Loan',
    group: 'fixed',
    color: '#475569',
    iconName: 'Building2',
    description: 'Monthly home mortgage EMI',
    keywords: ['home loan', 'housing loan', 'emi loan'],
  },
  {
    id: 'sasu_amount',
    name: 'Sasu Amount',
    group: 'fixed',
    color: '#ec4899',
    iconName: 'HeartHandshake',
    description: 'Family & parents financial support',
    keywords: ['sasu', 'mother', 'in-laws', 'parents support'],
  },
  {
    id: 'grooming',
    name: 'Grooming',
    group: 'fixed',
    color: '#a855f7',
    iconName: 'Scissors',
    description: 'Haircut, salon & grooming',
    keywords: ['grooming', 'haircut', 'salon', 'barber'],
  },
  {
    id: 'car_wash',
    name: 'Car Wash',
    group: 'fixed',
    color: '#14b8a6',
    iconName: 'Car',
    description: 'Vehicle cleaning & wash',
    keywords: ['car wash', 'bike wash', 'vehicle clean'],
  },
  {
    id: 'modak',
    name: 'Modak',
    group: 'fixed',
    color: '#eab308',
    iconName: 'Tag',
    description: 'Special sweets & treats',
    keywords: ['modak'],
  },
  {
    id: 'gym',
    name: 'GYM',
    group: 'fixed',
    color: '#84cc16',
    iconName: 'Dumbbell',
    description: 'Gym membership & workout',
    keywords: ['gym', 'fitness', 'workout'],
  },

  // 3. Yearly Expenses Category
  {
    id: 'car_service',
    name: 'Car Servicing',
    group: 'yearly',
    color: '#475569',
    iconName: 'Wrench',
    description: 'Car service, maintenance & insurance',
    keywords: ['car servicing', 'car insurance', 'tyres'],
  },
  {
    id: 'blood_test',
    name: 'Blood Test',
    group: 'yearly',
    color: '#dc2626',
    iconName: 'Stethoscope',
    description: 'Health checkups & diagnostics',
    keywords: ['blood test', 'pathology', 'lab'],
  },
  {
    id: 'birthday',
    name: 'Brithday',
    group: 'yearly',
    color: '#ec4899',
    iconName: 'CalendarRange',
    description: 'Birthday celebrations & gifts',
    keywords: ['brithday', 'birthday', 'cake'],
  },
  {
    id: 'mobile_recharge',
    name: 'Mobile Recharge',
    group: 'yearly',
    color: '#0284c7',
    iconName: 'Wifi',
    description: 'Mobile recharge plans',
    keywords: ['mobile recharge', 'phone recharge'],
  },
  {
    id: 'party_31st',
    name: '31 st Party',
    group: 'yearly',
    color: '#8b5cf6',
    iconName: 'UtensilsCrossed',
    description: 'New year 31st party',
    keywords: ['31 st party', '31st party', 'new year'],
  },
  {
    id: 'rakhi',
    name: 'Rakhi',
    group: 'yearly',
    color: '#f59e0b',
    iconName: 'HeartHandshake',
    description: 'Raksha Bandhan gifts',
    keywords: ['rakhi', 'raksha bandhan'],
  },
  {
    id: 'yashi_website',
    name: 'Yashi Website',
    group: 'yearly',
    color: '#6366f1',
    iconName: 'Landmark',
    description: 'Website & online portal for Yashi',
    keywords: ['yashi website'],
  },
  {
    id: 'domain',
    name: 'Domain',
    group: 'yearly',
    color: '#4f46e5',
    iconName: 'Landmark',
    description: 'Domain registrations & renewals',
    keywords: ['domain', 'godaddy', 'namecheap'],
  },
  {
    id: 'website',
    name: 'Website',
    group: 'yearly',
    color: '#3b82f6',
    iconName: 'Landmark',
    description: 'Website hosting & server costs',
    keywords: ['website', 'hosting', 'server'],
  },
  {
    id: 'ganpati',
    name: 'Ganpati',
    group: 'yearly',
    color: '#f97316',
    iconName: 'CalendarRange',
    description: 'Ganesh Utsav festival expenses',
    keywords: ['ganpati', 'ganesh', 'utsav'],
  },
  {
    id: 'diwali_padwa',
    name: 'Diwali Padwa',
    group: 'yearly',
    color: '#f59e0b',
    iconName: 'HeartHandshake',
    description: 'Diwali & Padwa festive gifts',
    keywords: ['diwali padwa', 'diwali', 'padwa'],
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    group: 'yearly',
    color: '#f43f5e',
    iconName: 'HeartHandshake',
    description: 'Wedding anniversary celebration',
    keywords: ['anniversary'],
  },
  {
    id: 'policy_yearly',
    name: 'Policy',
    group: 'yearly',
    color: '#06b6d4',
    iconName: 'ShieldCheck',
    description: 'Annual policy renewal',
    keywords: ['policy yearly', 'annual policy'],
  },
  {
    id: 'car_wiper',
    name: 'Car Wiper',
    group: 'yearly',
    color: '#64748b',
    iconName: 'Wrench',
    description: 'Car wiper blades & accessories',
    keywords: ['car wiper'],
  },

  // 4. Miscellaneous Expenses Category
  {
    id: 'misc_general',
    name: 'Miscellaneous Exp.',
    group: 'miscellaneous',
    color: '#64748b',
    iconName: 'Tag',
    description: 'Ad-hoc and on-the-fly household items',
    keywords: ['misc', 'miscellaneous', 'just dial'],
  },
];

// REAL 2025 INCOME FROM USER'S SPREADSHEET
export function getReal2025IncomeEntries(): IncomeEntry[] {
  const raw2025Income: number[] = [
    130000, 220170, 155000, 247000, 183334, 173426,
    178424, 161424, 161424, 176424, 203424, 161424
  ];

  return raw2025Income.map((amount, monthIndex) => ({
    id: `inc-2025-${monthIndex}`,
    year: 2025,
    monthIndex,
    monthKey: getMonthKey(monthIndex, 2025),
    sourceId: 'salary',
    sourceName: 'Total Income',
    amount,
    date: `2025-${monthIndex + 1 < 10 ? '0' + (monthIndex + 1) : monthIndex + 1}-01`,
    note: 'Monthly Income',
  }));
}

// REAL 2025 EXPENSES FROM USER'S SPREADSHEET
export function getReal2025Transactions(): Transaction[] {
  const txs: Transaction[] = [];
  let id = 1;

  const addTx = (catId: string, monthIndex: number, amount: number, note?: string) => {
    if (amount <= 0) return;
    txs.push({
      id: `tx-2025-${id++}`,
      year: 2025,
      monthIndex,
      monthKey: getMonthKey(monthIndex, 2025),
      date: `2025-${monthIndex + 1 < 10 ? '0' + (monthIndex + 1) : monthIndex + 1}-10`,
      description: note || 'Monthly allocation',
      amount,
      categoryId: catId,
      note,
      paymentMethod: 'UPI',
    });
  };

  // Savings
  const sipByMonth = [0, 0, 13000, 15500, 18000, 0, 0, 18000, 16500, 16500, 18000, 18000];
  const goldByMonth = [3200, 2200, 5200, 2200, 2200, 2200, 2200, 2200, 2200, 7200, 4400, 4400];
  const bcByMonth = [2500, 2500, 2500, 2500, 0, 2500, 2500, 2500, 3000, 3000, 0, 3000];
  const policyByMonth = [5589, 0, 0, 5881, 24610, 0, 5589, 0, 0, 0, 6365, 0];
  const waingangaByMonth = [0, 7000, 0, 0, 0, 0, 0, 6500, 0, 0, 25000, 0];
  const fdByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30000];

  for (let m = 0; m < 12; m++) {
    addTx('sip', m, sipByMonth[m], 'SIP Investment');
    addTx('gold', m, goldByMonth[m], 'Gold accumulation');
    addTx('bc', m, bcByMonth[m], 'BC Committee');
    addTx('policy_savings', m, policyByMonth[m], 'Policy premium');
    addTx('wainganga', m, waingangaByMonth[m], 'Wainganga fund');
    addTx('fd', m, fdByMonth[m], 'Fixed Deposit');
  }

  // Fixed Expenses
  const yashiByMonth = [13000, 18000, 9500, 9000, 10500, 4000, 12000, 10000, 17800, 21000, 26000, 29000];
  const navashreeByMonth = [0, 1000, 1700, 1800, 2000, 3000, 1500, 1600, 2000, 1500, 3000, 1500];
  const electricByMonth = [1630, 2380, 2740, 3590, 4280, 0, 7650, 2670, 5680, 3120, 2560, 1553];
  const maintenanceByMonth = [2500, 0, 2000, 2000, 2500, 2000, 2000, 2000, 3905, 2500, 2500, 2500];
  const netBillByMonth = [970, 970, 970, 970, 970, 970, 910, 910, 970, 970, 970, 970];
  const petrolByMonth = [2000, 2000, 3500, 3500, 2700, 3000, 3000, 3500, 3700, 4500, 5100, 3000];
  const medicinesByMonth = [1174, 0, 0, 2465, 2500, 2500, 0, 0, 0, 150, 0, 0];
  const liquorHotelByMonth = [5174, 9281, 1853, 5993, 12000, 12135, 7232, 3828, 4648, 9802, 4589, 8430];
  const homeLoanByMonth = [65000, 137000, 70000, 165000, 95000, 115000, 107000, 0, 30000, 35000, 35000, 50000];
  const sasuByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const groomingByMonth = [1800, 400, 800, 250, 150, 0, 250, 250, 250, 250, 250, 250];
  const carWashByMonth = [300, 150, 300, 300, 225, 300, 500, 400, 200, 400, 400, 400];

  for (let m = 0; m < 12; m++) {
    addTx('yashi', m, yashiByMonth[m], 'Yashi allowance/school');
    addTx('navashree', m, navashreeByMonth[m], 'Navashree classes');
    addTx('electric_bill', m, electricByMonth[m], 'MSEDCL Electric Bill');
    addTx('maintenance', m, maintenanceByMonth[m], 'Society Maintenance');
    addTx('net_bill', m, netBillByMonth[m], 'Broadband Net Bill');
    addTx('petrol', m, petrolByMonth[m], 'Fuel petrol');
    addTx('medicines', m, medicinesByMonth[m], 'Medicines & Health');
    addTx('liquor_hotel', m, liquorHotelByMonth[m], 'Liquor, Saoji, Snacks');
    addTx('home_loan', m, homeLoanByMonth[m], 'Home Loan EMI');
    addTx('grooming', m, groomingByMonth[m], 'Grooming & Haircut');
    addTx('car_wash', m, carWashByMonth[m], 'Car Wash');
  }

  // Yearly Expenses
  addTx('car_service', 2, 6363, 'Car Servicing');
  addTx('blood_test', 2, 3300, 'Blood Test');
  addTx('blood_test', 7, 810, 'Blood Test');
  addTx('birthday', 3, 425, 'Brithday');
  addTx('birthday', 7, 4500, 'Brithday');
  addTx('birthday', 9, 4956, 'Brithday');
  addTx('birthday', 10, 7500, 'Brithday');
  addTx('mobile_recharge', 1, 800, 'Mobile Recharge');
  addTx('mobile_recharge', 3, 800, 'Mobile Recharge');
  addTx('mobile_recharge', 6, 3600, 'Mobile Recharge');
  addTx('mobile_recharge', 7, 4504, 'Mobile Recharge');
  addTx('mobile_recharge', 10, 3604, 'Mobile Recharge');
  addTx('party_31st', 0, 770, '31 st Party');
  addTx('rakhi', 7, 1500, 'Rakhi');
  addTx('yashi_website', 8, 14145, 'Yashi Website');
  addTx('domain', 0, 1200, 'Domain');
  addTx('website', 0, 6000, 'Website');
  addTx('ganpati', 7, 19667, 'Ganpati');
  addTx('ganpati', 8, 11000, 'Ganpati');
  addTx('diwali_padwa', 9, 1000, 'Diwali Padwa');
  addTx('anniversary', 2, 4300, 'Anniversary');
  addTx('policy_yearly', 3, 21735, 'Policy');
  addTx('policy_yearly', 9, 18420, 'Policy');
  addTx('car_wiper', 5, 550, 'Car Wiper');
  addTx('domain', 6, 1346, 'Domain Yashi');
  addTx('car_service', 6, 3669, 'Car Insurance');

  // Miscellaneous Exp. itemized per month exactly matching user's sheet:
  // Jan (16,983)
  addTx('misc_general', 0, 1200, 'Just Dial');
  addTx('misc_general', 0, 15000, '5th Feb Nava Fees');
  addTx('misc_general', 0, 783, '174 SF registration');

  // Feb (25,400)
  addTx('misc_general', 1, 1200, 'Just Dial');
  addTx('misc_general', 1, 15000, 'Swimming Class');
  addTx('misc_general', 1, 2600, 'Standing Stand');
  addTx('misc_general', 1, 2000, 'Rbhave');
  addTx('misc_general', 1, 600, 'Curtain');
  addTx('misc_general', 1, 4000, 'Don\'t know');

  // Mar (24,540)
  addTx('misc_general', 2, 1200, 'Just Dial');
  addTx('misc_general', 2, 4986, 'Water Filter');
  addTx('misc_general', 2, 1350, 'Swimming Class');
  addTx('misc_general', 2, 980, 'Car Number Plate');
  addTx('misc_general', 2, 2474, 'Reservation');
  addTx('misc_general', 2, 13000, 'Cooler');
  addTx('misc_general', 2, 550, 'Pipe, Hardboard');

  // Apr (6,685)
  addTx('misc_general', 3, 1200, 'Just Dial');
  addTx('misc_general', 3, 1050, 'Water Filter');
  addTx('misc_general', 3, 2655, 'Lift Maintenance');
  addTx('misc_general', 3, 910, 'Gas Cylender');
  addTx('misc_general', 3, 870, 'Glosary');

  // May (4,130)
  addTx('misc_general', 4, 1200, 'Just Dial');
  addTx('misc_general', 4, 1875, 'Bird Net');
  addTx('misc_general', 4, 1055, 'BOOKS');

  // Jun (13,800)
  addTx('misc_general', 5, 1200, 'Just Dial');
  addTx('misc_general', 5, 2300, 'Fridge Repair');
  addTx('misc_general', 5, 3000, 'Aptitude Test');
  addTx('misc_general', 5, 6850, 'Book Rack');
  addTx('misc_general', 5, 450, 'Clinic');

  // Jul (15,893)
  addTx('misc_general', 6, 1200, 'Just Dial');
  addTx('misc_general', 6, 2300, 'Adv Tripathi');
  addTx('misc_general', 6, 6000, 'Narendra');
  addTx('misc_general', 6, 2000, 'Song Marketing');
  addTx('misc_general', 6, 978, 'Wondershare');
  addTx('misc_general', 6, 4315, 'TuneCore');
  addTx('misc_general', 6, 1400, 'Chutyapa Car Tape');

  // Aug (51,500)
  addTx('misc_general', 7, 1200, 'Just Dial');
  addTx('misc_general', 7, 42900, 'Mobile Purchase');
  addTx('misc_general', 7, 7000, 'Clothes');
  addTx('misc_general', 7, 400, 'Airtel Card');

  // Sep (44,608)
  addTx('misc_general', 8, 1200, 'Just Dial');
  addTx('misc_general', 8, 8000, 'Certificate');
  addTx('misc_general', 8, 18000, 'Nava Fees');
  addTx('misc_general', 8, 4500, 'Sourabh Killedar');
  addTx('misc_general', 8, 2470, 'Tax Filing');
  addTx('misc_general', 8, 4124, 'Filmora + Recording');
  addTx('misc_general', 8, 2539, 'NavaBooks & Hari');
  addTx('misc_general', 8, 1075, 'PUC + Puncture');
  addTx('misc_general', 8, 1500, 'Nava Exam Fees');
  addTx('misc_general', 8, 1200, 'Hunger + Picnic');

  // Oct (38,890)
  addTx('misc_general', 9, 1200, 'Just Dial');
  addTx('misc_general', 9, 26200, 'Mobile Purchase');
  addTx('misc_general', 9, 1300, 'Mobile Repair');
  addTx('misc_general', 9, 4500, 'Kojagiri');
  addTx('misc_general', 9, 500, 'FastTag');
  addTx('misc_general', 9, 2000, 'Mandir Donation');
  addTx('misc_general', 9, 2580, 'Firecrackers');
  addTx('misc_general', 9, 1100, 'Safari');
  addTx('misc_general', 9, 670, 'Sanvi Cake');
  addTx('misc_general', 9, 3242, 'Property Tax');

  // Nov (58,350)
  addTx('misc_general', 10, 1200, 'Just Dial');
  addTx('misc_general', 10, 50200, 'Mobile Purchase');
  addTx('misc_general', 10, 300, 'Clinic');
  addTx('misc_general', 10, 5300, 'GYM Nava');
  addTx('misc_general', 10, 850, 'SUNO AI');
  addTx('misc_general', 10, 500, 'Fast tag Recharge');

  // Dec (5,967)
  addTx('misc_general', 11, 1200, 'Just Dial');
  addTx('misc_general', 11, 500, 'Khuje Reception');
  addTx('misc_general', 11, 1000, 'Nava Chair Repair');
  addTx('misc_general', 11, 1413, 'GoDaddy Domain');
  addTx('misc_general', 11, 654, 'New Bollywood Machine');
  addTx('misc_general', 11, 1200, 'v8perfumes.com');

  return txs;
}

// Initial 2026 transactions: completely blank as requested!
export function generateBlankTransactions(): Transaction[] {
  return [];
}

// Initial 2026 incomes: completely blank as requested!
export function generateBlankIncomeEntries(): IncomeEntry[] {
  return [];
}
