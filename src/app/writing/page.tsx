import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ESSAYS } from '@/content/writing';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Technical essays and engineering notes on Android security architecture, integer-paisa accounting, and WebGL bundle isolation.',
};

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
          Engineering Notes
        </p>
        <h1 className="mt-2 text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          Writing
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-[var(--ink-secondary)]">
          Long-form technical notes documenting architectural tradeoffs,
          exact-precision financial math, and frontend performance boundaries
          from shipped projects.
        </p>
      </header>

      <section aria-label="Published essays" className="mt-10 space-y-4">
        {ESSAYS.map((essay) => (
          <Link
            key={essay.slug}
            href={`/writing/${essay.slug}`}
            className="group block rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6 sm:p-7 transition-colors duration-150 hover:border-[var(--border-hover)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                <time dateTime={essay.publishedAt}>
                  {formatDate(essay.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{essay.readingTimeMinutes} min read</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {essay.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--bg-track)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--ink-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] leading-[1.25] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                {essay.title}
              </h2>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-secondary)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--ink-primary)]"
                aria-hidden="true"
              />
            </div>

            <p className="mt-2 text-sm font-medium text-[var(--ink-primary)]">
              {essay.subtitle}
            </p>
            <p className="mt-2 text-sm leading-[1.65] text-[var(--ink-secondary)]">
              {essay.excerpt}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
