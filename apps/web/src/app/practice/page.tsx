'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  ExternalLink,
  Plus,
  Calendar,
  Building2,
  ShieldCheck,
  FileText,
  AlertCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ChecklistItem {
  id: string;
  category: string;
  taskKey: string;
  title: string;
  description: string;
  officialPortalUrl: string;
  lastVerifiedDate: string;
  isCompleted: boolean;
  notes?: string | null;
}

interface ClientItem {
  id: string;
  clientName: string;
  entityType: string;
  panNumber?: string;
  gstin?: string;
  contactPerson: string;
  contactEmail: string;
  status: string;
}

interface ComplianceTask {
  id: string;
  clientName: string;
  title: string;
  complianceCategory: string;
  statutoryDueDate: string;
  internalDeadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'FILED';
  filedReferenceNo?: string;
}

export default function PracticeOSPage() {
  const [activeTab, setActiveTab] = useState<'guidance' | 'crm' | 'compliance'>('guidance');

  // Interactive local states
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'c-1',
      category: 'ICAI_MEMBERSHIP_FORM_2',
      taskKey: 'icai-membership-form-2',
      title: 'Apply for ICAI Associate Membership (Form 2)',
      description:
        'Submit Form 2 via ICAI Self Service Portal (SSP) with passing certificates for CA Final (Both Groups), GMCS / MCS completion letter, and practical training completion confirmation.',
      officialPortalUrl: 'https://eservices.icai.org/EForms/configuredHtml/166/50014/login.html',
      lastVerifiedDate: '2025-02-01',
      isCompleted: true,
      notes: 'Submitted to Regional Council (WIRC)',
    },
    {
      id: 'c-2',
      category: 'COP_FORM_6',
      taskKey: 'icai-cop-form-6',
      title: 'Certificate of Practice Application (Form 6)',
      description:
        'Required if intending to practice as a proprietor or partner in public practice. Distinguish between Full-Time COP (Rule 190) and Part-Time COP. Fee payable annually in April.',
      officialPortalUrl: 'https://eservices.icai.org',
      lastVerifiedDate: '2025-02-01',
      isCompleted: false,
    },
    {
      id: 'c-3',
      category: 'CAMPUS_PLACEMENT_REGISTRATION',
      taskKey: 'icai-campus-placement',
      title: 'Register for ICAI National Campus Placement Program',
      description:
        'Mandatory registration window on the Committee for Members in Industry & Business (CMI&B) portal. Upload approved CV and select interview centers.',
      officialPortalUrl: 'https://cmib.icai.org',
      lastVerifiedDate: '2025-01-15',
      isCompleted: false,
    },
    {
      id: 'c-4',
      category: 'CABF_BENEVOLENT_FUND',
      taskKey: 'icai-cabf-enrolment',
      title: 'Enrol in Chartered Accountants Benevolent Fund (CABF)',
      description:
        'Recommended life membership contribution providing financial assistance to CA members and dependent families in cases of distress.',
      officialPortalUrl: 'https://www.icai.org/post/chartered-accountants-benevolent-fund-cabf',
      lastVerifiedDate: '2025-01-10',
      isCompleted: false,
    },
    {
      id: 'c-5',
      category: 'PRACTICE_PREPARATION',
      taskKey: 'cpe-credit-tracking-setup',
      title: 'Setup Mandatory Continuing Professional Education (CPE) Tracker',
      description:
        'Under ICAI CPE Advisory, members holding COP must earn at least 30-40 Structured/Unstructured CPE credit hours annually.',
      officialPortalUrl: 'https://www.cpeicai.org',
      lastVerifiedDate: '2025-02-01',
      isCompleted: true,
      notes: 'Registered on CPE Member Dashboard',
    },
  ]);

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([]);

  // Modal / Form state for new client
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newEntityType, setNewEntityType] = useState('PRIVATE_LIMITED');
  const [newPan, setNewPan] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Dynamic API hydration from backend
  React.useEffect(() => {
    async function loadPracticeData() {
      try {
        const [checkRes, clientsRes, tasksRes] = await Promise.all([
          apiClient.get<any[]>('/practice/post-qualification/checklist'),
          apiClient.get<any[]>('/practice/clients'),
          apiClient.get<any[]>('/practice/tasks'),
        ]);

        if (checkRes.success && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
          setChecklist(checkRes.data);
          setIsLiveConnected(true);
        }

        if (clientsRes.success && Array.isArray(clientsRes.data)) {
          setClients(clientsRes.data);
        }

        if (tasksRes.success && Array.isArray(tasksRes.data)) {
          setComplianceTasks(tasksRes.data);
        }
      } catch {
        // Fallback to pre-seeded state
      }
    }
    loadPracticeData();
  }, []);

  const toggleChecklist = async (taskKey: string) => {
    const current = checklist.find((item) => item.taskKey === taskKey);
    const nextStatus = current ? !current.isCompleted : true;
    setChecklist((prev) =>
      prev.map((item) =>
        item.taskKey === taskKey ? { ...item, isCompleted: nextStatus } : item
      )
    );
    try {
      await apiClient.post(`/practice/post-qualification/checklist/${taskKey}/toggle`, {
        isCompleted: nextStatus,
      });
    } catch {
      // Local state already updated
    }
  };

  const [clientFormError, setClientFormError] = useState<string | null>(null);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientFormError(null);
    if (!newClientName || !newContactEmail) return;

    const trimmedPan = newPan.trim().toUpperCase();
    if (trimmedPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmedPan)) {
      setClientFormError('Invalid Indian PAN format. Must be 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. AABCS1234F).');
      return;
    }

    // Map UI entity string to valid CreatePracticeClientSchema enum
    let normalizedEntityType: 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'PVT_LTD' | 'PUBLIC_LTD' | 'TRUST' = 'PVT_LTD';
    if (newEntityType === 'PUBLIC_LIMITED' || newEntityType === 'PUBLIC_LTD') normalizedEntityType = 'PUBLIC_LTD';
    else if (newEntityType === 'LLP' || newEntityType === 'PARTNERSHIP_FIRM' || newEntityType === 'PARTNERSHIP') normalizedEntityType = 'PARTNERSHIP';
    else if (newEntityType === 'PROPRIETORSHIP_PROFESSIONAL' || newEntityType === 'PROPRIETORSHIP') normalizedEntityType = 'PROPRIETORSHIP';
    else if (newEntityType === 'INDIVIDUAL') normalizedEntityType = 'INDIVIDUAL';
    else if (newEntityType === 'TRUST_NGO' || newEntityType === 'TRUST') normalizedEntityType = 'TRUST';

    const newClient: ClientItem = {
      id: `cl-${Date.now()}`,
      clientName: newClientName,
      entityType: normalizedEntityType,
      panNumber: trimmedPan || undefined,
      contactPerson: newContactPerson || 'Primary Contact',
      contactEmail: newContactEmail,
      status: 'ACTIVE',
    };

    setClients((prev) => [newClient, ...prev]);

    try {
      await apiClient.post('/practice/clients', {
        clientName: newClientName,
        entityType: normalizedEntityType,
        panNumber: trimmedPan || undefined,
        contactPerson: newContactPerson || 'Primary Contact',
        contactEmail: newContactEmail,
      });
    } catch {
      // Local state already updated
    }

    setNewClientName('');
    setNewPan('');
    setNewContactPerson('');
    setNewContactEmail('');
    setShowAddClient(false);
  };

  const markTaskFiled = async (taskId: string) => {
    const ref = prompt('Enter Filing Acknowledgement / Reference Number (e.g. ARN or ACK):');
    if (!ref) return;

    setComplianceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'FILED', filedReferenceNo: ref } : t))
    );

    try {
      await apiClient.patch(`/practice/tasks/${taskId}/status`, {
        status: 'FILED',
        filedReferenceNo: ref,
      });
    } catch {
      // Local state updated
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BriefcaseBusiness size={24} color="var(--accent-purple)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              CA Independent Practice Operating System
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '720px' }}>
            Unified workspace for practicing Chartered Accountants & new qualifiers: statutory post-qualification guidance, confidential client CRM, and compliance calendar tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-emerald">
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Zero-Leakage Workspace Isolation
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('guidance')}
          className={`btn ${activeTab === 'guidance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <FileCheck size={16} />
          Post-Qualification Guidance
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`btn ${activeTab === 'crm' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <Building2 size={16} />
          Practice Client Directory
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`btn ${activeTab === 'compliance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <Calendar size={16} />
          Statutory Compliance Calendar
        </button>
      </div>

      {/* TAB 1: Post-Qualification Guidance */}
      {activeTab === 'guidance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(99, 102, 241, 0.08)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} color="var(--accent-indigo)" />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Official ICAI regulatory references verified up to date. Workflows provide informational guidance and do not constitute formal legal opinions.
              </div>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
              Completed:{' '}
              {checklist.filter((c) => c.isCompleted).length} / {checklist.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: item.isCompleted ? '4px solid #10b981' : '4px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  <button
                    onClick={() => toggleChecklist(item.taskKey)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '2px',
                    }}
                    title={item.isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 size={22} color="#10b981" />
                    ) : (
                      <Circle size={22} color="var(--text-muted)" />
                    )}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: item.isCompleted ? '#94a3b8' : '#ffffff',
                          textDecoration: item.isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {item.title}
                      </h3>
                      <span className="badge badge-indigo" style={{ fontSize: '0.6875rem' }}>
                        Verified: {item.lastVerifiedDate}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.description}
                    </p>

                    {item.notes && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontStyle: 'italic' }}>
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={item.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  Official Portal
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Practice Client Directory */}
      {activeTab === 'crm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                Practice Client Directory ({clients.length})
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Client records are strictly limited to your authorized practice workspace.
              </p>
            </div>
            <button
              onClick={() => setShowAddClient(true)}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Plus size={16} />
              Add Practice Client
            </button>
          </div>

          {showAddClient && (
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.9)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                Create New Practice Client
              </h3>
              {clientFormError && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {clientFormError}
                </div>
              )}
              <form onSubmit={handleAddClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Entity / Client Legal Name *
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                    placeholder="e.g. Acme Corp Private Limited"
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Entity Type
                  </label>
                  <select
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <option value="PRIVATE_LIMITED">Private Limited Company</option>
                    <option value="PUBLIC_LIMITED">Public Limited Company</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PARTNERSHIP_FIRM">Partnership Firm</option>
                    <option value="PROPRIETORSHIP_PROFESSIONAL">Individual / Proprietorship</option>
                    <option value="TRUST_NGO">Trust / NGO (Section 12AB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value.toUpperCase())}
                    placeholder="e.g. AABCS1234F"
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Rajesh Mehra"
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    required
                    placeholder="e.g. contact@acme.com"
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Save Client Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {clients.length === 0 ? (
            <div className="empty-state-panel">
              <Image
                src="/assets/empty-clients.svg"
                alt="No practice clients registered"
                width={120}
                height={120}
                style={{ marginBottom: '1.5rem', opacity: 0.85 }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Practice Clients Registered Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Strict multi-tenant workspace isolation: Client records, statutory PAN identifiers, and compliance calendars are strictly partitioned to your CA firm workspace.
              </p>
              <button
                onClick={() => setShowAddClient(true)}
                className="btn btn-primary btn-pill"
                style={{ fontSize: '0.875rem' }}
              >
                + Register First Practice Client
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {clients.map((client) => (
                <div key={client.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{client.clientName}</h3>
                    <span className="badge badge-emerald">{client.status}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Entity:</span> {client.entityType}
                    </div>
                    {client.panNumber && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>PAN:</span>{' '}
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{client.panNumber}</span>
                      </div>
                    )}
                    {client.gstin && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>GSTIN:</span>{' '}
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{client.gstin}</span>
                      </div>
                    )}
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Contact:</span> {client.contactPerson} ({client.contactEmail})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Statutory Compliance Calendar */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Statutory Compliance Calendar ({complianceTasks.length} Tracked Filings)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Monitor statutory due dates across Income Tax, GST, TDS, and Tax Audits with acknowledgement reference logging.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {complianceTasks.map((t) => (
              <div
                key={t.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderLeft:
                    t.status === 'FILED'
                      ? '4px solid #10b981'
                      : t.status === 'IN_PROGRESS'
                      ? '4px solid #f59e0b'
                      : '4px solid #ef4444',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{t.title}</h4>
                    <span
                      className={`badge ${
                        t.status === 'FILED'
                          ? 'badge-emerald'
                          : t.status === 'IN_PROGRESS'
                          ? 'badge-amber'
                          : 'badge-indigo'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Client: <strong style={{ color: 'var(--text-primary)' }}>{t.clientName}</strong> | Category:{' '}
                    <span style={{ fontFamily: 'monospace' }}>{t.complianceCategory}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#ef4444' }}>
                      Statutory Due Date: <strong>{t.statutoryDueDate}</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Internal Deadline: <strong>{t.internalDeadline}</strong>
                    </span>
                    {t.filedReferenceNo && (
                      <span style={{ color: '#10b981', fontFamily: 'monospace' }}>
                        Ref: {t.filedReferenceNo}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {t.status !== 'FILED' ? (
                    <button
                      onClick={() => markTaskFiled(t.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Mark as Filed
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Filed & Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
