'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-primary)',
        padding: '3.5rem 2rem 2.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1.5' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '1rem' }}>
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
                CA
              </div>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                CA Career OS
              </span>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '340px', marginBottom: '1.25rem' }}>
              The sovereign career operating system engineered exclusively for Indian Chartered Accountants, semi-qualified candidates, and accounting practices.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'var(--success-surface)', border: '1px solid var(--success-border)' }}>
              <ShieldCheck size={14} color="var(--success-text)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600 }}>
                Candidate Blindfold Protected
              </span>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', fontWeight: 700 }}>
              Product & Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
              <li><Link href="/features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>All Features</Link></li>
              <li><Link href="/how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>How It Works</Link></li>
              <li><Link href="/pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Subscription Pricing</Link></li>
              <li><Link href="/career" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Career Pathways (7 Tracks)</Link></li>
              <li><Link href="/jobs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Verified Job Discovery</Link></li>
              <li><Link href="/resumes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Zero-Fabrication Resumes</Link></li>
              <li><Link href="/interviews" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mock Interview Simulator</Link></li>
              <li><Link href="/practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Practice Management OS</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', fontWeight: 700 }}>
              Company & Help
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
              <li><Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About CA Career OS</Link></li>
              <li><Link href="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact & Enquiries</Link></li>
              <li><Link href="/help" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Help & Knowledge Base</Link></li>
              <li><Link href="/faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Frequently Asked Questions</Link></li>
              <li><Link href="/careers" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Careers / Talent Pool</Link></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', fontWeight: 700 }}>
              Legal & Compliance
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
              <li><Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy (DPDP Act)</Link></li>
              <li><Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link></li>
              <li><Link href="/cookies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cookie Notice</Link></li>
              <li><Link href="/security" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Security & Governance</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} CA Career OS. All rights reserved. Built for Chartered Accountants and Finance Professionals.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link>
            <Link href="/security" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Security</Link>
            <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
