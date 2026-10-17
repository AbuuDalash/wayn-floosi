import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiError, apiResponse, parsePagination } from '@/lib/api';
import { autoCategory, isDuplicate } from '@/lib/financial';

const createSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'مبلغ غير صالح'),
  currency: z.string().default('SAR'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: z.string().optional(),
  merchant: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = parsePagination(sp);

  const where: Record<string, unknown> = { userId: user!.id };

  if (sp.get('type')) where.type = sp.get('type');
  if (sp.get('category')) where.category = sp.get('category');
  if (sp.get('merchant')) where.merchant = { contains: sp.get('merchant'), mode: 'insensitive' };
  if (sp.get('from') || sp.get('to')) {
    where.date = {};
    if (sp.get('from')) (where.date as Record<string, unknown>).gte = new Date(sp.get('from')!);
    if (sp.get('to')) (where.date as Record<string, unknown>).lte = new Date(sp.get('to')!);
  }
  if (sp.get('search')) {
    where.OR = [
      { merchant: { contains: sp.get('search'), mode: 'insensitive' } },
      { description: { contains: sp.get('search'), mode: 'insensitive' } },
    ];
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return apiResponse({
    transactions: transactions.map((t) => ({
      ...t,
      amount: t.amount.toString(),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

    const { amount, currency, type, category, merchant, description, date, tags } = parsed.data;

    const txDate = date ? new Date(date) : new Date();
    const resolvedCategory = category || autoCategory(merchant || null, description || null);

    // Duplicate detection — check last 5 minutes
    const recentSimilar = await prisma.transaction.findFirst({
      where: {
        userId: user!.id,
        amount: parseFloat(amount),
        merchant: merchant || null,
        date: { gte: new Date(txDate.getTime() - 5 * 60 * 1000) },
      },
    });

    const duplicate = recentSimilar
      ? isDuplicate(
          { amount, merchant: merchant || null, date: txDate },
          {
            amount: recentSimilar.amount.toString(),
            merchant: recentSimilar.merchant,
            date: recentSimilar.date,
          }
        )
      : false;

    const tx = await prisma.transaction.create({
      data: {
        userId: user!.id,
        amount,
        currency,
        type,
        category: resolvedCategory,
        merchant,
        description,
        date: txDate,
        isDuplicate: duplicate,
        duplicateOf: duplicate ? recentSimilar!.id : null,
        tags: tags || [],
      },
    });

    // Detect subscription
    if (type === 'EXPENSE' && merchant) {
      await detectSubscription(user!.id, merchant, amount, currency, txDate);
    }

    return apiResponse({ ...tx, amount: tx.amount.toString() }, 201);
  } catch (err) {
    console.error('Create transaction error:', err);
    return apiError('حدث خطأ في الخادم', 500);
  }
}

async function detectSubscription(
  userId: string,
  merchant: string,
  amount: string,
  currency: string,
  date: Date
) {
  // Look for same merchant+amount in the past 25-35 days
  const past = new Date(date);
  past.setDate(past.getDate() - 35);
  const prev = await prisma.transaction.findFirst({
    where: {
      userId,
      merchant: { equals: merchant, mode: 'insensitive' },
      amount: parseFloat(amount),
      date: { gte: past },
    },
    orderBy: { date: 'desc' },
  });

  if (prev) {
    // Check if subscription already tracked
    const existing = await prisma.subscription.findFirst({
      where: { userId, merchant: { equals: merchant, mode: 'insensitive' } },
    });

    if (!existing) {
      await prisma.subscription.create({
        data: {
          userId,
          merchant,
          amount,
          currency,
          frequency: 'MONTHLY',
          lastChargedAt: date,
          nextDueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
    } else {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          lastChargedAt: date,
          nextDueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}
