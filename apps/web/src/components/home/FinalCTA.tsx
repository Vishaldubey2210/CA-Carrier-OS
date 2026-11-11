'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCw, UserCheck, ArrowRight, GraduationCap } from 'lucide-react';

export function FinalCTA() {
  const router = useRouter();
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  const handleLaunchTestDrive = () => {
    if (isEnteringDemo) return;
    setIsEnteringDemo(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <section className="max-w-[1120px] mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 sm:p-12 text-center shadow-xs flex flex-col items-center gap-5">
        <h2 className="text-[clamp(1.75rem,2.8vw,2.25rem)] font-semibold text-[#1C1917] tracking-tight leading-snug m-0 max-w-[600px]">
          Start exploring verified CA opportunities today
        </h2>

        <p className="text-[15px] text-[#57534E] max-w-[560px] m-0 leading-relaxed">
          Access 480+ verified articleship and qualified finance openings, Form 108 practical training tracking, and confidential career discovery.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-[14px] font-medium shadow-xs transition-colors"
          >
            <GraduationCap size={16} />
            <span>Browse Articleships</span>
          </Link>

          <button
            type="button"
            onClick={handleLaunchTestDrive}
            disabled={isEnteringDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5F5F4] hover:bg-[#EBEAE5] text-[#1C1917] border border-[#E7E5E4] text-[14px] font-medium transition-colors cursor-pointer"
          >
            {isEnteringDemo ? (
              <>
                <RotateCw size={15} className="animate-spin text-[#1E3A8A]" />
                <span>Entering Workspace...</span>
              </>
            ) : (
              <>
                <UserCheck size={15} className="text-[#1E3A8A]" />
                <span>One-Click Instant Demo</span>
              </>
            )}
          </button>
        </div>

        <span className="text-[12px] text-[#78716C] pt-2">
          Free candidate registration • No credit card required • ICAI code of ethics compliant
        </span>
      </div>
    </section>
  );
}
