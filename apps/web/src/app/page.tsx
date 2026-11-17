'use client';

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CoreCapabilities } from '../components/home/CoreCapabilities';
import { PricingSection } from '../components/home/PricingSection';
import { FAQSection } from '../components/home/FAQSection';
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
      'Verified CA Articleship vacancies (Form 102/103), Industrial Training (Form 104), and Qualified Chartered Accountant jobs in India.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-md focus:shadow-md focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Main Home Page Sections - Clean Black & White */}
      <div id="main-content" className="flex flex-col w-full overflow-x-clip bg-white text-black">
        {/* 1. Hero Section */}
        <div>
          <HeroSection />
        </div>

        {/* 2. Core Capabilities: Articleship & Jobs */}
        <div className="border-t border-neutral-200 bg-white">
          <CoreCapabilities />
        </div>

        {/* 3. Transparent Pricing: ₹99 & ₹199 */}
        <div className="border-t border-neutral-200 bg-white">
          <PricingSection />
        </div>

        {/* 4. FAQ Accordion */}
        <div className="border-t border-neutral-200 bg-white">
          <FAQSection />
        </div>

        {/* 5. Final Call to Action */}
        <div className="border-t border-neutral-200 bg-white">
          <FinalCTA />
        </div>

        {/* Floating Back to Top Button */}
        <BackToTop />
      </div>
    </>
  );
}
