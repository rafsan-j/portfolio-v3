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
    <footer className="bg-[#0E100F] text-[#EDE7DA] border-t border-white/10">
      <div className="w-full max-w-[1680px] mx-auto px-6 lg:px-10 pt-12 pb-24 md:pb-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5 space-y-2">
          <p className="font-serif text-xl tracking-[-0.01em] text-[#EDE7DA]">
            Rafsan Jani
          </p>
          <p className="text-xs text-[#9A9891]">
            Computer Science &amp; Engineering, SUST — Sylhet, Bangladesh
          </p>
          <p className="font-mono text-[11px] tracking-[0.04em] text-[#9A9891] tnum">
            24.8949° N, 91.8687° E · UTC+6
          </p>
        </div>

        <div className="md:col-span-7 flex flex-col gap-3.5 md:items-end">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {INTERNAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#EDE7DA]/70 transition-colors duration-[var(--dur-fast)] ease-obsidian hover:text-[#EDE7DA]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-[#9A9891]">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="transition-colors duration-[var(--dur-fast)] ease-obsidian hover:text-[#D99B52]"
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
