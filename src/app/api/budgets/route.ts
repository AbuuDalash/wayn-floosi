import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';

const budgetSchema = z.object({
  category: z.string().min(1),
  limitAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().default('SAR'),
  period: z.enum(['monthly', 'weekly', 'yearly']).default('monthly'),
});

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const budgets = await prisma.budget.findMany({
    where: { userId: user!.id, isActive: true },
    orderBy: { category: 'asc' },
  });

  return apiResponse(budgets.map((b) => ({ ...b, limitAmount: b.limitAmount.toString() })));
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

  const budget = await prisma.budget.upsert({
    where: {
      userId_category_period: {
        userId: user!.id,
        category: parsed.data.category,
        period: parsed.data.period,
      },
    },
    create: { userId: user!.id, ...parsed.data },
    update: { limitAmount: parsed.data.limitAmount, isActive: true },
  });

  return apiResponse({ ...budget, limitAmount: budget.limitAmount.toString() }, 201);
}
