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

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="https://krigerdanes.com/books/"
                className="text-[#DD0000] hover:text-red-700 transition-colors duration-200 font-semibold text-sm uppercase tracking-wider"
              >
                LIBRARY
              </Link>
              <Link 
                href="https://krigerdanes.com/contact/"
                className="text-[#DD0000] hover:text-red-700 transition-colors duration-200 font-semibold text-sm uppercase tracking-wider"
              >
                CONTACT
              </Link>
              <Link 
                href="https://krigerdanes.com/get-notified/"
                className="text-[#DD0000] hover:text-red-700 transition-colors duration-200 font-semibold text-sm uppercase tracking-wider"
              >
                GET NOTIFIED
              </Link>
            </nav>

            {/* Tool Title */}
            <div className="hidden lg:block text-gray-600 text-sm font-medium border-l border-gray-200 pl-6">
              Bitcoin Real Estate Calculator
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button"
              className="text-[#DD0000] hover:text-red-700 transition-colors"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}