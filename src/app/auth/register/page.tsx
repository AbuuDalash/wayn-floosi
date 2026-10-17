'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'SAR',
    salaryDay: 25,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-white text-3xl font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
            ؟
          </div>
          <h1 className="text-2xl font-logo font-bold" style={{ color: 'var(--text)' }}>أنشئ حسابك</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>مجاني — لا بطاقة بنكية مطلوبة</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input" placeholder="اسمك الكامل" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="email@example.com" required dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                كلمة المرور <span style={{ color: 'var(--text-muted)' }}>(8 أحرف على الأقل)</span>
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input" placeholder="••••••••" required minLength={8} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                يوم الراتب
              </label>
              <input type="number" min={1} max={31} value={form.salaryDay}
                onChange={(e) => setForm({ ...form, salaryDay: parseInt(e.target.value) })}
                className="input" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                لحساب الميزانية اليومية المتبقية حتى الراتب
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? '...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            لديك حساب؟{' '}
            <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">دخول</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4 px-4" style={{ color: 'var(--text-muted)' }}>
          بالتسجيل توافق على{' '}
          <Link href="/terms" className="underline">الشروط والأحكام</Link>{' '}
          و{' '}
          <Link href="/privacy" className="underline">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  );
}
