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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="https://krigerdanes.com" className="flex items-center">
              {/* KrigerDanes Logo */}
              <img 
                src="https://krigerdanes.com/wp-content/uploads/2024/11/KrigerDanes_Logo.svg"
                alt="Kriger Danes" 
                className="h-[70px] w-auto"
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


        </div>
      </div>
    </header>
  );
}