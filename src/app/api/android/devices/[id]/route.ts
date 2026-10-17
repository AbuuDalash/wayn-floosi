import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);
  const device = await prisma.androidDevice.findFirst({ where: { id: params.id, userId: user.id } });
  if (!device) return apiError('الجهاز غير موجود', 404);
  const body = await req.json();
  const updated = await prisma.androidDevice.update({
    where: { id: params.id },
    data: { syncEnabled: body.syncEnabled },
  });
  return apiSuccess(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);
  const device = await prisma.androidDevice.findFirst({ where: { id: params.id, userId: user.id } });
  if (!device) return apiError('الجهاز غير موجود', 404);
  await prisma.androidDevice.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
}
