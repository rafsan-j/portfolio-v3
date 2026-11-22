import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FileDown, Mail } from 'lucide-react';
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
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
      {/* Narrative Bio */}
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
          About · {PROFILE.location}
        </p>
        <h1 className="mt-2 text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          {PROFILE.name}
        </h1>
        <p className="mt-4 text-base sm:text-[1.0625rem] leading-[1.7] text-[var(--ink-secondary)]">
          {PROFILE.about.intro}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            <span>Download Resume (PDF)</span>
          </a>

          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:border-[var(--border-hover)]"
          >
            <Mail
              className="h-4 w-4 text-[var(--ink-secondary)]"
              aria-hidden="true"
            />
            <span>Get in touch</span>
          </Link>

          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <a
            href={PROFILE.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Canonical Vertical Timeline */}
      <section aria-labelledby="timeline-heading" className="mt-16 sm:mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
          Background &amp; Credentials
        </p>
        <h2
          id="timeline-heading"
          className="mt-1.5 text-2xl sm:text-[1.875rem] font-semibold tracking-[-0.025em] leading-[1.22] text-[var(--ink-primary)]"
        >
          Timeline
        </h2>

        <ol className="mt-8 relative border-l border-[var(--border-neutral)] ml-2.5 space-y-6">
          {TIMELINE.map((entry) => (
            <li key={entry.id} className="pl-6 sm:pl-8 relative">
              <span
                className="absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--accent)]"
                aria-hidden="true"
              />
              <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-md bg-[var(--bg-track)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--ink-secondary)]">
                    {KIND_LABELS[entry.kind] ?? entry.kind}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                    {entry.period} · {entry.location}
                  </span>
                </div>

                <h3 className="mt-3 text-base sm:text-lg font-semibold tracking-[-0.015em] text-[var(--ink-primary)]">
                  {entry.title}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-[var(--ink-secondary)]">
                  {entry.organization}
                </p>
                <p className="mt-2.5 text-sm leading-[1.6] text-[var(--ink-secondary)]">
                  {entry.summary}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Interactive 64-District Bangladesh Map */}
      <section
        id="map"
        aria-labelledby="map-heading"
        className="mt-20 sm:mt-24 scroll-mt-20"
      >
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
            Geography · 64 Districts
          </p>
          <h2
            id="map-heading"
            className="mt-1.5 text-2xl sm:text-[1.875rem] font-semibold tracking-[-0.025em] leading-[1.22] text-[var(--ink-primary)]"
          >
            Across Bangladesh
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-[1.65] text-[var(--ink-secondary)]">
            Three districts anchor my path so far: Dinajpur (hometown), Rajshahi
            (Rajshahi Cadet College), and Sylhet (SUST CSE). Select any district
            to inspect its division and details.
          </p>
        </div>

        <div className="mt-6">
          <BangladeshMap />
        </div>
      </section>
    </div>
  );
}
