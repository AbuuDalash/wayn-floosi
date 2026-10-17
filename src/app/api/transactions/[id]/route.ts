import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';
import { autoCategory } from '@/lib/financial';

const updateSchema = z.object({
  amount: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  category: z.string().optional(),
  merchant: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const tx = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user!.id },
  });

  if (!tx) return apiError('العملية غير موجودة', 404);
  return apiResponse({ ...tx, amount: tx.amount.toString() });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) return apiError('العملية غير موجودة', 404);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 400);

  const data = {
    ...parsed.data,
    date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    category: parsed.data.category ||
      autoCategory(parsed.data.merchant || null, parsed.data.description || null),
  };

  const tx = await prisma.transaction.update({
    where: { id: params.id },
    data,
  });

  return apiResponse({ ...tx, amount: tx.amount.toString() });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user!.id },
  });
  if (!existing) return apiError('العملية غير موجودة', 404);

  await prisma.transaction.delete({ where: { id: params.id } });
  return apiResponse({ success: true, message: 'تم الحذف' });
}
