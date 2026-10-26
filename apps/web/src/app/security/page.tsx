'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  Cpu,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function SecurityArchitecturePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>
            ENTERPRISE SECURITY CONTROLS
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '1rem',
          }}
        >
          Security Architecture & Data Protection
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          How CA Career OS protects confidential articleship records, client compliance portfolios, and candidate privacy through cryptographic and architectural guarantees.
        </p>

        {/* Technical Architecture Review Notice */}
        <div
          style={{
            maxWidth: '720px',
            margin: '1.5rem auto 0',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={16} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: '#fcd34d', textAlign: 'left', lineHeight: 1.5 }}>
            <strong>Operating Security Disclosure:</strong> Architecture specifications describe active codebase security mechanisms (scrypt, AES-GCM, tenant boundaries). Formal SOC 2 / ISO 27001 third-party audit reports will be published post-commercial launch.
          </span>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Lock size={26} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Multi-Tenant Isolation
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Every query and mutation strictly enforces foreign-key workspace boundaries. Candidate workspaces and employer workspaces are separated by hard RBAC authorization guards.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Key size={26} color="var(--accent-indigo)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Cryptographic Authentication
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Passwords hashed with memory-hard scrypt algorithms. Sessions governed by 15-minute JWT access tokens and 7-day rotated HttpOnly refresh cookies with reuse attack detection.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Cpu size={26} color="var(--accent-amber)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            AI Safety & Prompt Defense
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            4 distinct permission tiers (READ_ONLY, WRITE, EXPLICITLY_APPROVED, DESTRUCTIVE). Destructive tools require cryptographically signed approval tokens before execution.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Database size={26} color="var(--accent-emerald)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Immutable Audit Logging
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Critical administrative, recruiter, and candidate mutations generate structured audit trail records storing correlation IDs and SHA-256 payload checksums.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <FileCheck2 size={26} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            HMAC Webhook Verification
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Payment notifications from Razorpay are verified using HMAC SHA-256 signatures with event replay defense and database idempotency logging.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <ShieldCheck size={26} color="var(--accent-emerald)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Candidate Blindfold Policy
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Active candidate search status, applications, and salary targets are shielded from employer discovery. Recruiters from your current firm cannot see your profile.
          </p>
        </div>
      </div>

      {/* Vulnerability Disclosure Section */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          Responsible Vulnerability Disclosure
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          We welcome responsible disclosure from security researchers and Chartered Accountants. If you discover a potential vulnerability in our authentication, tenant boundaries, or API endpoints, please report it directly:
        </p>
        <div style={{ display: 'inline-block', padding: '0.75rem 1.25rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.9375rem' }}>
          security@cacareeros.com
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', margin: '0.75rem 0 0 0' }}>
          We commit to acknowledging all valid vulnerability submissions within 24 hours.
        </p>
      </div>
    </div>
  );
}
