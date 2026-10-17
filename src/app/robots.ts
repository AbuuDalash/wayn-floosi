import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/register', '/auth/login', '/privacy', '/terms'],
      disallow: ['/api/', '/dashboard', '/transactions', '/budget', '/analytics', '/reports', '/settings', '/owner'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
