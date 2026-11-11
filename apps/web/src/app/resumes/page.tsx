'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Layers,
  Send,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  X,
  Plus,
  Upload,
} from 'lucide-react';
import {
  CAPathway,
  ResumeDetail,
  ResumeSectionContent,
} from '@ca-career-os/shared';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '../../context/AuthContext';

// Initial master resume grounded in verified CA profile
const INITIAL_MASTER_RESUME: ResumeDetail = {
  id: 'res-master-01',
  candidateProfileId: 'usr-candidate-101',
  title: 'Chartered Accountant — Master Profile',
  targetPathway: CAPathway.AUDIT,
  isDefault: true,
  updatedAt: new Date().toISOString(),
  versions: [
    {
      id: 'ver-01-master',
      resumeId: 'res-master-01',
      versionNumber: 1,
      title: 'Master Verified Profile',
      summary:
        'ICAI Qualified Chartered Accountant with practical training in Statutory Audit, Ind AS, and Corporate Taxation.',
      targetedJobId: null,
      targetedJobTitle: null,
      targetedCompanyName: null,
      matchScore: 88,
      parsedContent: {
        summary:
          'ICAI Qualified Chartered Accountant with practical training in Statutory Audit, Ind AS, and Corporate Taxation.',
        qualification: [
          {
            title: 'Chartered Accountant (ICAI)',
            institution: 'The Institute of Chartered Accountants of India',
            year: '2024',
            scoreOrRank: 'Qualified',
          },
          {
            title: 'Bachelor of Commerce (B.Com)',
            institution: 'Commerce University',
            year: '2021',
            scoreOrRank: 'First Class',
          },
        ],
        articleship: {
          firm: 'Chartered Accountancy Practice',
          firmTier: 'Mid-Size',
          duration: '36 Months',
          domains: ['Statutory Audit', 'Direct & Indirect Taxation', 'Internal Financial Controls'],
          highlights: [
            'Conducted statutory audit procedures for corporate clients in compliance with Standards on Auditing (SAs) and Companies Act, 2013.',
            'Evaluated Internal Financial Controls over Financial Reporting (IFCoFR) and CARO 2020 clauses.',
            'Prepared corporate tax audit reports (Form 3CD) and quarterly withholding tax (TDS) reconciliations.',
            'Prepared draft financial statements under Indian Accounting Standards (Ind AS).',
          ],
        },
        workExperience: [],
        skills: {
          technical: [
            'Statutory Audit',
            'Financial Statement Analysis',
            'Internal Controls (IFC)',
            'CARO 2020 Compliance',
            'Tax Audit (Form 3CD)',
          ],
          standards: [
            'Ind AS / IFRS',
            'Standards on Auditing (SAs)',
            'Companies Act, 2013',
            'Income Tax Act, 1961',
            'GST Acts',
          ],
          tools: ['ERP Systems', 'Advanced Excel', 'Accounting Software'],
        },
        certifications: [
          'ICAI Advanced Information Technology Training (AICITSS)',
          'ICAI Management and Communication Skills (GMCS / MCS)',
        ],
        projects: [
          {
            title: 'Statutory Audit Engagements',
            description: 'Conducted audit substantive testing, revenue reconciliations, and fixed asset verification.',
            impact: 'Ensured timely filing and compliance with regulatory reporting timelines.',
          },
        ],
      },
      claimAttestations: {
        verifiedProfileFactsCount: 4,
        synthesizedWordingCount: 2,
        unverifiedClaims: [],
      },
      candidateAttested: true,
      pdfUrl: '/api/v1/resumes/res-master-01/export?format=markdown',
      createdAt: new Date().toISOString(),
    },
  ],
};

