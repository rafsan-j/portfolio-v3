import React from 'react';
import Link from 'next/link';
import { PROFILE } from '@/content/profile';
import {
  FLAGSHIP_PROJECTS,
  SUPPORTING_PROJECTS,
  getProjectBySlug,
} from '@/content/projects';
import { getPublishedEssays } from '@/content/writing';
import { formatDate } from '@/lib/utils';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { StudioHeroPortal } from '@/components/instruments/StudioHeroPortal';
import { OttoBudgetInstrument } from '@/components/instruments/OttoBudgetInstrument';
import { MessManagerInstrument } from '@/components/instruments/MessManagerInstrument';
import { UjaanInstrument } from '@/components/instruments/UjaanInstrument';
import { VellumInstrument } from '@/components/instruments/VellumInstrument';

const FLAGSHIP_SPREADS = [
  { slug: 'ottobudget', Instrument: OttoBudgetInstrument },
  { slug: 'mess-manager', Instrument: MessManagerInstrument },
  { slug: 'ujaan', Instrument: UjaanInstrument },
  { slug: 'vellum', Instrument: VellumInstrument },
] as const;

export default function HomePage() {
  const studioProject = getProjectBySlug('living-sylhet-studio');
  const essays = getPublishedEssays();

  return (
    <div className="w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      {/* Viewport-Locked Asymmetric Hero */}
      <section className="min-h-[calc(100svh-56px)] grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]">
        <div className="lg:col-span-5 lg:border-r border-[var(--border-neutral)] flex flex-col justify-between py-10 lg:py-14 lg:pr-10">
          <div className="my-auto py-6 lg:py-8">
            <h1 className="editorial-display text-[var(--ink-primary)]">
              Systems that hold under real-world pressure.
            </h1>

            <p className="mt-7 max-w-[46ch] text-[15px] lg:text-base leading-[1.68] text-[var(--ink-secondary)]">
              Computer Science and Engineering undergraduate at SUST in Sylhet,
              building offline-first native Android software, applied AI
              dispatch systems, and procedural WebGL graphics. Every project is
              engineered for constrained networks, exact arithmetic, and tactile
              clarity.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/work"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:bg-[var(--accent-hover)] active:scale-[0.98]"
              >
                Explore selected work
              </Link>

              <Link
                href="/studio"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] hover-border hover-accent active:scale-[0.98]"
              >
                Enter 3D Studio
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border-neutral)] flex items-center justify-between gap-4 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
            <span>24.8949° N, 91.8687° E · Sylhet, Bangladesh</span>
            <span className="hidden sm:inline text-[var(--ink-secondary)]">
              {FLAGSHIP_PROJECTS.length} Flagships
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 min-h-[440px] lg:min-h-0 flex flex-col border-t lg:border-t-0 border-[var(--border-neutral)]">
          <div className="w-full h-full flex-1 flex flex-col">
            <StudioHeroPortal />
          </div>
        </div>
      </section>

      {/* Four Asymmetric Sticky Split-Screen Flagship Spreads */}
      <section aria-label="Selected flagship work">
        {FLAGSHIP_SPREADS.map(({ slug, Instrument }) => {
          const project = getProjectBySlug(slug);
          if (!project) return null;

          return (
            <article
              key={project.slug}
              className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]"
            >
              <div className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-16 lg:pr-10">
                <div className="lg:sticky lg:top-20 lg:self-start space-y-5">
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                    <span>{project.role}</span>
                    <span>{project.year}</span>
                  </div>

                  <h2 className="font-serif font-normal text-[40px] lg:text-[48px] leading-[1.02] tracking-[-0.02em] text-[var(--ink-primary)]">
                    {project.title}
                  </h2>

                  <p className="text-[15px] leading-[1.66] text-[var(--ink-primary)]">
                    {project.tagline}
                  </p>

                  <p className="text-sm leading-[1.66] text-[var(--ink-secondary)]">
                    {project.summary}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-xs text-[var(--ink-secondary)]">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-2 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3">
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--ink-primary)] underline decoration-[var(--border-interactive)] underline-offset-[6px] hover:decoration-[var(--accent)] hover-accent"
                    >
                      Read case study
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 py-10 lg:py-16 lg:pl-10 flex items-center">
                <div className="w-full">
                  <Instrument />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Full-Bleed Tabular Archive Ledger */}
      <section
        aria-labelledby="archive-ledger-heading"
        className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]"
      >
        <div className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-14 lg:pr-10">
          <div className="lg:sticky lg:top-20 lg:self-start space-y-3">
            <h2
              id="archive-ledger-heading"
              className="font-serif font-normal text-[36px] lg:text-[42px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              Archive
            </h2>
            <p className="text-sm leading-[1.65] text-[var(--ink-secondary)]">
              Procedural graphics environments and focused Android utilities
              shipped alongside the flagship builds.
            </p>
            <div className="pt-1">
              <Link
                href="/work"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--ink-secondary)] underline decoration-[var(--border-neutral)] underline-offset-[6px] hover:decoration-[var(--accent)] hover-ink"
              >
                View complete work index
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 divide-y divide-[var(--border-neutral)]">
          {studioProject && (
            <Link
              href={`/work/${studioProject.slug}`}
              className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 lg:px-8 hover-surface items-baseline"
            >
              <span className="md:col-span-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                {studioProject.year}
              </span>
              <div className="md:col-span-6 space-y-1">
                <h3 className="text-base font-medium text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                  {studioProject.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--ink-secondary)]">
                  {studioProject.tagline}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right font-mono text-xs text-[var(--ink-secondary)]">
                {studioProject.stack.slice(0, 3).join(', ')}
              </div>
            </Link>
          )}

          {SUPPORTING_PROJECTS.map((item) => (
            <div
              key={item.slug}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 lg:px-8 hover-surface items-baseline"
            >
              <span className="md:col-span-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                Android
              </span>
              <div className="md:col-span-6 space-y-1">
                <h3 className="text-base font-medium text-[var(--ink-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--ink-secondary)]">
                  {item.tagline}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right font-mono text-xs text-[var(--ink-secondary)]">
                {item.stack.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Bleed Tabular Writing Ledger */}
      <section
        aria-labelledby="writing-ledger-heading"
        className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]"
      >
        <div className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-14 lg:pr-10">
          <div className="lg:sticky lg:top-20 lg:self-start space-y-3">
            <h2
              id="writing-ledger-heading"
              className="font-serif font-normal text-[36px] lg:text-[42px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              Engineering Writing
            </h2>
            <p className="text-sm leading-[1.65] text-[var(--ink-secondary)]">
              Technical notes on Android permission architecture, deterministic
              integer-paisa accounting, and WebGL bundle isolation.
            </p>
            <div className="pt-1">
              <Link
                href="/writing"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--ink-secondary)] underline decoration-[var(--border-neutral)] underline-offset-[6px] hover:decoration-[var(--accent)] hover-ink"
              >
                Read all essays
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 divide-y divide-[var(--border-neutral)]">
          {essays.map((essay) => (
            <Link
              key={essay.slug}
              href={`/writing/${essay.slug}`}
              className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-7 lg:px-8 hover-surface items-baseline"
            >
              <time
                dateTime={essay.publishedAt}
                className="md:col-span-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums"
              >
                {formatDate(essay.publishedAt)}
              </time>

              <div className="md:col-span-8 space-y-1.5">
                <h3 className="text-base font-medium leading-[1.35] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                  {essay.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--ink-secondary)]">
                  {essay.excerpt}
                </p>
              </div>

              <span className="md:col-span-2 md:text-right font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                {essay.readingTimeMinutes} min read
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Wide Editorial Contact Strip */}
      <section
        aria-labelledby="contact-strip-heading"
        className="py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-end"
      >
        <div className="lg:col-span-7 space-y-3">
          <h2
            id="contact-strip-heading"
            className="font-serif font-normal text-[38px] lg:text-[52px] leading-[1.02] tracking-[-0.02em] text-[var(--ink-primary)]"
          >
            Building something that needs to work reliably?
          </h2>
          <p className="max-w-[58ch] text-sm lg:text-base leading-[1.66] text-[var(--ink-secondary)]">
            {PROFILE.contact.availability}
          </p>
        </div>

        <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-3">
          <CopyEmailButton />
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:bg-[var(--accent-hover)] active:scale-[0.98]"
          >
            Open contact page
          </Link>
        </div>
      </section>
    </div>
  );
}
