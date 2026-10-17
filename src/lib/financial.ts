/**
 * Financial calculations — وين فلوسي؟
 * All monetary values handled as strings to avoid IEEE 754 floating-point errors.
 * Using Decimal.js for precision.
 */
import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(value: string | number): Decimal {
  return new Decimal(String(value));
}

/** Add two monetary values precisely */
export function addAmount(a: string | number, b: string | number): string {
  return toDecimal(a).plus(toDecimal(b)).toFixed(2);
}

/** Subtract precisely */
export function subtractAmount(a: string | number, b: string | number): string {
  return toDecimal(a).minus(toDecimal(b)).toFixed(2);
}

/** Calculate percentage */
export function calcPercentage(part: string | number, total: string | number): number {
  const t = toDecimal(total);
  if (t.isZero()) return 0;
  return toDecimal(part).dividedBy(t).times(100).toDecimalPlaces(1).toNumber();
}

/** Days remaining until salary day */
export function daysUntilSalary(salaryDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (currentDay <= salaryDay) {
    return salaryDay - currentDay;
  }
  // Salary is next month
  return daysInMonth - currentDay + salaryDay;
}

/** Calculate daily budget remaining */
export function dailyBudgetRemaining(
  monthlyBudget: string | number,
  spent: string | number,
  salaryDay: number
): string {
  const remaining = toDecimal(monthlyBudget).minus(toDecimal(spent));
  const days = daysUntilSalary(salaryDay);
  if (days <= 0) return remaining.toFixed(2);
  return remaining.dividedBy(days).toDecimalPlaces(2).toFixed(2);
}

/** Auto-categorize transaction from Arabic/English merchant name */
export function autoCategory(merchant: string | null, description: string | null): string {
  const text = `${merchant || ''} ${description || ''}`.toLowerCase();

  const categories: [string[], string][] = [
    [['مطعم', 'restaurant', 'cafe', 'كافيه', 'مقهى', 'مكدونالد', 'ماكدونالد', 'برجر', 'بيتزا', 'kfc', 'food', 'طعام', 'أكل', 'شاورما', 'فطور', 'غداء', 'عشاء'], 'مطاعم وكافيهات'],
    [['سوبرماركت', 'supermarket', 'panda', 'بنده', 'carrefour', 'كارفور', 'lulu', 'لولو', 'hyper', 'هايبر', 'grocery', 'بقالة', 'تموينات', 'othaim', 'العثيم'], 'مواد غذائية'],
    [['uber', 'أوبر', 'lyft', 'careem', 'كريم', 'تاكسي', 'taxi', 'نقل', 'بنزين', 'وقود', 'fuel', 'gas', 'aramco', 'أرامكو', 'shell', 'شل', 'total', 'توتال', 'parking', 'مواقف'], 'نقل ومواصلات'],
    [['cinema', 'سينما', 'netflix', 'نتفليكس', 'spotify', 'ترفيه', 'gaming', 'game', 'ps', 'xbox', 'شاهد', 'stc tv', 'tik tok', 'youtube'], 'ترفيه واشتراكات'],
    [['كهرباء', 'ماء', 'غاز', 'internet', 'انترنت', 'stc', 'mobily', 'zain', 'زين', 'موبايلي', 'اتصالات', 'telephone', 'utility', 'sec', 'نور', 'حاتم'], 'فواتير وخدمات'],
    [['طبيب', 'مستشفى', 'hospital', 'clinic', 'عيادة', 'دواء', 'صيدلية', 'pharmacy', 'nahdi', 'النهدي', 'dawaa', 'دواء', 'health', 'صحة'], 'صحة وطب'],
    [['ملابس', 'fashion', 'zara', 'h&m', 'مكس', 'max', 'noon', 'نون', 'amazon', 'أمازون', 'shopping', 'تسوق', 'shoes', 'أحذية', 'clothes'], 'تسوق وملابس'],
    [['school', 'مدرسة', 'university', 'جامعة', 'college', 'كلية', 'course', 'كورس', 'udemy', 'education', 'تعليم', 'كتب', 'books'], 'تعليم'],
    [['atm', 'سحب', 'transfer', 'تحويل', 'bank', 'بنك', 'راجحي', 'rajhi', 'sab', 'الأهلي', 'ncb', 'riyad', 'الرياض', 'alinma', 'الإنماء'], 'مصرفية وتحويلات'],
    [['gym', 'جيم', 'sport', 'رياضة', 'fitness', 'فيتنس'], 'رياضة'],
    [['rent', 'إيجار', 'عقار', 'housing', 'سكن'], 'إيجار وسكن'],
  ];

  for (const [keywords, category] of categories) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return 'أخرى';
}

