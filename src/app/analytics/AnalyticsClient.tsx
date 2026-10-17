'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316'];

type Period = 'week' | 'month' | 'year';

export default function AnalyticsClient() {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const periodLabels: Record<Period, string> = {
    week: 'آخر 7 أيام', month: 'هذا الشهر', year: 'هذا العام',
  };

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="card p-5 skeleton h-64" />)}
        </div>
      </div>
    );
  }

  const summary = data.summary as Record<string, string | number | null>;
  const categories = (data.categories as { name: string; amount: string; percentage: number }[]);
  const topMerchants = (data.topMerchants as { name: string; amount: string }[]);
  const dailyTrend = (data.dailyTrend as { date: string; amount: string }[]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>التحليلات</h1>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p ? 'text-white' : ''}`}
              style={{ background: period === p ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'transparent',
                color: period === p ? 'white' : 'var(--text-secondary)' }}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المصروفات', value: `${Number(summary.totalExpense).toFixed(2)} ر.س`, color: 'var(--danger)' },
          { label: 'إجمالي الدخل', value: `${Number(summary.totalIncome).toFixed(2)} ر.س`, color: 'var(--success)' },
          { label: 'صافي الرصيد', value: `${Number(summary.netBalance).toFixed(2)} ر.س`,
            color: Number(summary.netBalance) >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'عدد العمليات', value: String(summary.transactionCount), color: 'var(--accent-500)' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>الإنفاق اليومي</h2>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyTrend.map(d => ({ ...d, amount: parseFloat(d.amount) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', direction: 'rtl' }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(2)} ر.س`, 'المصروفات']} />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>}
        </div>

        {/* Category pie */}
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>توزيع الفئات</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories} dataKey="amount" nameKey="name" cx="50%" cy="50%"
                  outerRadius={90} paddingAngle={2} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', direction: 'rtl' }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(2)} ر.س`]} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>}
        </div>

        {/* Category bar */}
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>أعلى الفئات إنفاقًا</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories.slice(0, 8).map(c => ({ ...c, amount: parseFloat(c.amount) }))}
                layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: 'var(--text)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', direction: 'rtl' }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(2)} ر.س`]} />
                <Bar dataKey="amount" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>}
        </div>

        {/* Top merchants */}
        <div className="card p-5">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>أكثر الجهات إنفاقًا</h2>
          {topMerchants.length > 0 ? (
            <div className="space-y-3">
              {topMerchants.slice(0, 8).map((m, i) => {
                const max = parseFloat(topMerchants[0].amount);
                const pct = (parseFloat(m.amount) / max) * 100;
                return (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text)' }}>{m.name}</span>
                      <span className="font-semibold" style={{ color: 'var(--danger)' }}>
                        {Number(m.amount).toFixed(2)} ر.س
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</div>}
        </div>
      </div>
    </div>
  );
}
