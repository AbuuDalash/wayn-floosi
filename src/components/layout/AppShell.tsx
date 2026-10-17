'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: string;
}

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { href: '/transactions', label: 'العمليات', icon: '💳' },
  { href: '/budget', label: 'الميزانية', icon: '🎯' },
  { href: '/analytics', label: 'التحليلات', icon: '📊' },
  { href: '/reports', label: 'التقارير', icon: '📄' },
  { href: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setUser(data);
        else router.push('/auth/login');
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
            ؟
          </div>
          <div className="skeleton w-32 h-3 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 flex flex-col border-l transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
              ؟
            </div>
            <span className="font-logo text-xl" style={{ color: 'var(--text)' }}>وين فلوسي؟</span>
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              {user.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
              <span className={`badge text-xs ${user.plan === 'PREMIUM' ? 'badge-green' : 'badge-gray'}`}>
                {user.plan === 'PREMIUM' ? '⭐ بريميوم' : 'مجاني'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'text-white'
                    : 'hover:opacity-80'
                }`}
                style={{
                  background: active ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'transparent',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {user.role === 'OWNER' && (
            <Link href="/owner"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith('/owner') ? 'text-white' : ''
              }`}
              style={{
                background: pathname.startsWith('/owner') ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
                color: pathname.startsWith('/owner') ? 'white' : 'var(--text-secondary)',
              }}>
              <span className="text-lg">👑</span>
              لوحة المالك
            </Link>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          <button onClick={toggleDark}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all btn-secondary">
            <span>{darkMode ? '☀️' : '🌙'}</span>
            {darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all btn-secondary text-red-500">
            <span>🚪</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl"
          style={{ background: 'var(--bg-card)/90', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-logo text-lg" style={{ color: 'var(--text)' }}>وين فلوسي؟</span>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
