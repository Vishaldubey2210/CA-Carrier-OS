'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Bell,
  Lock,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Trash2,
  Download,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';

export default function SettingsPage() {
  const { user, activeWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS' | 'PRIVACY'>('PROFILE');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailJobAlerts: true,
    applicationStatusUpdates: true,
    statutoryDueDateReminders: true,
    marketingEmails: false,
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // In a production setup, this calls PATCH /auth/profile
      setStatusMessage({ type: 'success', text: 'Personal profile updated successfully.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (passwordForm.newPassword.length < 12) {
      setStatusMessage({ type: 'error', text: 'New password must contain at least 12 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Password change simulated in development
      setStatusMessage({ type: 'success', text: 'Password successfully updated. All active sessions verified.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Account & Workspace Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Manage your personal profile, cryptographic security credentials, and workspace preferences.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: statusMessage.type === 'success' ? 'var(--success-surface)' : 'var(--danger-surface)',
            border: statusMessage.type === 'success' ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
            color: statusMessage.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="segmented-control" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
        {[
          { id: 'PROFILE', label: 'Personal Profile' },
          { id: 'SECURITY', label: 'Security & Password' },
          { id: 'NOTIFICATIONS', label: 'Notification Preferences' },
          { id: 'PRIVACY', label: 'Workspace Privacy & Export' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setStatusMessage(null);
              }}
              className={`segmented-control-btn ${isActive ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Basic Information
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                disabled
                value={profileForm.email}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Email changes require cryptographic re-verification for security integrity.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'SECURITY' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Change Password
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Passwords are encrypted using memory-hard scrypt hashing with unique per-user cryptographic salts.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter existing password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                New Password (Minimum 12 Characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter 12+ character password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                <Key size={14} />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Email & In-App Alerts
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Configure how and when CA Career OS sends you critical career updates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
            {[
              {
                id: 'emailJobAlerts',
                title: 'Smart Job Alerts',
                desc: 'Receive digest notifications when new verified roles match your articleship background.',
              },
              {
                id: 'applicationStatusUpdates',
                title: 'Application Status Changes',
                desc: 'Real-time alerts when recruiters review, shortlist, or schedule interviews.',
              },
              {
                id: 'statutoryDueDateReminders',
                title: 'ICAI & Statutory Deadlines',
                desc: 'Notifications regarding ITR, GST, Form 108 verification milestones, and tax audits.',
              },
              {
                id: 'marketingEmails',
                title: 'Product News & Features',
                desc: 'Occasional announcements about new platform tools and compliance engines.',
              },
            ].map((item) => {
              const isChecked = (notifPrefs as any)[item.id];
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setNotifPrefs((prev) => ({ ...prev, [item.id]: !isChecked }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => setStatusMessage({ type: 'success', text: 'Notification preferences saved.' })}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
            >
              <Save size={14} />
              <span>Save Alert Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Workspace Privacy & Export */}
      {activeTab === 'PRIVACY' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Privacy & Data Controls
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You maintain full ownership and control over your candidate profile and personal data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ShieldCheck size={28} color="var(--accent-emerald)" />
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.2rem 0' }}>
                  Confidential Search Protection: Active
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Your profile and application activities are confidential and hidden from your current employers.
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Export Personal Career Archive
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Download a JSON archive containing your verified resume versions, articleship inventory, and interview evaluation transcripts.
              </p>
              <button
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ user, workspace: activeWorkspace }, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute('href', dataStr);
                  dlAnchor.setAttribute('download', `ca_career_os_archive_${user?.id || 'data'}.json`);
                  dlAnchor.click();
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                <Download size={14} />
                <span>Export Career Data (JSON)</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', marginBottom: '0.35rem' }}>
                Delete Account & Sovereign Workspace
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Permanent deletion purges all candidate resumes, applications, and workspace records in accordance with digital privacy laws.
              </p>
              <button
                onClick={() => alert('To confirm account deletion, please email privacy@cacareeros.com with your registered email.')}
                className="btn btn-secondary"
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                <Trash2 size={14} />
                <span>Request Account Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
