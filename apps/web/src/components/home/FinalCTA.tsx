'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, RotateCw, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export function FinalCTA() {
  const router = useRouter();
  const [demoStage, setDemoStage] = useState<'IDLE' | 'ANALYZING' | 'MATCHING' | 'READY'>('IDLE');

  const handleLaunchTestDrive = () => {
    if (demoStage !== 'IDLE') return;
    setDemoStage('ANALYZING');
    setTimeout(() => {
      setDemoStage('MATCHING');
      setTimeout(() => {
        setDemoStage('READY');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }, 700);
    }, 700);
  };

  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem', width: '100%' }}>
      <div
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div className="badge-success-clean">
          <CheckCircle2 size={12} />
          <span>CharteredOS Workspace</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
          Accelerate Your Professional Career with CharteredOS
        </h2>

        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: 0, lineHeight: 1.6 }}>
          Direct access to 440+ verified articleship and finance positions, objective competency benchmarking, and confidential candidate isolation.
        </p>

        {/* Demo Box */}
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            marginTop: '0.5rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interactive Demo Workspace
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              NO REGISTRATION REQUIRED
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Instant evaluation with preloaded career diagnostic, verified resume editor, and take-home CTC unbundler.
          </p>

          <button
            type="button"
            disabled={demoStage !== 'IDLE'}
            onClick={handleLaunchTestDrive}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem', justifyContent: 'center' }}
          >
            {demoStage === 'IDLE' ? (
              <>
                <UserCheck size={15} />
                <span>Launch Interactive Demo</span>
              </>
            ) : (
              <>
                <RotateCw size={15} className="animate-spin" />
                <span>Entering Workspace...</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Standard Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <Link
            href="/register"
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
          >
            Create Free Account <ArrowRight size={13} />
          </Link>
          <Link
            href="/articleship"
            className="btn btn-ghost"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
          >
            Browse Articleships
          </Link>
        </div>
      </div>
    </section>
  );
}
