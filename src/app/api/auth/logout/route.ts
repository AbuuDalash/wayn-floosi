import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiResponse } from '@/lib/api';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }

  const response = apiResponse({ success: true, message: 'تم تسجيل الخروج' });
  response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
  return response;
}
