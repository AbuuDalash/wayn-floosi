/**
 * Android Companion sync endpoint.
 * Receives financial transactions parsed from notifications on-device.
 * Authenticated via device JWT tied to user account.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';
import { autoCategory, isDuplicate } from '@/lib/financial';

const syncSchema = z.object({
  deviceId: z.string().min(1),
  transactions: z.array(
    z.object({
      localId: z.string(),
      amount: z.string(),
      currency: z.string().default('SAR'),
      type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
      merchant: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      rawText: z.string().optional(),
      date: z.string().datetime(),
    })
  ).max(100),
});

export async function POST(req: NextRequest) {
  // Auth: Bearer token from Android app
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiError('رمز المصادقة مطلوب', 401);

  const payload = verifyToken(token);
  if (!payload) return apiError('رمز مصادقة غير صالح', 401);

  // Verify session
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return apiError('انتهت صلاحية الجلسة', 401);

  const user = session.user;

  try {
    const body = await req.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { deviceId, transactions } = parsed.data;

    // Register/update device
    await prisma.androidDevice.upsert({
      where: { deviceId },
      create: {
        userId: user.id,
        deviceId,
        lastSyncAt: new Date(),
        isActive: true,
      },
      update: {
        lastSyncAt: new Date(),
        isActive: true,
      },
    });

    // Check device belongs to user
    const device = await prisma.androidDevice.findFirst({
      where: { deviceId, userId: user.id },
    });
    if (!device) return apiError('الجهاز غير مرتبط بهذا الحساب', 403);
    if (!device.syncEnabled) return apiError('المزامنة معطلة لهذا الجهاز', 403);

    const results = {
      synced: 0,
      duplicates: 0,
      errors: [] as string[],
      processedIds: [] as string[],
    };

    for (const tx of transactions) {
      try {
        const txDate = new Date(tx.date);
        const category = autoCategory(tx.merchant || null, tx.description || null);

        // Duplicate check: same amount+merchant within 5 min
        const recentSimilar = await prisma.transaction.findFirst({
          where: {
            userId: user.id,
            amount: parseFloat(tx.amount),
            source: 'ANDROID_NOTIFICATION',
            date: { gte: new Date(txDate.getTime() - 5 * 60 * 1000) },
          },
        });

        const duplicate = recentSimilar
          ? isDuplicate(
              { amount: tx.amount, merchant: tx.merchant || null, date: txDate },
              {
                amount: recentSimilar.amount.toString(),
                merchant: recentSimilar.merchant,
                date: recentSimilar.date,
              }
            )
          : false;

        if (duplicate) {
          results.duplicates++;
          results.processedIds.push(tx.localId);
          continue;
        }

        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: tx.amount,
            currency: tx.currency,
            type: tx.type,
            category,
            merchant: tx.merchant,
            description: tx.description,
            rawText: tx.rawText,
            date: txDate,
            source: 'ANDROID_NOTIFICATION',
          },
        });

        results.synced++;
        results.processedIds.push(tx.localId);
      } catch (txErr) {
        results.errors.push(`${tx.localId}: ${String(txErr)}`);
      }
    }

    return apiResponse({
      success: true,
      message: `تمت مزامنة ${results.synced} عملية`,
      ...results,
      lastSync: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Android sync error:', err);
    return apiError('خطأ في المزامنة', 500);
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiError('رمز المصادقة مطلوب', 401);

  const payload = verifyToken(token);
  if (!payload) return apiError('رمز مصادقة غير صالح', 401);

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return apiError('انتهت صلاحية الجلسة', 401);

  const deviceId = req.nextUrl.searchParams.get('deviceId');
  if (!deviceId) return apiError('معرّف الجهاز مطلوب', 400);

  const device = await prisma.androidDevice.findFirst({
    where: { deviceId, userId: session.user.id },
  });

  return apiResponse({
    connected: !!device,
    syncEnabled: device?.syncEnabled ?? false,
    lastSyncAt: device?.lastSyncAt?.toISOString() ?? null,
  });
}
