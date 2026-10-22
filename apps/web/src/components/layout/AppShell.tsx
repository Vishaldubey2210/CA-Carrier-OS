'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Route classifications
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicHome = pathname === '/' && !isAuthenticated && !isLoading;

  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="bg-mesh" />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      </div>
    );
  }

  if (isPublicHome) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="bg-mesh" />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      </div>
    );
  }

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
