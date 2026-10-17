import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جدًا').max(100),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  currency: z.string().default('SAR'),
  salaryDay: z.number().min(1).max(31).default(25),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { name, email, password, currency, salaryDay } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('البريد الإلكتروني مستخدم بالفعل', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        currency,
        salaryDay,
        role: email === process.env.OWNER_EMAIL ? 'OWNER' : 'USER',
      },
    });

    const token = generateToken(user.id, user.role);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    const response = apiResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        currency: user.currency,
        salaryDay: user.salaryDay,
      },
      token,
    }, 201);

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return apiError('حدث خطأ في الخادم', 500);
  }
}
