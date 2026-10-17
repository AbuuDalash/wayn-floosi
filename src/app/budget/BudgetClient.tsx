'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  'مطاعم وكافيهات', 'مواد غذائية', 'نقل ومواصلات', 'ترفيه واشتراكات',
  'فواتير وخدمات', 'صحة وطب', 'تسوق وملابس', 'تعليم',
  'مصرفية وتحويلات', 'رياضة', 'إيجار وسكن', 'أخرى',
];

interface BudgetStatus {
  category: string;
  limit: string;
  spent: string;
  percentage: number;
}

export default function BudgetClient() {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [budgets, setBudgets] = useState<{ id: string; category: string; limitAmount: string }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limitAmount: '', period: 'monthly' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/budgets').then(r => r.json()),
      fetch('/api/analytics?period=month').then(r => r.json()),
    ]).then(([b, a]) => {
      setBudgets(b);
      setBudgetStatus(a.budgetStatus || []);
    });
  }, []);

  const handleSave = async () => {
    if (!newBudget.category || !newBudget.limitAmount) return;
    setSaving(true);
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBudget),
    });
    if (res.ok) {
      setShowAdd(false);
      setNewBudget({ category: '', limitAmount: '', period: 'monthly' });
      window.location.reload();
    }
    setSaving(false);
  };

  const getColor = (pct: number) => {
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warning';
    return '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>الميزانية</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">➕ ميزانية جديدة</button>
      </div>

      {budgetStatus.length === 0 && budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>لم تحدد ميزانية بعد</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            حدد حدًا لكل فئة ونتابع معك
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">إضافة ميزانية</button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetStatus.map((b) => (
            <div key={b.category} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{b.category}</h3>
                <div className="flex items-center gap-2">
                  {b.percentage >= 100 && <span className="badge badge-red text-xs">تجاوزت الحد</span>}
                  {b.percentage >= 80 && b.percentage < 100 && <span className="badge badge-yellow text-xs">قريب من الحد</span>}
                  <span className="text-sm font-bold"
                    style={{ color: b.percentage >= 100 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {b.percentage}%
                  </span>
                </div>
              </div>
              <div className="progress-bar mb-3">
                <div className={`progress-fill ${getColor(b.percentage)}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>
                  صُرف: <strong style={{ color: 'var(--text)' }}>{Number(b.spent).toFixed(2)} ر.س</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  الحد: <strong style={{ color: 'var(--text)' }}>{Number(b.limit).toFixed(2)} ر.س</strong>
                </span>
                <span style={{ color: b.percentage >= 100 ? 'var(--danger)' : 'var(--success)' }}>
                  متبقي: {Math.max(0, Number(b.limit) - Number(b.spent)).toFixed(2)} ر.س
                </span>
              </div>
            </div>
          ))}

          {/* Categories without status */}
          {budgets
            .filter(b => !budgetStatus.find(s => s.category === b.category))
            .map((b) => (
              <div key={b.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{b.category}</h3>
                  <span className="badge badge-gray text-xs">0%</span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{ width: '0%' }} />
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  الحد: <strong>{Number(b.limitAmount).toFixed(2)} ر.س</strong> — لا توجد مصروفات بعد
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>ميزانية جديدة</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>الفئة</label>
                <select value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="input">
                  <option value="">اختر فئة</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>الحد الأقصى (ر.س)</label>
                <input type="number" step="0.01" min="0" value={newBudget.limitAmount}
                  onChange={(e) => setNewBudget({ ...newBudget, limitAmount: e.target.value })}
                  className="input" placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? '...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
