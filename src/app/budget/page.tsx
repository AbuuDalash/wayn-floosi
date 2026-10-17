import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import BudgetClient from './BudgetClient';

export const metadata: Metadata = { title: 'الميزانية' };

export default function BudgetPage() {
  return <AppShell><BudgetClient /></AppShell>;
}
