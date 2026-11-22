'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/work',
    label: 'Work',
    match: (pathname) => pathname === '/work' || pathname.startsWith('/work/'),
  },
  {
    href: '/writing',
    label: 'Writing',
    match: (pathname) => pathname === '/writing' || pathname.startsWith('/writing/'),
  },
  {
    href: '/about',
    label: 'About',
    match: (pathname) => pathname === '/about',
  },
  {
    href: '/contact',
    label: 'Contact',
    match: (pathname) => pathname === '/contact',
  },
];

export function TopStatusBar() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleOpenPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const showScrim = scrolled || pathname !== '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 z-[var(--z-topbar)] transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)] ease-obsidian ${
        showScrim
          ? 'bg-[#0E100F]/75 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full max-w-[1680px] mx-auto h-full px-6 lg:px-10 flex items-center justify-between gap-6">
        {/* Left: Wordmark */}
        <Link
          href="/"
          className="font-serif text-xl tracking-[-0.01em] text-[#EDE7DA] transition-opacity duration-[var(--dur-fast)] ease-obsidian hover:opacity-80 whitespace-nowrap"
        >
          Rafsan Jani
        </Link>

        {/* Center: Clean Horizontal Text Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-sm tracking-[0.01em] transition-colors duration-[var(--dur-fast)] ease-obsidian ${
                  isActive
                    ? 'text-[#EDE7DA] font-medium'
                    : 'text-[#EDE7DA]/70 hover:text-[#EDE7DA]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-[#D99B52]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Borderless ⌘K trigger + quiet 3D Studio pill */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOpenPalette}
            aria-label="Open command palette"
            className="tactile-press inline-flex min-h-[40px] min-w-[40px] items-center justify-center px-2 font-mono text-xs text-[#EDE7DA]/75 hover:text-[#EDE7DA] focus-visible:rounded-full"
          >
            ⌘K
          </button>

          <Link
            href="/studio"
            className="tactile-press inline-flex items-center justify-center rounded-full border border-[#EDE7DA]/25 px-4 py-1.5 text-xs font-medium tracking-[0.02em] text-[#EDE7DA] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:bg-[#EDE7DA] hover:text-[#0E100F] whitespace-nowrap"
          >
            3D Studio
          </Link>
        </div>
      </div>
    </header>
  );
}

export default TopStatusBar;
