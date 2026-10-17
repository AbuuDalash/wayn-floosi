import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Arabic, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/site';

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-naskh',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | وين فلوسي؟',
    default: 'وين فلوسي؟ — تتبع مصروفاتك بذكاء',
  },
  description:
    'تطبيق إدارة الميزانية الشخصية الأذكى في السعودية. تتبع مصروفاتك، اكتشف اشتراكاتك، خطط لميزانيتك.',
  keywords: ['وين فلوسي', 'ميزانية', 'مصروفات', 'تطبيق مالي', 'السعودية'],
  authors: [{ name: 'وين فلوسي' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'وين فلوسي؟',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'وين فلوسي؟',
    title: 'وين فلوسي؟ — تتبع مصروفاتك بذكاء',
    description: 'تطبيق إدارة الميزانية الشخصية الأذكى في السعودية.',
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'وين فلوسي؟ — تتبع مصروفاتك بذكاء' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وين فلوسي؟ — تتبع مصروفاتك بذكاء',
    description: 'تتبع مصروفاتك تلقائيًا من إشعارات البنك وخطط لميزانيتك حتى الراتب القادم. مجاني.',
    images: ['/og.png'],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${notoSansArabic.variable} ${notoNaskhArabic.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-[var(--font-noto-sans,sans-serif)] antialiased">
        {children}
      </body>
    </html>
  );
}
