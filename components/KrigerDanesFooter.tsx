/**
 * KrigerDanes Footer Component
 * Matches the branding and styling from KrigerDanes.com
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function KrigerDanesFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Footer Links with KD styling */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <Link 
            href="https://krigerdanes.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            About KD
          </Link>
          <span className="text-gray-300">•</span>
          <Link 
            href="https://github.com/swbratcher/KD_Bitcoin_RealEstate_Calculator" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            View Source on GitHub
          </Link>
          <span className="text-gray-300">•</span>
          <Link 
            href="https://github.com/swbratcher/KD_Bitcoin_RealEstate_Calculator/issues" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-['Times_New_Roman'] text-center uppercase tracking-[1px] leading-[20px] font-normal text-black text-[15px] hover:text-[#DD0000] transition-colors"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            Report a Bug
          </Link>
        </div>

        {/* Professional Disclaimer */}
        <div className="text-xs text-gray-400 max-w-4xl mx-auto leading-relaxed">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This calculator is provided for educational and informational purposes only. 
            It does not constitute financial, investment, tax, or legal advice. The calculations are based on assumptions 
            and projections that may not reflect actual market conditions or individual circumstances. Bitcoin and real 
            estate investments carry significant risks, including potential loss of principal. Past performance does not 
            guarantee future results. Please consult with qualified financial, tax, and legal professionals before making 
            any investment decisions.
          </p>
          <p className="text-gray-500">
            Licensed under MIT License. Copyright (c) 2025 Kriger Danes LLC.
          </p>
          {/* MIT License allows derivative works, just credit Kriger Danes llc and link to krigerdanes.com in retained credit. */}
        </div>
      </div>
    </footer>
  );
}