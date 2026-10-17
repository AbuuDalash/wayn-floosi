import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'سياسة الخصوصية — وين فلوسي؟' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm mb-8 inline-block" style={{ color: 'var(--text-secondary)' }}>
          → العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>سياسة الخصوصية</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>آخر تحديث: أكتوبر 2026</p>
        <div className="prose space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>١. المعلومات التي نجمعها</h2>
            <p>نجمع المعلومات التالية فقط:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>الاسم والبريد الإلكتروني عند التسجيل</li>
              <li>بيانات العمليات المالية التي تدخلها أنت أو تستوردها</li>
              <li>نصوص إشعارات البنك من تطبيق Android (بعد موافقتك الصريحة)</li>
              <li>بيانات استخدام التطبيق (مجهولة الهوية) لتحسين الخدمة</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٢. ما لا نجمعه أبدًا</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>بيانات تسجيل الدخول للبنك أو كلمات المرور البنكية</li>
              <li>أرقام البطاقات البنكية أو CVV</li>
              <li>رموز OTP أو رموز التحقق</li>
              <li>بيانات الاتصال أو الرسائل</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٣. كيف نستخدم بياناتك</h2>
            <p>تُستخدم بياناتك حصريًا لتقديم خدمة إدارة الأموال الشخصية. لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة للأغراض التجارية.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٤. الامتثال لنظام حماية البيانات الشخصية (PDPL)</h2>
            <p>نلتزم بأحكام نظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي م/19. يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٥. أمان البيانات</h2>
            <p>نستخدم تشفير AES-256 لتخزين البيانات، وبروتوكول HTTPS لجميع الاتصالات، وتجزئة bcrypt لكلمات المرور. لا يمكن لأي موظف الاطلاع على بياناتك المالية.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٦. حقوقك</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>الحق في الاطلاع على بياناتك الشخصية</li>
              <li>الحق في تصحيح البيانات غير الدقيقة</li>
              <li>الحق في حذف حسابك وجميع بياناتك</li>
              <li>الحق في نقل بياناتك (تصدير CSV)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>٧. التواصل</h2>
            <p>للاستفسارات المتعلقة بالخصوصية، تواصل معنا عبر البريد الإلكتروني: privacy@wayn-floosi.sa</p>
          </section>
        </div>
      </div>
    </div>
  );
}
