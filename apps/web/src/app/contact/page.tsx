'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'CAREER_SUPPORT',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    ticketRef: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (formData.name.trim().length < 2) {
      setErrorMessage('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (formData.subject.trim().length < 4) {
      setErrorMessage('Subject must be at least 4 characters long.');
      return;
    }
    if (formData.message.trim().length < 15) {
      setErrorMessage('Message must contain at least 15 characters describing your inquiry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiClient.post<{ ticketRef: string; message: string }>('/support/contact', formData);

      if (res.success && res.data) {
        setSubmissionSuccess({
          ticketRef: res.data.ticketRef || 'TKT-2026-LOGGED',
          message: res.data.message || 'Your inquiry has been logged successfully.',
        });
      } else {
        setErrorMessage(res.error?.message || 'Failed to submit enquiry. Please check your connection and try again.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'A network error occurred while submitting. Please try again in a few moments.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
          <Mail size={14} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
            AUTHENTIC SUPPORT & INQUIRIES
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}
        >
          Contact the{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CA Career OS Team
          </span>
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Have questions about Form 108 articleship verification, practice management workflows, or enterprise recruiter onboarding? Every submission generates an auditable ticket.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Left: Contact Info & Support Guidelines */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Direct Channels
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            We operate asynchronously to ensure thorough technical and regulatory review by qualified accounting and engineering specialists.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} color="var(--accent-indigo)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Support Desk</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>support@cacareeros.com</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Candidate profiles, resume tailoring & billing issues</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} color="var(--accent-emerald)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Compliance & Ethics Review</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>compliance@cacareeros.com</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>ICAI Code of Ethics queries & employer verification disputes</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={18} color="var(--accent-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Expected Turnaround</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>24 – 48 Business Hours</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Monday to Friday (Excluding Indian Statutory Bank Holidays)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form / Confirmation */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {submissionSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={32} color="var(--accent-emerald)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Inquiry Logged Successfully
              </h2>
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '1rem',
                }}
              >
                Reference: {submissionSuccess.ticketRef}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                {submissionSuccess.message} A confirmation record has been generated in your audit trail.
              </p>
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setFormData({ name: '', email: '', category: 'CAREER_SUPPORT', subject: '', message: '' });
                }}
                className="btn btn-secondary"
                style={{ margin: '0 auto' }}
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Send a Structured Inquiry
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Please fill in the details below. All fields are mandatory.
              </p>

              {errorMessage && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CA Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Inquiry Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.875rem' }}
                >
                  <option value="CAREER_SUPPORT">Career Guidance & Pathway Diagnostic</option>
                  <option value="ACCOUNT_ACCESS">Account Login & Workspace Access</option>
                  <option value="BILLING_GST">Billing, Invoices & GST B2B Input Tax Credit</option>
                  <option value="ICAI_ETHICS">ICAI Ethics Compliance & Form 108 Verification</option>
                  <option value="ENTERPRISE">CA Firm & Enterprise Recruiter Onboarding</option>
                  <option value="GENERAL">General Feedback & Bug Report</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your query in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {isSubmitting ? (
                  <span>Logging Inquiry...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send size={15} />
                  </>
                )}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>
                Protected by Candidate Blindfold encryption. We never share your contact details with external recruiters.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