/** Parse Arabic/English financial notification text */
export interface ParsedTransaction {
  amount: string | null;
  currency: string;
  merchant: string | null;
  transactionType: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  description: string | null;
  rawText: string;
}

export function parseNotificationText(text: string): ParsedTransaction | null {
  const result: ParsedTransaction = {
    amount: null,
    currency: 'SAR',
    merchant: null,
    transactionType: 'EXPENSE',
    description: null,
    rawText: text,
  };

  // OTP/security filter — discard
  if (/\b(OTP|رمز|تحقق|verification|code|كود)\b/i.test(text)) {
    return null;
  }

  // Amount patterns: Arabic and English
  const amountPatterns = [
    /(\d{1,3}(?:[,،]\d{3})*(?:\.\d{1,2})?)[\s]*(?:ر\.س|SAR|ريال|SR)/i,
    /(?:مبلغ|amount|قيمة|بمبلغ)[\s:：]*(\d{1,3}(?:[,،]\d{3})*(?:\.\d{1,2})?)/i,
    /(\d{1,3}(?:[,،]\d{3})+(?:\.\d{1,2})?|\d{1,3}\.\d{2}|\d{4,}(?:\.\d{1,2})?)/,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.amount = match[1].replace(/[,،]/g, '').replace(/[^\d.]/g, '');
      break;
    }
  }

  // Currency
  if (/USD|\$|دولار/i.test(text)) result.currency = 'USD';
  else if (/EUR|€|يورو/i.test(text)) result.currency = 'EUR';
  else result.currency = 'SAR';

  // Transaction type
  if (/إيداع|credit|واردة|received|راتب|salary|دخل|income/i.test(text)) {
    result.transactionType = 'INCOME';
  } else if (/تحويل|transfer|حوّل/i.test(text)) {
    result.transactionType = 'TRANSFER';
  } else {
    result.transactionType = 'EXPENSE';
  }

  // Merchant — look for "لدى/at/من/from" patterns
  const merchantPatterns = [
    /(?:لدى|from|at|من|عند|merchant|التاجر)[\s:：]*([^\d\n،,]+)/i,
    /(?:POS|نقطة بيع)[\s:：]*([^\d\n،,]+)/i,
  ];
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 1) {
      result.merchant = match[1].trim().replace(/[.،,]$/, '');
      break;
    }
  }

  // Not a financial notification if no amount found
  if (!result.amount) return null;

  return result;
}

/** Detect potential duplicate transactions */
export function isDuplicate(
  newTx: { amount: string; merchant: string | null; date: Date },
  existing: { amount: string; merchant: string | null; date: Date }
): boolean {
  const amountMatch = new Decimal(newTx.amount).equals(new Decimal(existing.amount));
  if (!amountMatch) return false;

  const merchantMatch =
    !newTx.merchant ||
    !existing.merchant ||
    newTx.merchant.toLowerCase() === existing.merchant.toLowerCase();

  const timeDiff = Math.abs(newTx.date.getTime() - existing.date.getTime());
  const withinWindow = timeDiff < 5 * 60 * 1000; // 5 minutes

  return amountMatch && merchantMatch && withinWindow;
}

/** Format currency for display */
export function formatCurrency(amount: string | number, currency = 'SAR'): string {
  const num = Number(amount);
  if (isNaN(num)) return '—';

  if (currency === 'SAR') {
    return `${new Decimal(amount).toFixed(2)} ر.س`;
  }
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
