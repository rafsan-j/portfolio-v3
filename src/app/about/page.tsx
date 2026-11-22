import type { Metadata } from 'next';
import Link from 'next/link';
import { FileDown } from 'lucide-react';
import { PROFILE, TIMELINE } from '@/content/profile';
import { BangladeshMap } from '@/components/BangladeshMap';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Background, education at SUST CSE, engineering roles, academic milestones, and interactive 64-district Bangladesh map for Rafsan Jani.',
};

const KIND_LABELS: Record<string, string> = {
  education: 'Education',
  work: 'Role',
  award: 'Recognition',
  leadership: 'Leadership',
};

export default function AboutPage() {
  return (
    <div className="pt-16 w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      {/* Top 12-Column Asymmetric Profile & Timeline Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]">
        <header className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-20 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
              Colophon &amp; Biography
            </p>
            <h1 className="editorial-display text-[var(--ink-primary)]">
              {PROFILE.name}
            </h1>

            <p className="font-mono text-xs text-[var(--ink-secondary)]">
              {PROFILE.shortTitle} — {PROFILE.location}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-press inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-medium tracking-[0.02em] text-[var(--ink-on-accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:bg-[var(--accent-hover)]"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                <span>Resume (PDF)</span>
              </a>

              <Link
                href="/contact"
                className="tactile-press inline-flex min-h-[44px] items-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-5 py-2.5 text-xs font-medium tracking-[0.02em] text-[var(--ink-primary)] hover-border hover-accent"
              >
                Get in touch
              </Link>
            </div>

            <div className="pt-5 border-t border-[var(--border-neutral)] flex items-center gap-6 font-mono text-xs text-[var(--ink-secondary)]">
              <a
                href={PROFILE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-accent"
              >
                GitHub
              </a>
              <a
                href={PROFILE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-accent"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </header>

        <div className="lg:col-span-8 py-12 lg:py-20 lg:pl-12 space-y-16">
          {/* Narrative Bio */}
          <section aria-label="Biography" className="max-w-[64ch] space-y-5">
            <p className="editorial-quote text-[30px] lg:text-[38px] text-[var(--ink-primary)]">
              Software should stay reliable under real constraints — poor
              connectivity, strict rounding rules, and small screens.
            </p>
            <p className="text-base leading-[1.76] text-[var(--ink-secondary)]">
              {PROFILE.about.intro}
            </p>
          </section>

          {/* Architectural Timeline Ledger */}
          <section aria-labelledby="timeline-heading" className="space-y-5">
            <h2
              id="timeline-heading"
              className="font-serif font-normal text-[36px] lg:text-[44px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              Chronology
            </h2>

            <ol className="divide-y divide-[var(--border-neutral)] border-t border-b border-[var(--border-neutral)]">
              {TIMELINE.map((entry) => (
                <li
                  key={entry.id}
                  className="py-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-baseline"
                >
                  <div className="md:col-span-3 space-y-1">
                    <span className="block font-mono text-xs text-[var(--ink-primary)] tnum">
                      {entry.period}
                    </span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-secondary)]">
                      {KIND_LABELS[entry.kind] ?? entry.kind}
                    </span>
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <h3 className="font-serif text-[22px] leading-[1.2] text-[var(--ink-primary)]">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)]">
                      {entry.organization}
                    </p>
                    <p className="pt-1 text-sm leading-[1.64] text-[var(--ink-secondary)]">
                      {entry.summary}
                    </p>
                  </div>

                  <span className="md:col-span-3 md:text-right font-mono text-xs text-[var(--ink-secondary)]">
                    {entry.location}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* Bottom 12-Column Interactive 64-District Bangladesh Map */}
      <section
        id="map"
        aria-labelledby="map-heading"
        className="grid grid-cols-1 lg:grid-cols-12 scroll-mt-24"
      >
        <div className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-20 lg:pr-10">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
              Geography
            </p>
            <h2
              id="map-heading"
              className="font-serif font-normal text-[38px] lg:text-[48px] leading-[1.0] tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              Across <em className="italic font-light">Bangladesh</em>
            </h2>
            <p className="text-sm lg:text-[15px] leading-[1.7] text-[var(--ink-secondary)]">
              Three districts anchor my path so far: Dinajpur (hometown),
              Rajshahi (Rajshahi Cadet College), and Sylhet (SUST CSE). Select
              any of the 64 districts to inspect its division and details.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 py-10 lg:py-20 lg:pl-12">
          <BangladeshMap />
        </div>
      </section>
    </div>
  );
}
