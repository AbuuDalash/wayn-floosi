import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  salaryDay: z.number().int().min(1).max(31).optional(),
  currency: z.string().length(3).optional(),
});

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError('بيانات غير صحيحة', 400);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, salaryDay: true, currency: true, plan: true, role: true },
  });
  return apiSuccess(updated);
}
