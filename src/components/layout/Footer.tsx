import React from 'react';
import Link from 'next/link';

const INTERNAL_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/studio', label: '3D Studio' },
  { href: '/writing', label: 'Writing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const EXTERNAL_LINKS = [
  { href: 'https://github.com/rafsan-j', label: 'GitHub', external: true },
  { href: 'https://linkedin.com/in/rafsan-jani72', label: 'LinkedIn', external: true },
  { href: '/resume.pdf', label: 'Resume', external: false },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-neutral)] bg-[var(--bg-canvas)]">
      <div className="w-full max-w-[1680px] mx-auto px-6 lg:px-10 pt-10 pb-24 md:pb-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5 space-y-1.5">
          <p className="text-sm font-medium text-[var(--ink-primary)] tracking-[-0.015em]">
            Rafsan Jani
          </p>
          <p className="text-xs text-[var(--ink-secondary)]">
            Computer Science &amp; Engineering, SUST — Sylhet, Bangladesh
          </p>
          <p className="text-xs font-mono text-[var(--ink-secondary)]">
            <a
              href="mailto:rafsan2972jani@gmail.com"
              className="hover-ink"
            >
              rafsan2972jani@gmail.com
            </a>
          </p>
        </div>

        <div className="md:col-span-7 flex flex-col gap-3 md:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {INTERNAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--ink-secondary)] hover-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-[var(--ink-secondary)]">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="hover-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
