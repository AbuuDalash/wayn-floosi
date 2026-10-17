import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import OwnerClient from './OwnerClient';

export const metadata: Metadata = { title: 'لوحة المالك' };

export default function OwnerPage() {
  return <AppShell><OwnerClient /></AppShell>;
}
