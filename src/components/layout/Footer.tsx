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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-[var(--ink-primary)] tracking-[-0.015em]">
            Rafsan Jani
          </p>
          <p className="text-xs font-mono text-[var(--ink-secondary)] tracking-[0.02em]">
            Sylhet, Bangladesh · Computer Science &amp; Engineering, SUST
          </p>
          <p className="text-xs font-mono text-[var(--ink-secondary)]">
            <a
              href="mailto:rafsan2972jani@gmail.com"
              className="hover:text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)]"
            >
              rafsan2972jani@gmail.com
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {INTERNAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-[var(--ink-secondary)]">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)]"
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