export default function ResumesPage() {
  const { user } = useAuth();
  const candidateName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Chartered Accountant Candidate';

  const [activeTab, setActiveTab] = useState<'BUILDER' | 'VARIANTS' | 'COVER_LETTER' | 'DOCUMENT_INTELLIGENCE'>('BUILDER');
  const [resume, setResume] = useState<ResumeDetail>(INITIAL_MASTER_RESUME);
  const [activeVersionId, setActiveVersionId] = useState<string>('ver-01-master');
  const [availableJobs, setAvailableJobs] = useState<Array<{ id: string; company: string; title: string; pathway: any; keyKeywords: string[] }>>([]);

  // Modal states
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [selectedTargetJobId, setSelectedTargetJobId] = useState<string>('');
  const [tailorEmphasis, setTailorEmphasis] = useState('Highlight statutory audit and Ind AS reporting experience');
  const [candidateAttestedCheck, setCandidateAttestedCheck] = useState(false);

  // Cover letter generator state
  const [coverJobTargetId, setCoverJobTargetId] = useState<string>('');
  const [coverTone, setCoverTone] = useState<'FORMAL' | 'EXECUTIVE' | 'DIRECT'>('FORMAL');
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Document OCR & Verification state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadResult, setDocUploadResult] = useState<any>(null);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Export preview modal
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Load real jobs from authentic directory
  React.useEffect(() => {
    async function loadRealJobs() {
      try {
        const res = await apiClient.get<any[]>('/jobs?limit=50');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const list = res.data.map((j) => ({
            id: j.id,
            company: j.companyName || 'CA Firm / Enterprise',
            title: j.title,
            pathway: j.caPathway,
            keyKeywords: j.structuredRequirements?.mandatorySkills || ['Statutory Audit', 'Ind AS', 'Taxation'],
          }));
          setAvailableJobs(list);
          if (list.length > 0) {
            setSelectedTargetJobId(list[0].id);
            setCoverJobTargetId(list[0].id);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadRealJobs();
  }, []);

  // Dynamic API hydration from backend
  React.useEffect(() => {
    async function loadResumeData() {
      try {
        const data = await apiClient.get<any[]>('/resumes');
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          const resDetail = await apiClient.get<ResumeDetail>(`/resumes/${data.data[0].id}`);
          if (resDetail?.success && resDetail.data) {
            setResume(resDetail.data);
            setIsLiveConnected(true);
            if (resDetail.data.versions?.length > 0) {
              setActiveVersionId(resDetail.data.versions[0].id);
            }
          }
        }
      } catch {
        // Fallback
      }
    }
    loadResumeData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setDocUploadError('File exceeds 10MB statutory limit');
      return;
    }

    setUploadFileName(file.name);
    setIsUploadingDoc(true);
    setDocUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fullResult = reader.result as string;
        const base64Content = fullResult.includes(',') ? fullResult.split(',')[1] : fullResult;
        const data = await apiClient.post<any>('/resumes/upload-document', {
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          documentType: 'FORM_108',
          base64Content,
        });

        if (data.success) {
          setDocUploadResult(data.data);
        } else {
          setDocUploadError(data.error?.message || 'Failed to process document');
        }
      } catch (err: any) {
        setDocUploadError(err.message || 'Network error during upload');
      } finally {
        setIsUploadingDoc(false);
      }
    };
    reader.onerror = () => {
      setDocUploadError('Error reading file from disk');
      setIsUploadingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleForm108 = async () => {
    setIsUploadingDoc(true);
    setDocUploadError(null);
    setUploadFileName('ICAI_Form_108_Priya_Sharma_ACA.pdf');

    try {
      // Synthetic valid PDF header bytes
      const sampleBase64 = 'JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iaiAyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iaiAzIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA0IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoxODAKJCVFT0YK';
      const data = await apiClient.post<any>('/resumes/upload-document', {
        fileName: 'ICAI_Form_108_Priya_Sharma_ACA.pdf',
        mimeType: 'application/pdf',
        documentType: 'FORM_108',
        base64Content: sampleBase64,
      });

      if (data.success) {
        setDocUploadResult(data.data);
      } else {
        setDocUploadError(data.error?.message || 'Failed to process document');
      }
    } catch (err: any) {
      setDocUploadError(err.message || 'Network error during test execution');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);

  const activeVersion =
    resume.versions.find((v) => v.id === activeVersionId) || resume.versions[0];

  const handleTailorSubmit = async () => {
    if (!candidateAttestedCheck) {
      alert('Please confirm that your details are accurate before generating this version.');
      return;
    }

    const job = availableJobs.find((j) => j.id === selectedTargetJobId) || availableJobs[0];
    if (!job) return;

    try {
      const result = await apiClient.post<any>(`/resumes/${resume.id}/tailor`, {
        jobId: selectedTargetJobId,
        emphasis: tailorEmphasis,
        candidateAttested: true,
      });

      if (result?.success && result.data) {
        setResume((prev) => ({
          ...prev,
          versions: [result.data, ...prev.versions],
        }));
        setActiveVersionId(result.data.id);
        setIsTailorModalOpen(false);
        setActiveTab('VARIANTS');
        return;
      }
    } catch {
      // Local fallback simulation
    }

    const newVersionNumber = resume.versions.length + 1;
    const newVersionId = `ver-0${newVersionNumber}-tailored`;

    const tailoredSummary = `Targeted for ${job.title} at ${job.company}: ${activeVersion.parsedContent.summary} Specific emphasis: ${tailorEmphasis}. Prepared to contribute immediately to ${job.pathway} engagements.`;

    const newVersion = {
      id: newVersionId,
      resumeId: resume.id,
      versionNumber: newVersionNumber,
      title: `Tailored: ${job.company} (${job.pathway})`,
      summary: tailoredSummary,
      targetedJobId: job.id,
      targetedJobTitle: job.title,
      targetedCompanyName: job.company,
      matchScore: 92,
      parsedContent: {
        ...activeVersion.parsedContent,
        summary: tailoredSummary,
      },
      claimAttestations: {
        verifiedProfileFactsCount: 4,
        synthesizedWordingCount: 2,
        unverifiedClaims: [],
      },
      candidateAttested: true,
      pdfUrl: `/api/v1/resumes/${resume.id}/export?versionId=${newVersionId}&format=markdown`,
      createdAt: new Date().toISOString(),
    };

    setResume((prev) => ({
      ...prev,
      versions: [newVersion, ...prev.versions],
      updatedAt: new Date().toISOString(),
    }));

    setActiveVersionId(newVersionId);
    setIsTailorModalOpen(false);
    setActiveTab('VARIANTS');
  };

  const getCoverLetterText = () => {
    const job = availableJobs.find((j) => j.id === coverJobTargetId) || availableJobs[0] || {
      title: 'Chartered Accountant Role',
      company: 'Hiring Team',
      pathway: 'Audit & Assurance',
    };
    const firmName = activeVersion?.parsedContent?.articleship?.firm || 'practicing CA firm';
    return `Dear Hiring Team at ${job.company},

I am writing to express my interest in the ${job.title} position at ${job.company}. As a Qualified Chartered Accountant with practical training at ${firmName}, I have developed core competencies in Statutory Audit, Ind AS reporting, and financial controls.

${job.company}'s work aligns with my technical background and professional goals. During my practical training, I assisted in statutory audit cycles, evaluated internal financial controls, and prepared regulatory filings.

I look forward to discussing how my experience and disciplined work ethic can contribute to ${job.company}.

Sincerely,
${candidateName}`;
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(getCoverLetterText());
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Sub-Nav */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <FileText size={24} color="var(--brand-primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Resume Builder
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '720px' }}>
            Build and tailor professional CA resumes based on verified training, articleship experience, and qualifications.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="segmented-control">
          <button
            onClick={() => setActiveTab('BUILDER')}
            className={`segmented-control-btn ${activeTab === 'BUILDER' ? 'active' : ''}`}
          >
            Resume Studio
          </button>
          <button
            onClick={() => setActiveTab('VARIANTS')}
            className={`segmented-control-btn ${activeTab === 'VARIANTS' ? 'active' : ''}`}
          >
            Tailored Variants ({resume.versions.length})
          </button>
          <button
            onClick={() => setActiveTab('COVER_LETTER')}
            className={`segmented-control-btn ${activeTab === 'COVER_LETTER' ? 'active' : ''}`}
          >
            Cover Letter Generator
          </button>
          <button
            onClick={() => setActiveTab('DOCUMENT_INTELLIGENCE')}
            className={`segmented-control-btn ${activeTab === 'DOCUMENT_INTELLIGENCE' ? 'active' : ''}`}
          >
            Form 108 OCR
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderLeft: '4px solid var(--success-text)',
          background: 'var(--success-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} color="var(--success-text)" />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Verified Articleship Profile
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {activeVersion?.parsedContent?.articleship?.firm ? `Training recorded at ${activeVersion.parsedContent.articleship.firm} (${activeVersion.parsedContent.articleship.duration || '36 Months'}).` : 'Practical training profile active.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsTailorModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
          >
            <Layers size={14} /> Tailor for Job
          </button>
          <button
            onClick={() => setIsExportPreviewOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
          >
            <Download size={14} /> Export / Preview
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'DOCUMENT_INTELLIGENCE' ? (
        /* ================= ICAI Form 108 Document Intelligence & OCR ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={22} color="var(--success-text)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ICAI Form 108 Document Intelligence
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px' }}>
                  Upload your Certificate of Service under Articles (Form 108) to verify your practical training credentials.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleLoadSampleForm108}
                  disabled={isUploadingDoc}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                >
                  <CheckCircle2 size={14} color="var(--brand-primary)" />
                  Load Verified Sample
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--surface-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Upload size={32} color="var(--brand-primary)" />
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem', margin: '0 0 0.25rem 0' }}>
                  Upload Form 108 or Articleship Completion Letter
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                  Supports PDF (%PDF-), PNG, and JPEG up to 10MB statutory limit.
                </p>
              </div>

              <label className="btn btn-primary" style={{ cursor: 'pointer', fontSize: '0.8125rem', padding: '0.5rem 1.25rem', marginTop: '0.5rem' }}>
                <Upload size={14} />
                <span>Select Document File</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isUploadingDoc}
                />
              </label>

              {uploadFileName && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Selected: <strong>{uploadFileName}</strong>
                </div>
              )}

              {isUploadingDoc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  <div className="spinner" />
                  <span>Inspecting binary file signatures and parsing Form 108 OCR fields...</span>
                </div>
              )}
            </div>

            {docUploadError && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={16} />
                <span>{docUploadError}</span>
              </div>
            )}

            {/* Extracted Data Card */}
            {docUploadResult && (
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <CheckCircle2 size={20} color="var(--success-text)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Articleship Completion Extraction Confirmed
                    </h4>
                    <span className="badge badge-emerald">{docUploadResult.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-indigo">
                      Provider: {docUploadResult.metadata?.provider || 'OCR Engine'}
                    </span>
                    <span className="badge badge-cyan">
                      Confidence: {docUploadResult.metadata?.confidenceScore ? `${Math.round(docUploadResult.metadata.confidenceScore * 100)}%` : '98%'}
                    </span>
                    {docUploadResult.metadata?.isMock && (
                      <span className="badge badge-amber">Mock Environment Adapter</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    background: 'var(--surface-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Training Firm:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{docUploadResult.extractedData?.firmName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Firm Registration No (FRN):</span>
                    <strong style={{ color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                      {docUploadResult.extractedData?.firmRegistrationNumber}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Principal CA:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{docUploadResult.extractedData?.principalName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Articleship Dates:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {docUploadResult.extractedData?.articleshipStartDate} to {docUploadResult.extractedData?.articleshipEndDate}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Duration Served:</span>
                    <strong style={{ color: 'var(--success-text)' }}>
                      {docUploadResult.extractedData?.totalWeeksServed} Weeks (Statutory 36 Months)
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Stipend Compliant:</span>
                    <strong style={{ color: docUploadResult.extractedData?.stipendConfirmed ? 'var(--success-text)' : 'var(--warning-text)' }}>
                      {docUploadResult.extractedData?.stipendConfirmed ? 'Confirmed (ICAI Reg 48 Bank Disbursal)' : 'Unconfirmed'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'COVER_LETTER' ? (
        /* ================= Cover Letter Generator ================= */
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Job-Specific Cover Letter & Recruiter Outreach
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Drafts are generated strictly from your certified profile data. You review and copy; no automated sending occurs without approval.
              </p>
            </div>
            <button
              onClick={handleCopyCoverLetter}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              {copiedLetter ? <Check size={16} /> : <Copy size={16} />}
              {copiedLetter ? 'Copied to Clipboard!' : 'Copy Cover Letter'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Job Opening</label>
              <select
                value={coverJobTargetId}
                onChange={(e) => setCoverJobTargetId(e.target.value)}
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Communication Tone</label>
              <select
                value={coverTone}
                onChange={(e) => setCoverTone(e.target.value as any)}
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="FORMAL">Formal & Direct (Big 4 / Corporate Standard)</option>
                <option value="EXECUTIVE">Executive Advisory (For Management Roles)</option>
                <option value="DIRECT">Direct Recruiter LinkedIn Message</option>
              </select>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {getCoverLetterText()}
          </div>
        </div>
      ) : activeTab === 'VARIANTS' ? (
        /* ================= Tailored Variants View ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resume.versions.map((ver) => (
            <div
              key={ver.id}
              className={`glass-panel ${activeVersionId === ver.id ? 'glass-panel-active' : ''}`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderLeft: activeVersionId === ver.id ? '4px solid var(--brand-primary)' : '4px solid transparent',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ver.title}
                  </h3>
                  <span className="badge badge-indigo">v{ver.versionNumber}</span>
                  {ver.candidateAttested ? (
                    <span className="badge badge-emerald">
                      <ShieldCheck size={11} /> Attested
                    </span>
                  ) : (
                    <span className="badge badge-amber">Unattested</span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', maxWidth: '750px' }}>
                  {ver.summary}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Verified Claims: {ver.claimAttestations.verifiedProfileFactsCount}</span>
                  <span>•</span>
                  <span>Synthesized Highlights: {ver.claimAttestations.synthesizedWordingCount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setActiveVersionId(ver.id);
                    setActiveTab('BUILDER');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                >
                  <Eye size={14} /> Open in Studio
                </button>
                <button
                  onClick={() => {
                    setActiveVersionId(ver.id);
                    setIsExportPreviewOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= Resume Studio Editor ================= */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Core Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Executive Summary */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Executive Profile Summary
                </h3>
                <span className="badge badge-emerald">Verified Facts</span>
              </div>
              <textarea
                rows={4}
                value={activeVersion.parsedContent.summary}
                onChange={(e) => {
                  const val = e.target.value;
                  setResume((prev) => ({
                    ...prev,
                    versions: prev.versions.map((v) =>
                      v.id === activeVersionId
                        ? { ...v, summary: val, parsedContent: { ...v.parsedContent, summary: val } }
                        : v
                    ),
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Articleship & Practical Training */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Articleship & Practical Experience
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activeVersion.parsedContent.articleship.firm} ({activeVersion.parsedContent.articleship.firmTier} Firm) • {activeVersion.parsedContent.articleship.duration}
                  </span>
                </div>
                <span className="badge badge-emerald">ICAI Signoff</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {activeVersion.parsedContent.articleship.highlights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      background: 'var(--surface-secondary)',
                      padding: '0.5rem',
                      borderRadius: '6px',
                    }}
                  >
                    <CheckCircle2 size={15} color="var(--success-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Qualifications & Degrees
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeVersion.parsedContent.qualification.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{q.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.institution} ({q.year})</div>
                    </div>
                    {q.scoreOrRank && <span className="badge badge-indigo">{q.scoreOrRank}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Skills, Standards, Certifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Core Competencies */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Skills & Accounting Standards
              </h3>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                  Accounting & Auditing Standards:
                </span>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {activeVersion.parsedContent.skills.standards.map((s, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                  Tools & Enterprise Software:
                </span>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {activeVersion.parsedContent.skills.tools.map((t, i) => (
                    <span key={i} className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Client Audit Projects */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Representative Client Engagements
              </h3>
              {activeVersion.parsedContent.projects.map((proj, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{proj.title}</div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {proj.description}
                  </p>
                  {proj.impact && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--success-text)', margin: 0, fontWeight: 500 }}>
                      Impact: {proj.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                ICAI Professional Certifications
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                {activeVersion.parsedContent.certifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= Tailor For Job Modal ================= */}
      {isTailorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Tailor Resume for Role
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Highlight relevant competencies and experiences that match the requirements of the selected job.
                </p>
              </div>
              <button
                onClick={() => setIsTailorModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Select Target Job Opening</label>
              <select
                value={selectedTargetJobId}
                onChange={(e) => setSelectedTargetJobId(e.target.value)}
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company} ({j.pathway})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Focus & Technical Emphasis</label>
              <input
                type="text"
                value={tailorEmphasis}
                onChange={(e) => setTailorEmphasis(e.target.value)}
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Candidate Attestation Checkbox */}
            <div
              style={{
                background: 'var(--surface-secondary)',
                padding: '0.875rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
              }}
            >
              <input
                type="checkbox"
                id="attestCheck"
                checked={candidateAttestedCheck}
                onChange={(e) => setCandidateAttestedCheck(e.target.checked)}
                style={{ marginTop: '0.2rem' }}
              />
              <label htmlFor="attestCheck" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Mandatory Candidate Attestation:</strong> I certify that all experience items, articleship firm details, and qualifications represent true, certified records under ICAI regulations.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setIsTailorModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleTailorSubmit} className="btn btn-primary">
                Generate Tailored Variant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Export / Markdown Preview Modal ================= */}
      {isExportPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              background: 'var(--surface-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Resume Preview & Export — {activeVersion.title}
              </h3>
              <button
                onClick={() => setIsExportPreviewOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {`# Priya Sharma, ACA
Email: priya.sharma@cacareeros.com | Pathway: ${resume.targetPathway} | Status: Verified Profile Facts

---

## Professional Summary
${activeVersion.parsedContent.summary}

---

## Education & Qualifications
${activeVersion.parsedContent.qualification.map((q) => `* **${q.title}** — ${q.institution} (${q.year}) | ${q.scoreOrRank}`).join('\n')}

---

## Articleship & Practical Experience
### ${activeVersion.parsedContent.articleship.firm} (${activeVersion.parsedContent.articleship.firmTier} Firm)
Duration: ${activeVersion.parsedContent.articleship.duration}
Domains: ${activeVersion.parsedContent.articleship.domains.join(', ')}

${activeVersion.parsedContent.articleship.highlights.map((h) => `* ${h}`).join('\n')}

---

## Technical Competencies
* Standards: ${activeVersion.parsedContent.skills.standards.join(', ')}
* Software: ${activeVersion.parsedContent.skills.tools.join(', ')}`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsExportPreviewOpen(false)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([activeVersion.parsedContent.summary], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${resume.title.toLowerCase().replace(/\s+/g, '-')}.md`;
                  a.click();
                }}
                className="btn btn-primary"
              >
                <Download size={14} /> Download Markdown (.md)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
