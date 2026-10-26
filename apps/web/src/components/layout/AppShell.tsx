'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Dedicated Authentication Routes
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-otp' ||
    pathname === '/verify-email';

  // 2. Public Marketing & Informational Routes
  const publicRoutes = [
    '/',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/security',
    '/cookies',
    '/help',
    '/how-it-works',
    '/careers',
  ];

  const isPublicPage = publicRoutes.includes(pathname);

  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="bg-mesh" />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      </div>
    );
  }

  // If visiting public marketing or informational pages
  if (isPublicPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="bg-mesh" />
        <PublicHeader />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // Authenticated Application Container
  return (
    <div className="app-container">
      <div className="bg-mesh" />
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
