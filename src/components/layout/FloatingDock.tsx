'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Briefcase, Home, PenLine, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DockItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

const DOCK_ITEMS: DockItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    match: (pathname) => pathname === '/',
  },
  {
    href: '/work',
    label: 'Work',
    icon: Briefcase,
    match: (pathname) => pathname === '/work' || pathname.startsWith('/work/'),
  },
  {
    href: '/studio',
    label: '3D Studio',
    icon: Box,
    match: (pathname) => pathname === '/studio',
  },
  {
    href: '/writing',
    label: 'Writing',
    icon: PenLine,
    match: (pathname) => pathname === '/writing' || pathname.startsWith('/writing/'),
  },
  {
    href: '/about',
    label: 'About',
    icon: User,
    match: (pathname) => pathname === '/about',
  },
];

export function FloatingDock() {
  const pathname = usePathname() || '/';

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-[var(--z-dock)] h-16 p-[9px] rounded-full bg-[var(--bg-surface-translucent)] backdrop-blur-md border border-[var(--border-neutral)] shadow-[var(--shadow-dock)] flex items-center gap-1"
    >
      {DOCK_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative w-[46px] h-[46px] rounded-full flex items-center justify-center transition-colors duration-[var(--dur-fast)] active:scale-[0.97] ${
              isActive
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-track)]'
            }`}
          >
            <Icon className="w-[19px] h-[19px]" aria-hidden={true} />
            <span
              role="tooltip"
              className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-[var(--dur-fast)] absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-neutral)] text-[var(--ink-primary)] font-mono text-xs tracking-[0.02em] whitespace-nowrap shadow-[var(--shadow-dock)]"
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default FloatingDock;
