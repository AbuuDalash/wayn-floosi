import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = { title: 'التحليلات' };

export default function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsClient />
    </AppShell>
  );
}
