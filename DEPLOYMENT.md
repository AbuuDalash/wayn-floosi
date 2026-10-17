# دليل النشر — وين فلوسي؟

## المتطلبات
- Node.js 20+
- PostgreSQL 16+
- حساب Vercel (أو Railway/Render للـ full-stack)

---

## ١. النشر على Vercel (موصى به للبداية)

### الإعداد
```bash
npm install -g vercel
vercel login
vercel
```

### متغيرات البيئة في Vercel Dashboard
أضف هذه المتغيرات في Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/wayn_floosi_db
JWT_SECRET=<generate: openssl rand -base64 64>
NEXTAUTH_SECRET=<generate: openssl rand -base64 64>
OWNER_EMAIL=a.aldhabatti@gmail.com
NODE_ENV=production
```

**تحذير أمني:** لا تضع هذه القيم في أي ملف يُرفع لـ Git.

### قاعدة البيانات
استخدم Neon (PostgreSQL مجاني) أو Supabase:
1. أنشئ قاعدة بيانات
2. انسخ connection string إلى `DATABASE_URL`
3. شغّل المهاجرة: `npx prisma@5.22.0 db push`

---

## ٢. التطوير المحلي

```bash
git clone <repo-url>
cd wayn-floosi
npm install
cp .env.local.example .env.local  # عدّل القيم
npx prisma@5.22.0 generate
npx prisma@5.22.0 db push
npm run dev
```

الموقع يعمل على: http://localhost:3000

---

## ٣. بناء الإنتاج

```bash
npm run build
npm start
```

---

## ٤. تطبيق Android

1. افتح `android/` في Android Studio
2. عدّل `Constants.java`:
   ```java
   public static final String BASE_URL = "https://your-domain.vercel.app";
   ```
3. ابنِ APK موقّع:
   - Build → Generate Signed Bundle/APK
   - أنشئ Keystore جديد
4. ارفع على Google Play Console

---

## ٥. إضافة بوابة دفع (Moyasar)

1. سجّل على moyasar.com واحصل على API keys
2. أضف `MOYASAR_API_KEY` في Vercel Environment Variables
3. أنشئ `src/app/api/payments/checkout/route.ts`
4. أضف webhook handler لتحديث خطة المستخدم

---

## ٦. Google AdSense

1. سجّل موقعك على Google AdSense
2. أضف Publisher ID في `.env.local`:
   ```
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
   ```
3. أضف وحدة إعلانية في AppShell.tsx للمستخدمين المجانيين:
   ```tsx
   {user.plan === 'FREE' && (
     <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} />
   )}
   ```

---

## ٧. الصحة والمراقبة

- راقب `/api/analytics` لمعرفة استخدام المستخدمين
- راقب `/api/owner/dashboard` لمتابعة النمو
- استخدم Vercel Analytics المدمج لمتابعة أداء الموقع

---

## ٨. HTTPS وCSP

Vercel يوفر HTTPS تلقائيًا. للـ Content Security Policy، أضف في `next.config.js`:

```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```
