'use client';

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CoreCapabilities } from '../components/home/CoreCapabilities';
import { HowItWorks } from '../components/home/HowItWorks';
import { SevenHorizons } from '../components/home/SevenHorizons';
import { PricingSection } from '../components/home/PricingSection';
import { PurposeGovernance } from '../components/home/PurposeGovernance';
import { FAQSection } from '../components/home/FAQSection';
import { ContactSection } from '../components/home/ContactSection';
import { FinalCTA } from '../components/home/FinalCTA';
import { BackToTop } from '../components/home/BackToTop';

export default function RootHomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CharteredOS',
    url: 'https://cacareeros.com',
    logo: 'https://cacareeros.com/logo.png',
    description:
      'Career operating system engineered exclusively for Indian Chartered Accountants, providing articleship capability diagnostics, 7 specialized horizons, Big 4 interview drills, and unbundled take-home compensation analytics.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: ['https://linkedin.com/company/chartered-os'],
  };

  return (
    <>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* Skip to Content Link (Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1E3A8A] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Main Home Page Sections with Alternating Background Rhythm */}
      <div id="main-content" className="flex flex-col w-full overflow-x-clip">
        {/* 1. Hero Section (White / Soft Radial Glow) */}
        <div className="bg-white">
          <HeroSection />
        </div>

        {/* 2. Core Capabilities Bento Grid (White) */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <CoreCapabilities />
        </div>

        {/* 4. Systematic How It Works Stepper (Soft Off-White #F8FAFC) */}
        <div className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
          <HowItWorks />
        </div>

        {/* 5. Seven Career Horizons (White) */}
        <div className="bg-white">
          <SevenHorizons />
        </div>

        {/* 6. Transparent Pricing Tiers (Soft Tint #F8FAFC) */}
        <div className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
          <PricingSection />
        </div>

        {/* 7. Purpose & Governance (White) */}
        <div className="bg-white">
          <PurposeGovernance />
        </div>

        {/* 8. FAQ Accordion (Soft Tint #F8FAFC) */}
        <div className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
          <FAQSection />
        </div>

        {/* 9. Contact & Member Operations (White) */}
        <div className="bg-white">
          <ContactSection />
        </div>

        {/* 10. Final Call to Action (Gradient Card on #F8FAFC) */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <FinalCTA />
        </div>

        {/* Floating Back to Top Button */}
        <BackToTop />
      </div>
    </>
  );
}
