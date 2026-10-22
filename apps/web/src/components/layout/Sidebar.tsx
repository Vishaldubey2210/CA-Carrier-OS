'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  FileText,
  MessageSquareCode,
  BriefcaseBusiness,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  User,
} from 'lucide-react';
import { WorkspaceType } from '@ca-career-os/shared';

const CANDIDATE_NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/career', label: 'Career Pathway', icon: Compass },
  { href: '/jobs', label: 'Job Discovery', icon: Briefcase },
  { href: '/resumes', label: 'Verified Resumes', icon: FileText },
  { href: '/interviews', label: 'Interview Prep', icon: MessageSquareCode },
  { href: '/growth', label: 'Growth & Mentorship', icon: TrendingUp },
  { href: '/practice', label: 'Practice OS', icon: BriefcaseBusiness },
  { href: '/billing', label: 'Billing & Plans', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeWorkspace } = useAuth();

  const isOrg = activeWorkspace?.type === WorkspaceType.ORGANIZATION;

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9375rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            CA
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              CA Career OS
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              ICAI PROFESSIONAL
            </div>
          </div>
        </Link>
      </div>

      {/* Workspace Context Badge */}
      <div style={{ padding: '0.875rem 1rem 0.5rem' }}>
        <div
          style={{
            padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Active Workspace
            </span>
            <span className={isOrg ? 'badge badge-cyan' : 'badge badge-indigo'} style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
              {isOrg ? 'Organization' : 'Personal'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {isOrg ? <Building size={12} color="var(--accent-cyan)" /> : <User size={12} color="var(--accent-indigo)" />}
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeWorkspace?.name || 'Personal Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ padding: '0.5rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {CANDIDATE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security & Verification Footer */}
      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            Candidate Blindfold Active
          </span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Tenant boundary isolated. Search activity hidden from current employers.
        </div>
      </div>
    </aside>
  );
}
