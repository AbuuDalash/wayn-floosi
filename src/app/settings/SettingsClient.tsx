'use client';
import { useState, useEffect } from 'react';

interface User {
  id: string; name: string; email: string; salaryDay: number; currency: string;
  plan: string; role: string;
}
interface Device {
  id: string; deviceName: string; syncEnabled: boolean; lastSyncAt: string | null;
}

export default function SettingsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState({ name: '', salaryDay: 1, currency: 'SAR' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'profile' | 'plan' | 'android'>('profile');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then((u: User) => {
      setUser(u);
      setForm({ name: u.name, salaryDay: u.salaryDay, currency: u.currency });
    });
    fetch('/api/android/devices').then(r => r.json()).then(setDevices).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const toggleDevice = async (id: string, enabled: boolean) => {
    await fetch(`/api/android/devices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncEnabled: enabled }),
    });
    setDevices(prev => prev.map(d => d.id === id ? { ...d, syncEnabled: enabled } : d));
  };

  const removeDevice = async (id: string) => {
    if (!confirm('إلغاء ربط هذا الجهاز؟')) return;
    await fetch(`/api/android/devices/${id}`, { method: 'DELETE' });
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  if (!user) return <div className="skeleton h-64 rounded-xl" />;

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي' },
    { id: 'plan', label: 'الاشتراك' },
    { id: 'android', label: 'أجهزة Android' },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>الإعدادات</h1>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === t.id ? 'var(--bg-card)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-secondary)',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>الاسم</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>البريد الإلكتروني</label>
            <input value={user.email} disabled className="input opacity-60" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>يوم الراتب</label>
              <input type="number" min="1" max="31" value={form.salaryDay}
                onChange={e => setForm({ ...form, salaryDay: parseInt(e.target.value) || 1 })}
                className="input" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>العملة</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input">
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار (USD)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="AED">درهم (AED)</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saved ? '✓ تم الحفظ' : saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      )}

      {tab === 'plan' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>خطتك الحالية</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {user.plan === 'PREMIUM' ? 'مميز — 9 ر.س / شهر' : 'مجاني'}
              </p>
            </div>
            <span className={`badge ${user.plan === 'PREMIUM' ? 'badge-green' : 'badge-gray'} text-sm`}>
              {user.plan === 'PREMIUM' ? '⭐ مميز' : 'مجاني'}
            </span>
          </div>
          {user.plan === 'FREE' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>مزايا الخطة المميزة</h3>
              <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {['بدون إعلانات','تقارير PDF و Excel','مزامنة أجهزة Android غير محدودة','تنبيهات متقدمة','دعم أولوية'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span style={{ color: 'var(--success)' }}>✓</span>{f}</li>
                ))}
              </ul>
              <button className="btn-primary w-full mt-4">
                ترقية للمميز — 9 ر.س/شهر
              </button>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                يتطلب ربط بوابة دفع (Moyasar/HyperPay) — قريبًا
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'android' && (
        <div className="card p-6 space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            الأجهزة المرتبطة بحسابك لاستيراد الإشعارات البنكية تلقائيًا
          </p>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📱</p>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>لا توجد أجهزة مرتبطة</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                ثبّت تطبيق Android وسجّل دخولك لربط جهازك
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{d.deviceName}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {d.lastSyncAt ? `آخر مزامنة: ${new Date(d.lastSyncAt).toLocaleString('ar-SA')}` : 'لم يتزامن بعد'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={d.syncEnabled}
                        onChange={e => toggleDevice(d.id, e.target.checked)} />
                      مزامنة
                    </label>
                    <button onClick={() => removeDevice(d.id)} className="text-xs text-red-500 hover:underline">إزالة</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
