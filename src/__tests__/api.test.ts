import { apiResponse, apiError, apiSuccess, parsePagination } from '../lib/api';
import { NextRequest } from 'next/server';

describe('apiResponse', () => {
  test('creates response with correct status', async () => {
    const res = apiResponse({ ok: true }, 200);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('sets JSON content type', () => {
    const res = apiResponse({}, 200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
  });
});

describe('apiError', () => {
  test('returns error response', async () => {
    const res = apiError('Something went wrong', 400);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Something went wrong');
  });
});

describe('apiSuccess', () => {
  test('returns 200 with data', async () => {
    const res = apiSuccess({ id: '1', name: 'Test' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('1');
  });
});

describe('parsePagination', () => {
  test('defaults to page 1, limit 20', () => {
    const url = new URL('http://localhost/api/test');
    const req = new NextRequest(url);
    const result = parsePagination(req);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  test('parses custom page and limit', () => {
    const url = new URL('http://localhost/api/test?page=3&limit=10');
    const req = new NextRequest(url);
    const result = parsePagination(req);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(20);
  });

  test('clamps limit to 100', () => {
    const url = new URL('http://localhost/api/test?limit=500');
    const req = new NextRequest(url);
    const result = parsePagination(req);
    expect(result.limit).toBeLessThanOrEqual(100);
  });
});
