import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const schema = z.object({
  deviceName: z.string().min(1).max(100),
  deviceModel: z.string().max(100).optional(),
  deviceId: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError('بيانات غير صحيحة', 400);

  const name = parsed.data.deviceModel
    ? `${parsed.data.deviceName} (${parsed.data.deviceModel})`
    : parsed.data.deviceName;

  const deviceId = parsed.data.deviceId || randomUUID();

  const existing = await prisma.androidDevice.findFirst({
    where: { userId: user.id, deviceId },
  });

  if (existing) {
    return apiSuccess({ deviceId: existing.id, alreadyRegistered: true });
  }

  const device = await prisma.androidDevice.create({
    data: { userId: user.id, deviceId, deviceName: name, syncEnabled: true },
    select: { id: true, deviceName: true, syncEnabled: true },
  });

  return apiSuccess({ deviceId: device.id, deviceName: device.deviceName });
}
