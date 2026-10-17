import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import TransactionsClient from './TransactionsClient';

export const metadata: Metadata = { title: 'العمليات المالية' };

export default function TransactionsPage() {
  return (
    <AppShell>
      <TransactionsClient />
    </AppShell>
  );
}
