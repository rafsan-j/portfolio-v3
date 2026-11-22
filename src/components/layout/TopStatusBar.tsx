'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const SYLHET_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function TopStatusBar() {
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
      <div className="max-w-5xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[-0.015em] text-[var(--ink-primary)] hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] whitespace-nowrap"
          >
            Rafsan Jani
          </Link>

          <span
            className="hidden sm:inline-block h-3.5 w-px bg-[var(--border-neutral)]"
            aria-hidden="true"
          />

          <div
            className="hidden sm:flex items-center gap-2 font-mono text-xs tracking-[0.02em] text-[var(--ink-secondary)] tabular-nums select-none"
            aria-live="off"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
              aria-hidden="true"
            />
            <time dateTime={clock ?? undefined}>
              {clock ? `SYLHET · ${clock} BST` : 'SYLHET · --:--:-- BST'}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleOpenPalette}
            aria-label="Open command palette"
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:h-9 sm:px-2.5 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-neutral)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
          >
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline font-mono text-xs tracking-[0.02em]">
              ⌘K
            </span>
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
            className="w-[44px] h-[44px] sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg border border-[var(--border-neutral)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
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
        </div>
      </div>
    </header>
  );
}

export default TopStatusBar;
