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

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(t.amount.toString()), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount.toString()), 0);
  const net = totalIncome - totalExpense;

  const rows = transactions.map(t => `
    <tr>
      <td>${new Date(t.date).toLocaleDateString('ar-SA')}</td>
      <td>${t.merchant || t.description || '—'}</td>
      <td>${t.category}</td>
      <td style="color:${t.type === 'INCOME' ? 'green' : 'red'}">${t.type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount.toString()).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>تقرير مالي</title>
<style>
  body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
  h1 { color: #16a34a; }
  .summary { display: flex; gap: 20px; margin: 20px 0; }
  .stat { background: #f0fdf4; padding: 12px 20px; border-radius: 8px; }
  .stat .label { font-size: 12px; color: #666; }
  .stat .value { font-size: 18px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #16a34a; color: white; padding: 8px 12px; text-align: right; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  tr:nth-child(even) { background: #f9f9f9; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>تقرير مالي — وين فلوسي؟</h1>
<p style="color:#666">الفترة: ${from.toLocaleDateString('ar-SA')} — ${to.toLocaleDateString('ar-SA')}</p>
<div class="summary">
  <div class="stat"><div class="label">إجمالي الدخل</div><div class="value" style="color:green">${totalIncome.toFixed(2)} ر.س</div></div>
  <div class="stat"><div class="label">إجمالي المصروفات</div><div class="value" style="color:red">${totalExpense.toFixed(2)} ر.س</div></div>
  <div class="stat"><div class="label">الرصيد الصافي</div><div class="value" style="color:${net >= 0 ? 'green' : 'red'}">${net.toFixed(2)} ر.س</div></div>
  <div class="stat"><div class="label">عدد العمليات</div><div class="value">${transactions.length}</div></div>
</div>
<table>
  <thead><tr><th>التاريخ</th><th>الجهة / الوصف</th><th>الفئة</th><th>المبلغ (ر.س)</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="report-${from.toISOString().slice(0,10)}.html"`,
    },
  });
}
