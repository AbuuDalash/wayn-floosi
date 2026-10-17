import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import ReportsClient from './ReportsClient';

export const metadata: Metadata = { title: 'التقارير' };

export default function ReportsPage() {
  return <AppShell><ReportsClient /></AppShell>;
}
