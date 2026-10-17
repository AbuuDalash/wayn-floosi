# وين فلوسي؟ — Android App

تطبيق Android المصاحب لمنصة **وين فلوسي؟**. يعمل على استيراد معاملاتك البنكية تلقائيًا من إشعارات البنوك السعودية باستخدام `NotificationListenerService`.

## المتطلبات

- Android Studio Hedgehog (2023.1) أو أحدث
- Android SDK 34
- Java 17
- جهاز/محاكي يعمل بـ Android 8.0 (API 26) أو أعلى

## الإعداد

1. **فتح المشروع في Android Studio:**
   ```
   File → Open → اختر مجلد /android
   ```

2. **تحديد مسار SDK:**
   في ملف `local.properties`:
   ```properties
   sdk.dir=/path/to/your/Android/sdk
   ```

3. **تعديل عنوان الخادم:**
   في `app/src/main/java/com/waynfloosi/app/Constants.java`:
   ```java
   public static final String BASE_URL = "https://your-domain.com";
   ```

4. **البناء والتشغيل:**
   ```
   Build → Make Project
   Run → Run 'app'
   ```

## الصلاحيات المطلوبة

| الصلاحية | السبب |
|---|---|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | قراءة إشعارات البنوك |
| `INTERNET` | مزامنة المعاملات مع الخادم |
| `RECEIVE_BOOT_COMPLETED` | إعادة تشغيل العمال بعد إعادة التشغيل |

## البنوك المدعومة

يتعرف التطبيق تلقائيًا على إشعارات:
- بنك الراجحي (`com.rajhi.alrajhibank`)
- البنك الأهلي (`com.alfaisaliah.alinmaaapp`, `com.stc.stcpay`)
- بنك الرياض (`com.riyadbank`)
- مصرف الإنماء (`com.alinma`)
- البنك السعودي الفرنسي (`com.bankalbilad`)
- مصرف الراجحي (`com.alrajhibank.android`)
- بنك الجزيرة (`com.aljazira.bank`)
- بنك البلاد (`com.bankalbilad.personal`)
- بنك ساب (`com.sabb`)
- أبشر وغيرها

## الأمان

- بيانات الاعتماد مشفرة بـ AES-256-GCM عبر `EncryptedSharedPreferences`
- لا يُخزَّن أي رقم سري بنكي أو كلمة مرور بنكية
- التطبيق يقرأ **النص** فقط من الإشعارات ولا يتفاعل مع تطبيقات البنوك
- رسائل OTP تُرشَّح تلقائيًا ولا تُرسَل أبدًا للخادم

## البنية التقنية

```
com.waynfloosi.app/
├── WaynFloosiApp.java       — Application class, WorkManager init
├── Constants.java           — BASE_URL, config constants
├── SecurePrefs.java         — EncryptedSharedPreferences wrapper
├── NotificationParser.java  — Arabic/English amount parsing, OTP filter
├── ApiClient.java           — OkHttp3 REST client
├── TransactionQueue.java    — Local queue (max 150 items)
├── NotificationService.java — NotificationListenerService
├── SyncWorker.java          — WorkManager periodic sync (15 min)
├── BootReceiver.java        — Restart workers after reboot
├── LoginActivity.java       — Login screen
└── MainActivity.java        — Main control screen
```
