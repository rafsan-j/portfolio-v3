import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ESSAYS, getEssayBySlug } from '@/content/writing';
import type { EssayBlock } from '@/content/types';
import { formatDate } from '@/lib/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return ESSAYS.map((essay) => ({
    slug: essay.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const essay = getEssayBySlug(params.slug);
  if (!essay) {
    return { title: 'Essay Not Found' };
  }
  return {
    title: essay.title,
    description: essay.excerpt,
  };
}

function renderEssayBlock(block: EssayBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return <h2 key={index}>{String(block.content)}</h2>;

    case 'paragraph':
      return <p key={index}>{String(block.content)}</p>;

    case 'quote':
      return (
        <blockquote key={index}>
          <p>{String(block.content)}</p>
        </blockquote>
      );

    case 'list': {
      const items = Array.isArray(block.content)
        ? block.content
        : [block.content];
      return (
        <ul key={index}>
          {items.map((item, itemIdx) => (
            <li key={itemIdx}>{item}</li>
          ))}
        </ul>
      );
    }

    case 'code':
      return (
        <div key={index} className="not-prose my-7">
          {block.language && (
            <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-[var(--border-neutral)] bg-[var(--bg-track)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-secondary)]">
              <span>{block.language}</span>
            </div>
          )}
          <pre
            className={`overflow-x-auto border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-4 sm:p-5 font-mono text-[13px] leading-[1.65] text-[var(--ink-primary)] ${
              block.language ? 'rounded-b-xl' : 'rounded-xl'
            }`}
          >
            <code>{String(block.content)}</code>
          </pre>
        </div>
      );
  }
}

export default function EssayReaderPage({
  params,
}: {
  params: { slug: string };
}) {
  const essay = getEssayBySlug(params.slug);
  if (!essay) {
    notFound();
  }

  const currentIndex = ESSAYS.findIndex((e) => e.slug === essay.slug);
  const prevEssay = currentIndex > 0 ? ESSAYS[currentIndex - 1] : null;
  const nextEssay =
    currentIndex < ESSAYS.length - 1 ? ESSAYS[currentIndex + 1] : null;

  return (
    <article className="mx-auto max-w-5xl px-5 sm:px-8 pt-10 sm:pt-14 pb-16">
      <Link
        href="/writing"
        className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Writing</span>
      </Link>

      <header className="mt-4 max-w-[68ch] border-b border-[var(--border-neutral)] pb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
          <time dateTime={essay.publishedAt}>
            {formatDate(essay.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{essay.readingTimeMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <div className="flex flex-wrap gap-1.5">
            {essay.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[var(--bg-track)] px-2 py-0.5 text-[11px] uppercase tracking-[0.04em] text-[var(--ink-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <h1 className="mt-4 text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.025em] leading-[1.14] text-[var(--ink-primary)]">
          {essay.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-[1.6] text-[var(--ink-secondary)]">
          {essay.subtitle}
        </p>
      </header>

      <div className="prose-obsidian mt-10">
        {essay.blocks.map((block, index) => renderEssayBlock(block, index))}
      </div>

      <nav
        aria-label="Essay navigation"
        className="mt-16 grid max-w-[68ch] grid-cols-1 gap-4 border-t border-[var(--border-neutral)] pt-8 sm:grid-cols-2"
      >
        <div>
          {prevEssay && (
            <Link
              href={`/writing/${prevEssay.slug}`}
              className="group flex flex-col rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 transition-colors duration-150 hover:border-[var(--border-hover)]"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)]">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Previous</span>
              </span>
              <span className="mt-2 text-sm font-semibold text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                {prevEssay.title}
              </span>
            </Link>
          )}
        </div>

        <div>
          {nextEssay && (
            <Link
              href={`/writing/${nextEssay.slug}`}
              className="group flex flex-col items-end rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 text-right transition-colors duration-150 hover:border-[var(--border-hover)]"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)]">
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-2 text-sm font-semibold text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                {nextEssay.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
