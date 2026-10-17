import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { user, error } = await requireOwner(req);
  if (error) return apiError(error.error, error.status);

  // Aggregate stats — never expose individual user financial data
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalUsers,
    premiumUsers,
    newUsersThisMonth,
    activeUsersThisMonth,
    totalTransactions,
    androidDevices,
    // Revenue: only confirmed subscription upgrades (placeholder until payment gateway is connected)
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { plan: 'PREMIUM', isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({
      where: {
        transactions: { some: { createdAt: { gte: monthStart } } },
      },
    }),
    prisma.transaction.count(),
    prisma.androidDevice.count({ where: { isActive: true } }),
  ]);

  const lastMonthUsers = await prisma.user.count({
    where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
  });

  const userGrowthPct =
    lastMonthUsers > 0
      ? (((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1)
      : null;

  // Estimated ad revenue — placeholder, actual data comes from AdSense dashboard
  // These are estimates only; actual transferred amounts come from your AdSense account
  const estimatedAdRevenue = null; // Connect AdSense Reporting API for real numbers

  return apiResponse({
    // User metrics — no individual financial data included
    users: {
      total: totalUsers,
      premium: premiumUsers,
      free: totalUsers - premiumUsers,
      newThisMonth: newUsersThisMonth,
      activeThisMonth: activeUsersThisMonth,
      growthPercent: userGrowthPct,
      androidDevices,
    },
    // Revenue — only confirmed data
    revenue: {
      confirmedSubscriptions: {
        // Placeholder: connect Moyasar/HyperPay webhook to populate
        monthly: null,
        total: null,
        note: 'يتطلب ربط بوابة الدفع لعرض البيانات الفعلية',
      },
      estimatedAdRevenue: {
        value: estimatedAdRevenue,
        note: 'يتطلب ربط AdSense Reporting API. لا يمثل مبالغ محوّلة فعليًا.',
      },
      operatingCosts: {
        // Fill in manually or connect to cloud provider API
        note: 'أدخل تكاليف التشغيل يدويًا (استضافة، نطاق، خدمات)',
      },
    },
    activity: {
      totalTransactions,
      // Activity counts only, no transaction content
    },
    generatedAt: now.toISOString(),
    disclaimer:
      'الإيرادات المعروضة تقديرية. المبالغ الفعلية المحوّلة إلى حسابك البنكي تأتي من لوحة تحكم بوابة الدفع ومنصة AdSense مباشرة.',
  });
}
