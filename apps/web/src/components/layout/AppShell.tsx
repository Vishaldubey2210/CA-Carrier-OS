'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { Loader2 } from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/verify-email',
];

const PUBLIC_MARKETING_ROUTES = [
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

const OPEN_DIRECTORY_ROUTES = ['/jobs', '/articleship'];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';

  // 1. Dedicated Authentication Routes
  const isAuthPage = AUTH_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + '/')
  );

  // 2. Public Marketing & Informational Routes
  const isMarketingPage = PUBLIC_MARKETING_ROUTES.includes(normalizedPath);

  // 3. Open Directory Routes (accessible to both guests and logged-in users)
  const isOpenDirectoryPage = OPEN_DIRECTORY_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + '/')
  );

  // 4. Protected Workspace Routes (Dashboard, Career, Resumes, etc.)
  const isProtectedRoute = !isAuthPage && !isMarketingPage && !isOpenDirectoryPage;

  // Handle protected route redirection
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, pathname, router]);

  // Auth pages: Clean standalone view (no sidebar, no header, no dashboard behind)
  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--page-background)' }}>
        <div className="bg-mesh" />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      </div>
    );
  }

  // Public marketing pages: Public header + content + public footer
  if (isMarketingPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--page-background)' }}>
        <div className="bg-mesh" />
        <PublicHeader />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // Open directory pages (Jobs & Articleship) when guest:
  // Render with Public Header & Footer (clean portal without unauthorized dashboard shell)
  if (isOpenDirectoryPage && !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--page-background)' }}>
        <div className="bg-mesh" />
        <PublicHeader />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // If visiting protected route while loading auth state, show clean loader
  if (isProtectedRoute && isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          background: 'var(--page-background)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <Loader2 size={24} className="spin" color="var(--brand-primary)" />
        <span>Securing workspace session...</span>
      </div>
    );
  }

  // If unauthenticated on protected route, do NOT render dashboard shell (redirect will trigger)
  if (isProtectedRoute && !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          background: 'var(--page-background)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <Loader2 size={24} className="spin" color="var(--brand-primary)" />
        <span>Redirecting to sign in...</span>
      </div>
    );
  }

  // Authenticated Application Container (Dashboard, Articleship, Jobs for logged in users)
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
