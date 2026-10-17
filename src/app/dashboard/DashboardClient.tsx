'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Analytics {
  summary: {
    totalIncome: string;
    totalExpense: string;
    netBalance: string;
    transactionCount: number;
    daysUntilSalary: number;
    dailyBudgetRemaining: string | null;
  };
  categories: { name: string; amount: string; percentage: number }[];
  dailyTrend: { date: string; amount: string }[];
  subscriptions: { id: string; merchant: string; amount: string; frequency: string }[];
}

const CATEGORY_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

function formatNum(n: string | number): string {
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub?: string; color?: string; icon?: string;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1" style={{ color: color || 'var(--text)' }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics?period=month')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-7 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>فشل تحميل البيانات</div>;

  const { summary, categories, dailyTrend, subscriptions } = data;
  const netPos = parseFloat(summary.netBalance) >= 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>لوحة التحكم</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          هذا الشهر — {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المصروفات"
          value={`${formatNum(summary.totalExpense)} ر.س`}
          icon="💸"
          color="var(--danger)"
        />
        <StatCard
          label="إجمالي الدخل"
          value={`${formatNum(summary.totalIncome)} ر.س`}
          icon="💰"
          color="var(--success)"
        />
        <StatCard
          label="صافي الرصيد"
          value={`${formatNum(summary.netBalance)} ر.س`}
          icon={netPos ? '📈' : '📉'}
          color={netPos ? 'var(--success)' : 'var(--danger)'}
        />
        <StatCard
          label="حتى الراتب"
          value={`${summary.daysUntilSalary} يوم`}
          sub={summary.dailyBudgetRemaining
            ? `${formatNum(summary.dailyBudgetRemaining)} ر.س / يوم`
            : undefined}
          icon="📅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending trend */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>
            مسار الإنفاق اليومي
          </h2>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyTrend.map((d) => ({ ...d, amount: parseFloat(d.amount) }))}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', direction: 'rtl' }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(2)} ر.س`, 'المصروفات']}
                />
                <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2}
                  fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
              لا توجد بيانات بعد — سجّل عملياتك أو ربط التطبيق بجهازك
            </div>
          )}
        </div>

        {/* Category pie */}
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>
            توزيع المصروفات
          </h2>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} dataKey="amount" nameKey="name" cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {categories.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', direction: 'rtl' }}
                    formatter={(v: unknown) => [`${Number(v).toFixed(2)} ر.س`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {categories.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span style={{ color: 'var(--text)' }}>{c.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>
              لا توجد بيانات
            </div>
          )}
        </div>
      </div>

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>
            الاشتراكات المكتشفة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subscriptions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.merchant}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {s.frequency === 'MONTHLY' ? 'شهري' : s.frequency}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--danger)' }}>
                  {formatNum(s.amount)} ر.س
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/transactions?action=add', label: 'إضافة عملية', icon: '➕' },
          { href: '/transactions?action=import', label: 'استيراد CSV', icon: '📁' },
          { href: '/analytics', label: 'عرض التحليلات', icon: '📊' },
          { href: '/reports', label: 'إنشاء تقرير', icon: '📄' },
        ].map((a) => (
          <a key={a.href} href={a.href}
            className="card p-4 flex flex-col items-center gap-2 hover:border-green-500 transition-colors cursor-pointer">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
              {a.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
