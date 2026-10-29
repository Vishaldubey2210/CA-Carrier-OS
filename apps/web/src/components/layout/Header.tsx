'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Building,
  User,
  Check,
  Bell,
  Settings,
  HelpCircle,
  Menu,
  X,
  LayoutDashboard,
  Compass,
  Briefcase,
  FileText,
  MessageSquareCode,
  BriefcaseBusiness,
  TrendingUp,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { WorkspaceType } from '@ca-career-os/shared';
import { apiClient } from '../../lib/api-client';

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/onboarding', label: 'Onboarding Wizard', icon: Sparkles },
  { href: '/career', label: 'Career Pathway', icon: Compass },
  { href: '/jobs', label: 'Job Discovery', icon: Briefcase },
  { href: '/resumes', label: 'Verified Resumes', icon: FileText },
  { href: '/interviews', label: 'Interview Prep', icon: MessageSquareCode },
  { href: '/growth', label: 'Growth & Mentorship', icon: TrendingUp },
  { href: '/practice', label: 'Practice OS', icon: BriefcaseBusiness },
  { href: '/billing', label: 'Billing & Plans', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeWorkspace, workspaces, switchWorkspace, logout, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'degraded'>('checking');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function checkApi() {
      try {
        const res = await fetch('/api/v1/health');
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setApiStatus(data?.data?.status === 'healthy' || data?.status === 'healthy' ? 'healthy' : 'degraded');
          }
        } else {
          if (mounted) setApiStatus('degraded');
        }
      } catch {
        if (mounted) setApiStatus('degraded');
      }
    }
    checkApi();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    let mounted = true;
    async function loadNotifications() {
      if (!isAuthenticated) return;
      try {
        const res = await apiClient.get<any>('/notifications');
        if (mounted && res?.success && res.data) {
          setNotifications(res.data.items || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch {
        // Fallback
      }
    }
    loadNotifications();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read', {});
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Fallback
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="app-header">
      {/* Left: Mobile Menu Trigger + Workspace Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {activeWorkspace?.type === WorkspaceType.ORGANIZATION ? (
              <Building size={14} color="var(--brand-teal)" />
            ) : (
              <User size={14} color="var(--brand-primary)" />
            )}
            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeWorkspace?.name || 'Personal Workspace'}
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
              {activeWorkspace?.role || 'OWNER'}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '260px',
                zIndex: 50,
                padding: '0.5rem',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '0.375rem 0.5rem', fontWeight: 600 }}>
                Your Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.5rem 0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    background: activeWorkspace?.id === ws.id ? 'var(--brand-soft)' : 'transparent',
                    border: 'none',
                    color: activeWorkspace?.id === ws.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: activeWorkspace?.id === ws.id ? 600 : 500,
                    textAlign: 'left',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    {ws.type === WorkspaceType.ORGANIZATION ? <Building size={14} /> : <User size={14} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ws.name}
                    </span>
                  </div>
                  {activeWorkspace?.id === ws.id && <Check size={14} color="var(--brand-primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Security, Notifications & User Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Phase 2 Security Badge */}
        <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
          <ShieldCheck size={12} /> Candidate Blindfold
        </span>

        {/* Notifications Bell */}
        {isAuthenticated && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              title="Notifications"
              style={{
                position: 'relative',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem',
                color: unreadCount > 0 ? 'var(--brand-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--brand-primary)',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {notifsOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  zIndex: 60,
                  padding: '1rem',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontSize: '0.6875rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 600,
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.625rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: n.isRead ? 'var(--surface-primary)' : 'var(--brand-soft)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Link */}
        <Link
          href="/help"
          title="Help & Knowledge Base"
          style={{
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <HelpCircle size={15} />
        </Link>

        {/* Settings Link */}
        <Link
          href="/settings"
          title="Account Settings"
          style={{
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Settings size={15} />
        </Link>

        {/* User Pill & Logout */}
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              href="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.5rem 0.25rem 0.25rem',
                borderRadius: '9999px',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {(user.firstName?.[0] || 'C') + (user.lastName?.[0] || '')}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.firstName} {user.lastName || ''}
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                {user.role}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign out of CharteredOS"
              style={{
                background: 'var(--danger-surface)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem',
                color: 'var(--danger-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="mobile-nav-drawer">
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                  }}
                >
                  CO
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    CharteredOS
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    CAREER PLATFORM
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                aria-label="Close Navigation"
              >
                <X size={20} />
              </button>
            </div>

            <nav
              style={{
                padding: '0.75rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                overflowY: 'auto',
              }}
            >
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--surface-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={14} color="var(--success-text)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-text)' }}>
                  Candidate Blindfold Active
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Search activity hidden from current employers.
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
