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
      aria-label="Mobile navigation"
      className="md:hidden fixed left-1/2 -translate-x-1/2 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-[var(--z-dock)] h-16 p-[9px] rounded-full bg-[#151817]/90 backdrop-blur-md border border-white/10 shadow-[var(--shadow-dock)] flex items-center gap-1"
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
            className={`tactile-press relative w-[46px] h-[46px] rounded-full flex items-center justify-center transition-colors duration-[var(--dur-fast)] ease-obsidian ${
              isActive
                ? 'bg-[#D99B52]/15 text-[#D99B52]'
                : 'text-[#9A9891] hover:text-[#EDE7DA]'
            }`}
          >
            <Icon className="w-[19px] h-[19px]" aria-hidden={true} />
          </Link>
        );
      })}
    </nav>
  );
}

export default FloatingDock;
