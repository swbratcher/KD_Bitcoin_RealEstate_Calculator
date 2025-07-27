/**
 * KrigerDanes Header Component
 * Matches the branding and styling from KrigerDanes.com
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function KrigerDanesHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - constrained to header height */}
          <div className="flex items-center h-full py-2">
            <Link href="https://krigerdanes.com" className="flex items-center h-full">
              {/* KrigerDanes Logo */}
              <img 
                src="https://krigerdanes.com/wp-content/uploads/2024/11/KrigerDanes_Logo.svg"
                alt="Kriger Danes" 
                className="h-full w-auto"
                onError={(e) => {
                  console.log('Logo failed to load, falling back to text');
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = '<div class="text-black font-bold text-xl">KRIGER DANES</div>';
                  }
                }}
              />
            </Link>
          </div>

          {/* Navigation Links with KD styling */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="https://krigerdanes.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              About KD
            </Link>
            <Link 
              href="https://github.com/swbratcher/KD_Bitcoin_RealEstate_Calculator" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              View Source
            </Link>
            <Link 
              href="https://github.com/swbratcher/KD_Bitcoin_RealEstate_Calculator/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Report Bug
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}