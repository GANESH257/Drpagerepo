'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardFooterProps {
  sidebarCollapsed?: boolean;
}

export function DashboardFooter({ sidebarCollapsed = false }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={cn(
        'transition-all duration-300 border-t border-gray-200 bg-white flex-shrink-0',
        'lg:ml-64',
        sidebarCollapsed && 'lg:ml-16'
      )}
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {currentYear} Alliance of Independent Physicians. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-brand-teal transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-brand-teal transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/contact-us" 
              className="text-gray-600 hover:text-brand-teal transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
