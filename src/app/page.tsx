import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'وين فلوسي؟ — تتبع مصروفاتك بذكاء',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: 'var(--bg)/90', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
              ؟
            </div>
            <span className="font-logo text-xl" style={{ color: 'var(--text)' }}>وين فلوسي؟</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm px-4 py-2">دخول</Link>
            <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">ابدأ مجانًا</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 badge badge-green">
          🇸🇦 مصمم للسوق السعودي
        </div>
        <h1 className="text-5xl sm:text-6xl font-logo font-black mb-6 leading-tight">
          <span style={{ color: 'var(--text)' }}>وين </span>
          <span style={{ color: 'var(--brand-500)' }}>فلوسي؟</span>
        </h1>
        <p className="text-xl sm:text-2xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
          تتبع مصروفاتك تلقائيًا من إشعارات البنك، اكتشف اشتراكاتك، وخطط لميزانيتك حتى الراتب القادم.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
            جرّب مجانًا
          </Link>
          <Link href="/dashboard" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
            استكشف بدون تسجيل
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔔',
              title: 'استيراد تلقائي',
              desc: 'تطبيق Android يقرأ إشعارات البنك تلقائيًا ويسجل عملياتك دون رفع أي ملف.',
            },
            {
              icon: '📊',
              title: 'تحليلات ذكية',
              desc: 'اعرف أين تذهب فلوسك بالضبط — حسب الفئة، التاجر، والفترة الزمنية.',
            },
            {
              icon: '💡',
              title: 'اكتشاف الاشتراكات',
              desc: 'اكتشف تلقائيًا اشتراكاتك المتكررة وتنبّه لأي مصروفات غير معتادة.',
            },
            {
              icon: '📅',
              title: 'ميزانية يومية',
              desc: 'يحسب لك كم يمكنك صرفه يوميًا حتى موعد راتبك القادم.',
            },
            {
              icon: '📄',
              title: 'تقارير PDF وExcel',
              desc: 'صدّر تقاريرك المالية في ثوانٍ لأي فترة زمنية تريدها.',
            },
            {
              icon: '🔒',
              title: 'خصوصية وأمان',
              desc: 'بياناتك مشفرة. لا نطلب كلمات مرور البنك أو OTP أبدًا.',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 animate-fade-in">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text)' }}>الخطط</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="card p-8">
            <div className="badge badge-gray mb-4">مجاني</div>
            <div className="text-4xl font-black mb-1" style={{ color: 'var(--text)' }}>0 ر.س</div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>للأبد</p>
            <ul className="space-y-3 mb-8 text-sm" style={{ color: 'var(--text)' }}>
              {['تتبع المصروفات والدخل', 'الميزانية اليومية', 'التقارير الأساسية', 'استيراد CSV', 'تطبيق Android المساعد'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="btn-secondary w-full text-center">ابدأ مجانًا</Link>
          </div>
          <div className="card p-8 border-green-500 border-2 relative">
            <div className="badge badge-green mb-4">⭐ بريميوم</div>
            <div className="text-4xl font-black mb-1" style={{ color: 'var(--text)' }}>9 ر.س</div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>شهريًا</p>
            <ul className="space-y-3 mb-8 text-sm" style={{ color: 'var(--text)' }}>
              {['كل مزايا الخطة المجانية', 'تحليلات متقدمة', 'تقارير PDF وExcel كاملة', 'اكتشاف الاشتراكات', 'بدون إعلانات', 'دعم أولوية'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="btn-primary w-full text-center">ابدأ بريميوم</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-logo text-lg" style={{ color: 'var(--text)' }}>وين فلوسي؟</span>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/privacy" className="hover:text-green-500 transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-green-500 transition-colors">الشروط والأحكام</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} وين فلوسي. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
