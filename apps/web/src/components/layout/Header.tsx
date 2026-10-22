'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Building,
  User,
  Check,
} from 'lucide-react';
import { WorkspaceType } from '@ca-career-os/shared';

export function Header() {
  const router = useRouter();
  const { user, activeWorkspace, workspaces, switchWorkspace, logout, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'degraded'>('checking');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="app-header">
      {/* Left: Workspace Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {activeWorkspace?.type === WorkspaceType.ORGANIZATION ? (
              <Building size={14} color="var(--accent-cyan)" />
            ) : (
              <User size={14} color="var(--accent-indigo)" />
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
                background: '#0d1322',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '0.375rem 0.5rem' }}>
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
                    background: activeWorkspace?.id === ws.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: 'none',
                    color: activeWorkspace?.id === ws.id ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
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
                  {activeWorkspace?.id === ws.id && <Check size={14} color="var(--accent-indigo)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Security & Session Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Phase 2 Security Badge */}
        <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
          <ShieldCheck size={12} /> RBAC Isolated
        </span>

        {/* User Pill & Logout */}
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.5rem 0.25rem 0.25rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.firstName} {user.lastName}
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of CA Career OS"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                color: 'var(--text-muted)',
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
            <Link href="/login" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
