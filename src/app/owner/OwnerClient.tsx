'use client';
import { useEffect, useState } from 'react';

interface DashboardData {
  users: { total: number; premium: number; newThisMonth: number; activeThisMonth: number };
  transactions: { total: number };
  devices: { total: number };
  revenue: { estimatedMonthlyFromPremium: number | null; note: string };
}

export default function OwnerClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/owner/dashboard')
      .then(r => { if (!r.ok) throw new Error('غير مصرح'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return (
    <div className="card p-12 text-center">
      <p className="text-4xl mb-3">🔒</p>
      <p className="font-semibold" style={{ color: 'var(--text)' }}>غير مصرح بالوصول</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  );

  if (!data) return <div className="skeleton h-64 rounded-xl" />;

  const stats = [
    { label: 'إجمالي المستخدمين', value: data.users.total, icon: '👥' },
    { label: 'المشتركون المميزون', value: data.users.premium, icon: '⭐' },
    { label: 'جدد هذا الشهر', value: data.users.newThisMonth, icon: '🆕' },
    { label: 'نشطون هذا الشهر', value: data.users.activeThisMonth, icon: '📊' },
    { label: 'إجمالي العمليات', value: data.transactions.total, icon: '💳' },
    { label: 'أجهزة Android', value: data.devices.total, icon: '📱' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>لوحة المالك</h1>
        <span className="badge badge-green text-xs">OWNER</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <p className="stat-label">{s.label}</p>
            </div>
            <p className="stat-value">{s.value.toLocaleString('ar-SA')}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>الإيرادات التقديرية</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              المشتركون المميزون × 9 ر.س/شهر
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>
              {data.revenue.estimatedMonthlyFromPremium !== null
                ? `${data.revenue.estimatedMonthlyFromPremium.toFixed(2)} ر.س`
                : 'غير متاح'}
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          ⚠️ {data.revenue.note}
        </p>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>الخطوات التالية للمالك</h2>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex items-start gap-2"><span>1.</span><span>اربط بوابة دفع (Moyasar أو HyperPay) لتفعيل الاشتراكات المدفوعة</span></li>
          <li className="flex items-start gap-2"><span>2.</span><span>فعّل Google AdSense على النطاق وأضف وحدات الإعلان لمستخدمي الخطة المجانية</span></li>
          <li className="flex items-start gap-2"><span>3.</span><span>انشر التطبيق على Google Play لتوسيع قاعدة المستخدمين</span></li>
          <li className="flex items-start gap-2"><span>4.</span><span>راجع ملف DEPLOYMENT.md للتعليمات الكاملة</span></li>
        </ul>
      </div>
    </div>
  );
}
