import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedEssays } from '@/content/writing';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Technical essays and engineering notes on Android security architecture, integer-paisa accounting, and WebGL bundle isolation.',
};

export default function WritingPage() {
  const essays = getPublishedEssays();

  return (
    <div className="pt-16 w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Sticky Left Header Rail */}
        <header className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-20 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
              Field Notes
            </p>
            <h1 className="editorial-display text-[var(--ink-primary)]">
              Engineering <em className="italic font-light">Writing</em>
            </h1>
            <p className="text-[15px] leading-[1.72] text-[var(--ink-secondary)]">
              Long-form technical notes documenting architectural tradeoffs,
              exact-precision financial math, and frontend performance
              boundaries from shipped projects.
            </p>
            <div className="pt-5 border-t border-[var(--border-neutral)] flex items-center justify-between font-mono text-xs text-[var(--ink-secondary)] tnum">
              <span>Published notes</span>
              <span>{essays.length} essays</span>
            </div>
          </div>
        </header>

        {/* Right 8-Column Tabular Essay Ledger */}
        <section
          aria-label="Published essays"
          className="lg:col-span-8 divide-y divide-[var(--border-neutral)] group/list"
        >
          {essays.map((essay) => (
            <Link
              key={essay.slug}
              href={`/writing/${essay.slug}`}
              className="group block py-10 lg:px-10 transition-opacity duration-[var(--dur-base)] ease-obsidian hover-surface group-hover/list:opacity-55 hover:!opacity-100"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[var(--ink-secondary)] tnum">
                <div className="flex items-center gap-4">
                  <time dateTime={essay.publishedAt}>
                    {formatDate(essay.publishedAt)}
                  </time>
                  <span>{essay.readingTimeMinutes} min read</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {essay.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-[11px] text-[var(--ink-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="mt-4 font-serif font-normal text-[34px] lg:text-[44px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                {essay.title}
              </h2>

              <p className="mt-3 text-sm lg:text-[15px] font-medium text-[var(--ink-primary)]">
                {essay.subtitle}
              </p>

              <p className="mt-2 max-w-[64ch] text-sm leading-[1.68] text-[var(--ink-secondary)]">
                {essay.excerpt}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
