import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return apiError('غير مصرح', 401);

  return apiResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    role: user.role,
    currency: user.currency,
    salaryDay: user.salaryDay,
    monthlySalary: user.monthlySalary?.toString() ?? null,
  });
}
