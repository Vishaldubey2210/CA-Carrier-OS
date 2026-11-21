'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/articleship', label: 'Articleship (₹99)' },
    { href: '/jobs', label: 'CA Jobs (₹199)' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 8);

      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / winHeight)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            ? 'bg-[#FBFBFA]/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs py-3'
            : 'bg-transparent border-b border-transparent py-4'
        }`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-200/50 overflow-hidden">
          <div
            className="h-full bg-[#09090B] transition-transform duration-75 origin-left"
            style={{
              transform: `scaleX(${scrollProgress})`,
              transformOrigin: '0% 50%',
            }}
          />
        </div>

        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline group focus-visible:ring-2 focus-visible:ring-black rounded-md outline-none"
            aria-label="CharteredOS Home"
          >
            <div className="w-8 h-8 rounded-md bg-[#09090B] flex items-center justify-center text-white font-black text-[13px] tracking-tight">
              CO
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] text-[#09090B] tracking-tight leading-tight">
                CharteredOS
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">
                Articleship &amp; CA Jobs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13.5px] font-medium transition-colors no-underline ${
                    isActive
                      ? 'text-[#09090B] font-semibold'
                      : 'text-neutral-600 hover:text-[#09090B]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#09090B] hover:bg-neutral-800 px-4 py-2 rounded-md shadow-xs transition-colors no-underline"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13.5px] font-medium text-neutral-700 hover:text-black px-3.5 py-1.5 rounded-md transition-colors no-underline"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#09090B] hover:bg-neutral-800 px-4 py-2 rounded-md shadow-xs transition-colors no-underline"
                >
                  <span>Get Started</span>
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
            className="md:hidden p-2 rounded-md text-[#09090B] hover:bg-neutral-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white border-b border-neutral-200 shadow-xl pt-4 pb-6 px-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 no-underline"
                >
                  <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-white font-bold text-xs">
                    CO
                  </div>
                  <span className="font-bold text-black text-base">CharteredOS</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-neutral-600 hover:text-black rounded-md hover:bg-neutral-100"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 py-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[15px] font-medium text-neutral-700 hover:text-black py-2.5 px-2 rounded-md hover:bg-neutral-100 transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-md bg-black text-white font-semibold text-[14px] no-underline"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 px-4 rounded-md border border-neutral-300 text-neutral-800 font-semibold text-[14px] hover:bg-neutral-50 transition-colors no-underline"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 px-4 rounded-md bg-black text-white font-semibold text-[14px] hover:bg-neutral-800 transition-colors no-underline"
                    >
                      Get Started
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
