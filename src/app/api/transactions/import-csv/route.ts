import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';
import { autoCategory } from '@/lib/financial';

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return apiError('لم يتم رفع ملف', 400);

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());

    if (lines.length < 2) return apiError('الملف فارغ أو غير صالح', 400);

    // Auto-detect CSV columns
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));

    const colMap = {
      date: header.findIndex((h) => ['date', 'تاريخ', 'التاريخ'].includes(h)),
      amount: header.findIndex((h) => ['amount', 'مبلغ', 'القيمة', 'value'].includes(h)),
      type: header.findIndex((h) => ['type', 'نوع', 'النوع'].includes(h)),
      merchant: header.findIndex((h) => ['merchant', 'التاجر', 'الجهة', 'name'].includes(h)),
      description: header.findIndex((h) => ['description', 'الوصف', 'notes', 'ملاحظات'].includes(h)),
      category: header.findIndex((h) => ['category', 'الفئة', 'تصنيف'].includes(h)),
    };

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));

        const amount = colMap.amount >= 0 ? cols[colMap.amount] : null;
        if (!amount || isNaN(parseFloat(amount))) {
          results.skipped++;
          continue;
        }

        const rawDate = colMap.date >= 0 ? cols[colMap.date] : null;
        const txDate = rawDate ? new Date(rawDate) : new Date();
        if (isNaN(txDate.getTime())) {
          results.errors.push(`السطر ${i + 1}: تاريخ غير صالح`);
          results.skipped++;
          continue;
        }

        const merchant = colMap.merchant >= 0 ? cols[colMap.merchant] || null : null;
        const description = colMap.description >= 0 ? cols[colMap.description] || null : null;
        const typeRaw = colMap.type >= 0 ? cols[colMap.type].toLowerCase() : '';
        const type =
          typeRaw.includes('income') || typeRaw.includes('دخل') || typeRaw.includes('واردة')
            ? 'INCOME'
            : 'EXPENSE';
        const category =
          colMap.category >= 0 && cols[colMap.category]
            ? cols[colMap.category]
            : autoCategory(merchant, description);

        await prisma.transaction.create({
          data: {
            userId: user!.id,
            amount: Math.abs(parseFloat(amount)).toString(),
            currency: 'SAR',
            type,
            category,
            merchant,
            description,
            date: txDate,
            source: 'CSV_IMPORT',
          },
        });

        results.imported++;
      } catch (rowErr) {
        results.errors.push(`السطر ${i + 1}: ${String(rowErr)}`);
        results.skipped++;
      }
    }

    return apiResponse({
      success: true,
      message: `تم استيراد ${results.imported} عملية بنجاح`,
      ...results,
    });
  } catch (err) {
    console.error('CSV import error:', err);
    return apiError('فشل في معالجة الملف', 500);
  }
}
