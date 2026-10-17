# حالة المشروع — وين فلوسي؟

**الإصدار:** 1.0.0-dev  
**التاريخ:** أكتوبر 2026  
**المالك:** a.aldhabatti@gmail.com

---

## ما تم بناؤه ✅

### الخلفية (Backend API)
- [x] `POST /api/auth/register` — تسجيل حساب جديد (يعيّن دور OWNER لبريد المالك تلقائيًا)
- [x] `POST /api/auth/login` — تسجيل الدخول + cookie HTTP-only
- [x] `POST /api/auth/logout` — حذف الجلسة من DB
- [x] `GET /api/auth/me` — بيانات المستخدم الحالي
- [x] `GET/POST /api/transactions` — قائمة + إنشاء عمليات
- [x] `GET/PUT/DELETE /api/transactions/[id]` — عملية واحدة
- [x] `POST /api/transactions/import-csv` — استيراد CSV
- [x] `GET /api/analytics` — تحليلات (week/month/year/custom)
- [x] `GET/POST /api/budgets` — الميزانيات
- [x] `GET /api/reports/pdf` — تقرير HTML (قابل للطباعة كـ PDF)
- [x] `GET /api/reports/excel` — تقرير CSV (يفتح في Excel)
- [x] `PATCH /api/settings` — تحديث إعدادات المستخدم
- [x] `GET /api/android/devices` — أجهزة Android المرتبطة
- [x] `PATCH/DELETE /api/android/devices/[id]` — تعديل/حذف جهاز
- [x] `POST /api/android/register` — تسجيل جهاز Android جديد
- [x] `POST /api/android/sync` — استقبال عمليات من Android
- [x] `GET /api/owner/dashboard` — لوحة تحكم المالك (OWNER فقط)

### الواجهة (Frontend)
- [x] `/` — صفحة الهبوط (landing page) مع التسعير
- [x] `/auth/login` — صفحة تسجيل الدخول
- [x] `/auth/register` — صفحة إنشاء حساب
- [x] `/dashboard` — لوحة التحكم الرئيسية
- [x] `/transactions` — قائمة العمليات مع فلترة + إضافة + CSV
- [x] `/analytics` — التحليلات والرسوم البيانية
- [x] `/budget` — الميزانيات حسب الفئة
- [x] `/reports` — تصدير PDF/Excel
- [x] `/settings` — الإعدادات الشخصية + أجهزة Android
- [x] `/owner` — لوحة المالك (OWNER فقط)
- [x] `/privacy` — سياسة الخصوصية (عربي + PDPL)
- [x] `/terms` — الشروط والأحكام

### المكتبات والمساعدات
- [x] `src/lib/auth.ts` — JWT، bcrypt، إدارة الجلسات
- [x] `src/lib/financial.ts` — Decimal.js، autoCategory، parseNotificationText، isDuplicate
- [x] `src/lib/prisma.ts` — Prisma ORM singleton
- [x] `src/lib/api.ts` — apiResponse، apiError، apiSuccess، parsePagination
- [x] `src/components/layout/AppShell.tsx` — shell مع sidebar وdark mode

### قاعدة البيانات
- [x] Prisma schema مع النماذج: User، Session، Transaction، Budget، Subscription، Alert، AndroidDevice، DailySnapshot
- [x] Enums: UserPlan، UserRole، TransactionType، TransactionSource

### تطبيق Android
- [x] `NotificationService.java` — NotificationListenerService
- [x] `NotificationParser.java` — محلل الإشعارات العربية/الإنجليزية + فلتر OTP
- [x] `ApiClient.java` — OkHttp للاتصال بالخادم
- [x] `TransactionQueue.java` — قائمة انتظار محلية للعمليات
- [x] `SyncWorker.java` — WorkManager للمزامنة الدورية
- [x] `SecurePrefs.java` — EncryptedSharedPreferences
- [x] `LoginActivity.java` + `MainActivity.java` — واجهات المستخدم
- [x] `BootReceiver.java` — إعادة تشغيل بعد reboot

### PWA
- [x] `public/manifest.json` — Web App Manifest
- [x] `public/icon.svg` — أيقونة التطبيق

### الاختبارات
- [x] `src/__tests__/financial.test.ts` — اختبارات الدوال المالية
- [x] `src/__tests__/auth.test.ts` — اختبارات المصادقة
- [x] `src/__tests__/api.test.ts` — اختبارات مساعدات API

---

## ما يتطلب إجراءً من المالك قبل الإطلاق 🔲

| المهمة | الوصف |
|--------|-------|
| بوابة الدفع | ربط Moyasar أو HyperPay لتفعيل الاشتراكات المدفوعة |
| Google AdSense | إضافة وحدات إعلانية للمستخدمين المجانيين |
| نطاق + SSL | شراء نطاق وتوجيهه للخادم (Vercel/Railway) |
| Google Play | إنشاء حساب مطور ورفع APK |
| متغيرات الإنتاج | `JWT_SECRET`، `DATABASE_URL`، `OWNER_EMAIL` في لوحة Vercel |

---

## الإعدادات الأمنية المهمة

- `OWNER_EMAIL` في `.env.local` يحدد حساب المالك
- JWT يُخزَّن في HTTP-only cookie (لا XSS)
- الجلسات تُحذَّف من DB عند الخروج (إلغاء الرمز ممكن)
- `parseNotificationText` يفلتر OTP قبل أي معالجة
- `requireOwner` يتحقق من دور OWNER في كل endpoint حساس
- **لا يُعرض** أي بيانات مالية للمستخدمين الفرديين في لوحة المالك
