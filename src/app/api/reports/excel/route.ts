import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiError } from '@/lib/api';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(new Date().setDate(1));
  const to = searchParams.get('to') ? new Date(searchParams.get('to')! + 'T23:59:59') : new Date();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: from, lte: to }, isDuplicate: false },
    orderBy: { date: 'desc' },
  });

  const header = 'التاريخ,الجهة,الفئة,النوع,المبلغ,العملة,المصدر';
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('ar-SA'),
    `"${(t.merchant || t.description || '').replace(/"/g, '""')}"`,
    t.category,
    t.type === 'INCOME' ? 'دخل' : t.type === 'EXPENSE' ? 'مصروف' : 'تحويل',
    parseFloat(t.amount.toString()).toFixed(2),
    t.currency,
    t.source === 'ANDROID_NOTIFICATION' ? 'تلقائي' : t.source === 'CSV_IMPORT' ? 'CSV' : 'يدوي',
  ].join(','));

  const csv = '﻿' + [header, ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="report-${from.toISOString().slice(0,10)}.csv"`,
    },
  });
}
