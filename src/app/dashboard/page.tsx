import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = { title: 'الرئيسية' };

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
