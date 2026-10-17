import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { apiError, apiResponse } from '@/lib/api';
import { dailyBudgetRemaining, daysUntilSalary } from '@/lib/financial';
import Decimal from 'decimal.js';

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return apiError(error.error, error.status);

  const sp = req.nextUrl.searchParams;
  const period = sp.get('period') || 'month'; // month | week | year | custom
  const from = sp.get('from');
  const to = sp.get('to');

  let startDate: Date;
  let endDate = new Date();

  if (period === 'custom' && from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
  } else if (period === 'week') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'year') {
    startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
  } else {
    // month
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user!.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  });

  // Totals
  let totalIncome = new Decimal(0);
  let totalExpense = new Decimal(0);
  const categoryMap: Record<string, Decimal> = {};
  const merchantMap: Record<string, Decimal> = {};
  const dailyMap: Record<string, Decimal> = {};

  for (const tx of transactions) {
    const amt = new Decimal(tx.amount.toString());
    if (tx.type === 'INCOME') {
      totalIncome = totalIncome.plus(amt);
    } else if (tx.type === 'EXPENSE') {
      totalExpense = totalExpense.plus(amt);
      categoryMap[tx.category] = (categoryMap[tx.category] || new Decimal(0)).plus(amt);
      if (tx.merchant) {
        merchantMap[tx.merchant] = (merchantMap[tx.merchant] || new Decimal(0)).plus(amt);
      }
      const dayKey = tx.date.toISOString().slice(0, 10);
      dailyMap[dayKey] = (dailyMap[dayKey] || new Decimal(0)).plus(amt);
    }
  }

  // Category breakdown sorted
  const categories = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount: amount.toFixed(2), percentage: 0 }))
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  if (totalExpense.greaterThan(0)) {
    categories.forEach((c) => {
      c.percentage = new Decimal(c.amount)
        .dividedBy(totalExpense)
        .times(100)
        .toDecimalPlaces(1)
        .toNumber();
    });
  }

  // Top merchants
  const topMerchants = Object.entries(merchantMap)
    .map(([name, amount]) => ({ name, amount: amount.toFixed(2) }))
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 10);

  // Daily spending trend
  const dailyTrend = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount: amount.toFixed(2) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user!.id, isActive: true },
    orderBy: { amount: 'desc' },
  });

  // Budget vs actual
  const budgets = await prisma.budget.findMany({
    where: { userId: user!.id, isActive: true },
  });

  const budgetStatus = budgets.map((b) => ({
    category: b.category,
    limit: b.limitAmount.toString(),
    spent: categoryMap[b.category]?.toFixed(2) || '0.00',
    percentage:
      categoryMap[b.category]
        ? new Decimal(categoryMap[b.category])
            .dividedBy(b.limitAmount)
            .times(100)
            .toDecimalPlaces(1)
            .toNumber()
        : 0,
  }));

  // Daily budget remaining
  const daysLeft = daysUntilSalary(user!.salaryDay);
  const dailyRemaining = user!.monthlySalary
    ? dailyBudgetRemaining(
        user!.monthlySalary.toString(),
        totalExpense.toFixed(2),
        user!.salaryDay
      )
    : null;

  return apiResponse({
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    summary: {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netBalance: totalIncome.minus(totalExpense).toFixed(2),
      transactionCount: transactions.length,
      daysUntilSalary: daysLeft,
      dailyBudgetRemaining: dailyRemaining,
    },
    categories,
    topMerchants,
    dailyTrend,
    subscriptions: subscriptions.map((s) => ({
      ...s,
      amount: s.amount.toString(),
    })),
    budgetStatus,
  });
}
