'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopStatusBar } from '@/components/layout/TopStatusBar';
import { FloatingDock } from '@/components/layout/FloatingDock';

interface ShellChromeProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function ShellChrome({ children, footer }: ShellChromeProps) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/studio') {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-toast)] focus:px-4 focus:py-2 focus:rounded-md focus:bg-[var(--accent)] focus:text-[var(--ink-on-accent)] focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <TopStatusBar />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      {footer}
      <FloatingDock />
    </>
  );
}

export default ShellChrome;
