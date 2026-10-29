'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const drawerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/#features', label: 'Capabilities', sectionId: 'features' },
    { href: '/#how-it-works', label: 'How It Works', sectionId: 'how-it-works' },
    { href: '/#pathways', label: '7 Horizons', sectionId: 'pathways' },
    { href: '/#pricing', label: 'Pricing', sectionId: 'pricing' },
    { href: '/#about', label: 'Governance', sectionId: 'about' },
    { href: '/#faq', label: 'FAQ', sectionId: 'faq' },
    { href: '/#contact', label: 'Contact', sectionId: 'contact' },
  ];

  // 1. Scroll listener for progress bar, transparent->white background, and scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 8);

      // Scroll progress
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / winHeight)));
      }

      // Scrollspy
      const sections = ['features', 'how-it-works', 'pathways', 'pricing', 'about', 'faq', 'contact'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        role="banner"
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm py-3'
            : 'bg-transparent border-b border-transparent py-4'
        }`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Thin Scroll Progress Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#EEF2F6] overflow-hidden"
          style={{ height: '2.5px' }}
        >
          <div
            className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#059669] transition-transform duration-75 origin-left"
            style={{
              transform: `scaleX(${scrollProgress})`,
              transformOrigin: '0% 50%',
            }}
          />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline group focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-md outline-none"
            aria-label="CharteredOS Home"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-extrabold text-[15px] shadow-sm tracking-tight transition-transform group-hover:scale-105">
              CO
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] text-[#0F172A] tracking-tight leading-tight">
                CharteredOS
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase">
                Career platform for CAs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Scrollspy */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-7"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-medium transition-colors no-underline relative py-1 ${
                    isActive
                      ? 'text-[#1E3A8A] font-semibold'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navActivePill"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E3A8A] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {user?.role === 'PLATFORM_ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-[13px] font-semibold text-[#1E3A8A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors no-underline"
                  >
                    Admin Portal
                  </Link>
                )}
                {user?.role === 'RECRUITER' && (
                  <Link
                    href="/jobs"
                    className="text-[13px] font-semibold text-[#1E3A8A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors no-underline"
                  >
                    Recruiter Jobs
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 no-underline"
                >
                  <span>Command Center</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[14px] font-medium text-[#334155] hover:text-[#0F172A] px-3.5 py-1.5 rounded-lg transition-colors no-underline"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E40AF] px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 no-underline"
                >
                  <span>Launch Command Center</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-[#0F172A] hover:bg-[#F1F5F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer with Focus Trap & Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-Down Drawer */}
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white border-b border-[#E2E8F0] shadow-xl pt-4 pb-6 px-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 no-underline"
                >
                  <div className="w-7 h-7 rounded-md bg-[#1E3A8A] flex items-center justify-center text-white font-extrabold text-xs">
                    CO
                  </div>
                  <span className="font-extrabold text-[#0F172A] text-base">CharteredOS</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F1F5F9]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-1 py-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-medium text-[#334155] hover:text-[#1E3A8A] py-2.5 px-2 rounded-md hover:bg-[#F8FAFC] transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-lg bg-[#1E3A8A] text-white font-semibold text-[14px] shadow-sm no-underline"
                  >
                    Go to Command Center
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 px-4 rounded-lg border border-[#CBD5E1] text-[#334155] font-semibold text-[14px] hover:bg-[#F8FAFC] transition-colors no-underline"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 px-4 rounded-lg bg-[#1E3A8A] text-white font-semibold text-[14px] shadow-sm hover:bg-[#1E40AF] transition-colors no-underline"
                    >
                      Launch Command Center
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
