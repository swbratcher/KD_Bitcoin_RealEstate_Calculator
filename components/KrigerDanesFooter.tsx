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
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
            <Link 
              href="https://krigerdanes.com"
              className="text-gray-600 hover:text-[#DD0000] transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="https://krigerdanes.com/books/"
              className="text-gray-600 hover:text-[#DD0000] transition-colors duration-200"
            >
              Books
            </Link>
            <Link 
              href="https://krigerdanes.com/contact/"
              className="text-gray-600 hover:text-[#DD0000] transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            <Link 
              href="https://linkedin.com/company/krigerdanes"
              className="text-gray-400 hover:text-[#DD0000] transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>
            <Link 
              href="https://twitter.com/krigerdanes"
              className="text-gray-400 hover:text-[#DD0000] transition-colors duration-200"
              aria-label="X (Twitter)"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link 
              href="https://primal.net/krigerdanes"
              className="text-gray-400 hover:text-[#DD0000] transition-colors duration-200"
              aria-label="Primal"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.19.208-.4.4-.63.576-.115.088-.235.171-.36.248-.06.042-.12.083-.18.123-.21.14-.43.27-.66.39-.115.06-.235.115-.36.165-.125.05-.25.095-.38.135-.26.08-.53.14-.8.18-.135.02-.27.035-.41.045-.14.01-.28.015-.42.015-.84 0-1.65-.16-2.39-.45-.74-.29-1.39-.7-1.94-1.22-.55-.52-.98-1.14-1.29-1.83-.31-.69-.46-1.43-.46-2.21 0-.78.15-1.52.46-2.21.31-.69.74-1.31 1.29-1.83.55-.52 1.2-.93 1.94-1.22.74-.29 1.55-.45 2.39-.45.42 0 .84.05 1.25.14.41.09.8.22 1.17.39.37.17.72.38 1.04.63.16.125.31.255.45.39.07.065.135.135.2.205.065.07.125.145.18.22.11.15.21.31.3.48.09.17.165.345.225.525.06.18.105.365.135.555.03.19.045.385.045.585 0 .2-.015.395-.045.585-.03.19-.075.375-.135.555-.06.18-.135.355-.225.525-.09.17-.19.33-.3.48-.055.075-.115.15-.18.22-.065.07-.13.14-.2.205-.14.135-.29.265-.45.39z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Copyright and Contact */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div>
              ©2025 Kriger Danes llc
            </div>
            <div>
              <Link 
                href="mailto:office@krigerdanes.com"
                className="text-gray-600 hover:text-[#DD0000] transition-colors duration-200"
              >
                office@krigerdanes.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}