import { NextResponse } from 'next/server';

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

/** Parse and validate pagination params from a NextRequest or URLSearchParams */
export function parsePagination(req: import('next/server').NextRequest): { page: number; limit: number; skip: number };
export function parsePagination(sp: URLSearchParams): { page: number; limit: number; skip: number };
export function parsePagination(input: import('next/server').NextRequest | URLSearchParams) {
  const sp = 'nextUrl' in input ? input.nextUrl.searchParams : input;
  const page = Math.max(1, parseInt(sp.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
