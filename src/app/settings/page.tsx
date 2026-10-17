import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = { title: 'الإعدادات' };

export default function SettingsPage() {
  return <AppShell><SettingsClient /></AppShell>;
}
