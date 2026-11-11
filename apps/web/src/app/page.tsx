'use client';

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CoreCapabilities } from '../components/home/CoreCapabilities';
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

      {/* Main Home Page Sections with Calm Background Rhythm */}
      <div id="main-content" className="flex flex-col w-full overflow-x-clip bg-[#FAF9F6]">
        {/* 1. Hero Section */}
        <div>
          <HeroSection />
        </div>

        {/* 2. Core Capabilities */}
        <div className="bg-white border-y border-[#E7E5E4]">
          <CoreCapabilities />
        </div>

        {/* 3. Transparent Pricing Tiers */}
        <div>
          <PricingSection />
        </div>

        {/* 4. Purpose & Governance */}
        <div className="bg-white border-y border-[#E7E5E4]">
          <PurposeGovernance />
        </div>

        {/* 5. FAQ Accordion */}
        <div>
          <FAQSection />
        </div>

        {/* 6. Contact & Member Operations */}
        <div className="bg-white border-t border-[#E7E5E4]">
          <ContactSection />
        </div>

        {/* 7. Final Call to Action */}
        <div className="border-t border-[#E7E5E4]">
          <FinalCTA />
        </div>

        {/* Floating Back to Top Button */}
        <BackToTop />
      </div>
    </>
  );
}
