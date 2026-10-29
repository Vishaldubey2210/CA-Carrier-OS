'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            TRANSPARENT PRIVACY PRACTICES
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Cookie Policy
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Operating Draft for Compliance Review | Baseline: October 2026
        </p>
      </div>

      {/* Draft Notice Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <ShieldCheck size={18} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: '#9A3412', lineHeight: 1.5 }}>
          <strong>Draft for Legal Review:</strong> Operating draft disclosing browser storage usage. Confirms exclusive use of strictly necessary session authentication cookies with zero tracking beacons or third-party advertising pixels.
        </span>
      </div>

      {/* Honest Commitment */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={24} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Zero Third-Party Advertising Trackers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              CA Career OS does not deploy behavioral advertising trackers, third-party remarketing pixels, or commercial data-broker cookies. We only set strictly necessary first-party cookies essential for secure session management.
            </p>
          </div>
        </div>
      </div>

      {/* Cookies Inventory Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. What Cookies We Set and Why
          </h2>
          <p style={{ marginBottom: '1.25rem' }}>
            Below is the exhaustive list of cookies set by CA Career OS:
          </p>

          <div className="glass-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Cookie Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Purpose</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Classification</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Security Flags</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>refreshToken</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Maintains authenticated user session; rotates cryptographically to prevent hijacking.</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-indigo">Strictly Essential</span></td>
                  <td style={{ padding: '0.75rem 1rem' }}>7 Days</td>
                  <td style={{ padding: '0.75rem 1rem' }}>HttpOnly, Secure, SameSite=Strict</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Managing Browser Cookies
          </h2>
          <p>
            You can instruct your browser to refuse all cookies or notify you when a cookie is being set. However, because our single cookie is strictly necessary for cryptographic session authentication, disabling it will prevent you from logging into your workspace.
          </p>
        </section>
      </div>
    </div>
  );
}
