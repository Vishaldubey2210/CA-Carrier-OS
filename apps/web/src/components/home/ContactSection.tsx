'use client';

import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck, Send, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'CAREER_SUPPORT',
    subject: '',
    message: '',
    website: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ ticketRef: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Honeypot check
    if (form.website) {
      return;
    }

    if (form.name.trim().length < 2) {
      setErrorMessage('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (form.subject.trim().length < 4) {
      setErrorMessage('Subject must be at least 4 characters long.');
      return;
    }
    if (form.message.trim().length < 15) {
      setErrorMessage('Message must contain at least 15 characters describing your inquiry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post<{ ticketRef: string; message: string }>('/support/contact', {
        name: form.name,
        email: form.email,
        category: form.category,
        subject: form.subject,
        message: form.message,
      });

      if (res.success && res.data) {
        setSuccessData(res.data);
        setForm({
          name: '',
          email: '',
          category: 'CAREER_SUPPORT',
          subject: '',
          message: '',
          website: '',
        });
      } else {
        setErrorMessage(res.error?.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to support service. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full"
    >
      {/* Section Header (Guaranteed visible, no clipping) */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-14">
        <span className="editorial-step">
          07 — DIRECT CONTACT & SUPPORT
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Connect with our Member Operations Team
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          Inquiries regarding career diagnostics, firm onboarding, or verified recruitment receive responses within 4 business hours.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        {/* Left Column: SLA Badge, Details & Tracking Info (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-card">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-[12px] font-bold tracking-wider uppercase mb-3">
              <Clock size={13} />
              <span>SLA: &lt; 4 Hours</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-2 m-0">
              Dedicated CA Support
            </h3>
            <p className="text-[14px] text-[#475569] leading-relaxed m-0">
              Our operations team includes qualified Chartered Accountants and technical recruiters who understand ICAI compliance and corporate recruitment cycles.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-[#E2E8F0] text-[14px]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2F6] flex items-center justify-center text-[#1E3A8A] shrink-0 mt-0.5">
                <Mail size={16} />
              </div>
              <div>
                <div className="text-[12px] text-[#64748B] font-medium">Direct Inquiries</div>
                <a
                  href="mailto:support@cacareeros.com"
                  className="font-semibold text-[#0F172A] hover:text-[#1E3A8A] transition-colors no-underline"
                >
                  support@cacareeros.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669] shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-[12px] text-[#64748B] font-medium">Tracking & Security</div>
                <div className="font-semibold text-[#0F172A]">Every query gets a tracking ID</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] shrink-0 mt-0.5">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[12px] text-[#64748B] font-medium">Support Hours</div>
                <div className="text-[#334155] font-medium">Monday – Saturday: 9:00 AM – 7:00 PM IST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form with Floating / Clear Labels (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-card">
          {successData ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-[20px] font-bold text-[#0F172A] mb-1">
                  Inquiry Dispatched Successfully
                </h4>
                <p className="text-[14px] text-[#475569] max-w-[400px] mb-3">
                  Your reference ID is <strong className="text-[#1E3A8A] font-mono">{successData.ticketRef}</strong>. Our member operations desk will respond within 4 business hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="text-[13px] font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Honeypot field (hidden from real users) */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-[13px] flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="CA Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-category" className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    id="contact-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                  >
                    <option value="CAREER_SUPPORT">Candidate Career & Pathways</option>
                    <option value="FIRM_ONBOARDING">Firm Practice Management</option>
                    <option value="RECRUITMENT">Recruiter & Job Mandates</option>
                    <option value="COMPLIANCE">Ethics & Non-solicitation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    placeholder="Brief summary of inquiry"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[13px] font-semibold text-[#334155] mb-1.5">
                  Message Details
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Describe your inquiry, articleship verification query, or firm onboarding requirement..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[14px] text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw size={15} className="animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
