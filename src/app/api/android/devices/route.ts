import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);
  const devices = await prisma.androidDevice.findMany({
    where: { userId: user.id },
    select: { id: true, deviceName: true, syncEnabled: true, lastSyncAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return apiSuccess(devices);
}
