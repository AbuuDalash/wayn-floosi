import { NextRequest } from 'next/server';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
const TOKEN_EXPIRY = '30d';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export function generateToken(userId: string, role: string): string {
  return sign({ userId, role, iat: Date.now() }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const payload = verify(token, JWT_SECRET) as { userId: string; role: string };
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('auth_token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify token exists in DB (allows revocation)
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return { user: null, error: { error: 'غير مصرح', status: 401 } };
  }
  return { user, error: null };
}

export async function requireOwner(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return { user: null, error };
  if (user?.role !== 'OWNER') {
    return { user: null, error: { error: 'ممنوع — صلاحية المالك فقط', status: 403 } };
  }
  return { user, error: null };
}
