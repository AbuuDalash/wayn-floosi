'use client';
import { useState } from 'react';

export default function ReportsClient() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null);

  const download = async (format: 'pdf' | 'excel') => {
    setLoading(format);
    const res = await fetch(`/api/reports/${format}?from=${from}&to=${to}`);
    if (!res.ok) { alert('فشل إنشاء التقرير'); setLoading(null); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${from}_${to}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>التقارير</h1>
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>تصدير تقرير مالي</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>من تاريخ</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input" dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>إلى تاريخ</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input" dir="ltr" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => download('pdf')} disabled={loading !== null}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading === 'pdf' ? 'جاري الإنشاء...' : '📄 تصدير PDF'}
          </button>
          <button onClick={() => download('excel')} disabled={loading !== null}
            className="btn-secondary flex-1 flex items-center justify-center gap-2">
            {loading === 'excel' ? 'جاري الإنشاء...' : '📊 تصدير Excel'}
          </button>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>ما يتضمنه التقرير</h2>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {['ملخص الدخل والمصروفات والرصيد الصافي','قائمة كاملة بجميع العمليات','توزيع المصروفات حسب الفئة','أعلى الجهات إنفاقًا','الاشتراكات المتكررة المكتشفة','مقارنة الميزانية مع الإنفاق الفعلي'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span style={{ color: 'var(--success)' }}>✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
