'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const SYLHET_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

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
  const { theme, mounted, toggleTheme } = useTheme();
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setClock(SYLHET_FORMATTER.format(new Date()));
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleOpenPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header className="sticky top-0 h-14 z-[var(--z-topbar)] bg-[var(--bg-canvas-translucent)] backdrop-blur-md border-b border-[var(--border-neutral)]">
      <div className="w-full max-w-[1680px] mx-auto h-full px-6 lg:px-10 flex items-stretch justify-between">
        {/* Left + Center-left: Identity & Horizontal Navigation */}
        <div className="flex items-stretch min-w-0">
          <Link
            href="/"
            className="flex items-center pr-6 md:border-r md:border-[var(--border-neutral)] text-sm font-medium tracking-[-0.015em] text-[var(--ink-primary)] hover-accent whitespace-nowrap"
          >
            Rafsan Jani
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-stretch md:border-r md:border-[var(--border-neutral)] px-2 lg:px-3"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center px-3.5 text-sm transition-colors duration-[var(--dur-fast)] ease-obsidian ${
                    isActive
                      ? 'text-[var(--ink-primary)] font-medium'
                      : 'text-[var(--ink-secondary)] hover-ink'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute inset-x-3.5 bottom-0 h-[2px] bg-[var(--accent)]"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center-right + Far-right: Live Sylhet Clock & Utility Controls */}
        <div className="flex items-stretch">
          <div
            className="hidden lg:flex items-center gap-2.5 px-6 border-l border-r border-[var(--border-neutral)] font-mono text-xs text-[var(--ink-secondary)] tabular-nums select-none whitespace-nowrap"
            aria-live="off"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
              aria-hidden="true"
            />
            <time dateTime={clock ?? undefined}>
              {clock ? `Sylhet · ${clock} BST` : 'Sylhet · --:--:-- BST'}
            </time>
          </div>

          <div className="flex items-center gap-2 pl-4 lg:pl-5">
            <button
              type="button"
              onClick={handleOpenPalette}
              aria-label="Open command palette"
              className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:h-9 md:px-2.5 inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-neutral)] hover-border bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover-ink active:scale-[0.97]"
            >
              <Search className="w-4 h-4 md:w-3.5 md:h-3.5" aria-hidden="true" />
              <span className="hidden md:inline font-mono text-xs">⌘K</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                mounted
                  ? theme === 'dark'
                    ? 'Switch to light theme'
                    : 'Switch to dark theme'
                  : 'Toggle color theme'
              }
              className="w-[44px] h-[44px] md:w-9 md:h-9 inline-flex items-center justify-center rounded-md border border-[var(--border-neutral)] hover-border bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover-ink active:scale-[0.97]"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )
              ) : (
                <span className="w-4 h-4 block" aria-hidden="true" />
              )}
            </button>

            <Link
              href="/studio"
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-neutral)] hover-border bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-primary)] hover-accent active:scale-[0.97] whitespace-nowrap"
            >
              <Box className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
              <span>3D Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopStatusBar;
