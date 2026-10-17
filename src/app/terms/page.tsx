import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'الشروط والأحكام — وين فلوسي؟' };

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm mb-8 inline-block" style={{ color: 'var(--text-secondary)' }}>
          → العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>الشروط والأحكام</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>آخر تحديث: أكتوبر 2026</p>
        <div className="prose space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>١. القبول بالشروط</h2>
            <p>باستخدامك لتطبيق &quot;وين فلوسي؟&quot;، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٢. وصف الخدمة</h2>
            <p>&quot;وين فلوسي؟&quot; هو تطبيق لإدارة الأموال الشخصية. التطبيق أداة تتبع فقط ولا يقدم خدمات مالية أو استشارات استثمارية.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٣. الخطط والأسعار</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>الخطة المجانية: متاحة للجميع مع إعلانات</li>
              <li>الخطة المميزة: 9 ريال سعودي شهريًا، بدون إعلانات ومزايا إضافية</li>
              <li>الأسعار قابلة للتغيير مع إشعار مسبق بـ 30 يومًا</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٤. مسؤولية المستخدم</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>أنت مسؤول عن دقة البيانات التي تدخلها</li>
              <li>يُحظر مشاركة حسابك مع الآخرين</li>
              <li>يُحظر استخدام التطبيق لأغراض غير مشروعة</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٥. إخلاء المسؤولية</h2>
            <p>لا يتحمل التطبيق مسؤولية أي قرارات مالية تتخذها بناءً على البيانات المعروضة. البيانات للأغراض المعلوماتية فقط.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٦. إنهاء الحساب</h2>
            <p>يمكنك حذف حسابك في أي وقت من الإعدادات. سيتم حذف جميع بياناتك بشكل نهائي خلال 30 يومًا.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٧. القانون المطبق</h2>
            <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص المحاكم السعودية بالنظر في أي نزاع.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
