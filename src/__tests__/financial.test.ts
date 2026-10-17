import {
  toDecimal,
  addAmount,
  subtractAmount,
  calcPercentage,
  daysUntilSalary,
  dailyBudgetRemaining,
  autoCategory,
  parseNotificationText,
  isDuplicate,
  formatCurrency,
} from '../lib/financial';

describe('Financial utilities — precision', () => {
  test('toDecimal handles string and number', () => {
    expect(toDecimal('10.1').toNumber()).toBe(10.1);
    expect(toDecimal(0.1).plus(toDecimal(0.2)).toNumber()).toBeCloseTo(0.3, 10);
  });

  test('addAmount avoids floating-point drift', () => {
    expect(addAmount('0.1', '0.2')).toBe('0.30');
  });

  test('subtractAmount', () => {
    expect(subtractAmount('100.00', '33.50')).toBe('66.50');
  });

  test('calcPercentage rounds correctly', () => {
    expect(calcPercentage('750', '1000')).toBe(75);
  });
});

describe('daysUntilSalary', () => {
  test('salary day in future this month', () => {
    const result = daysUntilSalary(25);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(31);
  });

  test('salary day already passed this month returns days to next month', () => {
    const result = daysUntilSalary(1);
    expect(result).toBeGreaterThan(0);
  });
});

describe('dailyBudgetRemaining', () => {
  test('returns positive number when under budget', () => {
    const result = dailyBudgetRemaining('3000', '500', 25);
    expect(parseFloat(result)).toBeGreaterThan(0);
  });

  test('returns zero or negative when over budget', () => {
    const result = dailyBudgetRemaining('1000', '1500', 25);
    expect(parseFloat(result)).toBeLessThanOrEqual(0);
  });
});

describe('autoCategory', () => {
  test('categorizes food merchants', () => {
    expect(autoCategory('ماكدونالدز', '')).toBe('مطاعم وكافيهات');
    expect(autoCategory("McDonald's", '')).toBe('مطاعم وكافيهات');
  });

  test('categorizes transport', () => {
    expect(autoCategory('أوبر', '')).toBe('نقل ومواصلات');
    expect(autoCategory('Uber', '')).toBe('نقل ومواصلات');
  });

  test('categorizes subscriptions', () => {
    expect(autoCategory('Netflix', '')).toBe('ترفيه واشتراكات');
    expect(autoCategory('نتفليكس', '')).toBe('ترفيه واشتراكات');
  });

  test('returns أخرى for unknown', () => {
    expect(autoCategory('XYZ Unknown Store 12345', '')).toBe('أخرى');
  });
});

describe('parseNotificationText — OTP safety', () => {
  test('returns null for OTP notifications', () => {
    expect(parseNotificationText('رمز التحقق الخاص بك هو 123456')).toBeNull();
    expect(parseNotificationText('Your OTP is 4521 — do not share')).toBeNull();
    expect(parseNotificationText('كود التحقق: 9871')).toBeNull();
  });

  test('parses Arabic debit notification', () => {
    const result = parseNotificationText('تم خصم 150.00 ريال من حسابك لدى ماكدونالدز');
    expect(result).not.toBeNull();
    expect(result?.amount).toBe('150.00');
    expect(result?.transactionType).toBe('EXPENSE');
  });

  test('parses English credit notification', () => {
    const result = parseNotificationText('SAR 5,000.00 credited to your account — salary');
    expect(result).not.toBeNull();
    expect(result?.transactionType).toBe('INCOME');
  });

  test('returns null for non-financial text', () => {
    expect(parseNotificationText('تذكير: موعدك غدًا الساعة 3')).toBeNull();
  });
});

describe('isDuplicate', () => {
  const base = {
    amount: '100.00',
    merchant: 'ماكدونالدز',
    date: new Date('2024-01-15T10:00:00Z'),
  };

  test('detects duplicate within 5 minutes', () => {
    const newTx = { amount: '100.00', merchant: 'ماكدونالدز', date: new Date('2024-01-15T10:03:00Z') };
    expect(isDuplicate(newTx, base)).toBe(true);
  });

  test('not duplicate after 6 minutes', () => {
    const newTx = { amount: '100.00', merchant: 'ماكدونالدز', date: new Date('2024-01-15T10:06:00Z') };
    expect(isDuplicate(newTx, base)).toBe(false);
  });

  test('not duplicate with different amount', () => {
    const newTx = { amount: '200.00', merchant: 'ماكدونالدز', date: new Date('2024-01-15T10:01:00Z') };
    expect(isDuplicate(newTx, base)).toBe(false);
  });

  test('not duplicate with different merchant', () => {
    const newTx = { amount: '100.00', merchant: 'ستاربكس', date: new Date('2024-01-15T10:01:00Z') };
    expect(isDuplicate(newTx, base)).toBe(false);
  });
});

describe('formatCurrency', () => {
  test('formats SAR correctly', () => {
    const result = formatCurrency('1234.50', 'SAR');
    expect(result).toContain('1234.50');
    expect(result).toContain('ر.س');
  });
});
