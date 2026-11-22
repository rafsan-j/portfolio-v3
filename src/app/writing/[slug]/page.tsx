import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
            <div className="flex items-center justify-between rounded-t-md border border-b-0 border-[var(--border-neutral)] bg-[var(--bg-track)] px-4 py-2 font-mono text-[11px] text-[var(--ink-secondary)]">
              <span>{block.language}</span>
            </div>
          )}
          <pre
            className={`overflow-x-auto border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-4 sm:p-5 font-mono text-[13px] leading-[1.65] text-[var(--ink-primary)] ${
              block.language ? 'rounded-b-md' : 'rounded-md'
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
    <article className="w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]">
        {/* Sticky Left Metadata Rail */}
        <aside className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-10 lg:py-16 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
            <Link
              href="/writing"
              className="inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-[var(--ink-secondary)] hover-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Writing</span>
            </Link>

            <dl className="divide-y divide-[var(--border-neutral)] border-t border-b border-[var(--border-neutral)] font-mono text-xs">
              <div className="py-3.5 flex items-center justify-between gap-4">
                <dt className="text-[var(--ink-secondary)]">Published</dt>
                <dd className="text-[var(--ink-primary)] tabular-nums">
                  <time dateTime={essay.publishedAt}>
                    {formatDate(essay.publishedAt)}
                  </time>
                </dd>
              </div>
              <div className="py-3.5 flex items-center justify-between gap-4">
                <dt className="text-[var(--ink-secondary)]">Reading time</dt>
                <dd className="text-[var(--ink-primary)] tabular-nums">
                  {essay.readingTimeMinutes} min
                </dd>
              </div>
              <div className="py-3.5 flex items-center justify-between gap-4">
                <dt className="text-[var(--ink-secondary)]">Topics</dt>
                <dd className="text-[var(--ink-primary)]">
                  {essay.tags.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Right 8-Column Essay Reading Surface */}
        <div className="lg:col-span-8 py-10 lg:py-16 lg:pl-12">
          <header className="max-w-[68ch] pb-10 border-b border-[var(--border-neutral)]">
            <h1 className="font-serif font-normal text-[40px] lg:text-[56px] leading-[1.0] tracking-[-0.02em] text-[var(--ink-primary)]">
              {essay.title}
            </h1>
            <p className="mt-5 text-base lg:text-lg leading-[1.6] text-[var(--ink-secondary)]">
              {essay.subtitle}
            </p>
          </header>

          <div className="prose-obsidian mt-10">
            {essay.blocks.map((block, index) => renderEssayBlock(block, index))}
          </div>
        </div>
      </div>

      {/* Prev / Next Navigation */}
      <nav
        aria-label="Essay navigation"
        className="grid grid-cols-1 sm:grid-cols-2"
      >
        <div className="sm:border-r border-[var(--border-neutral)]">
          {prevEssay && (
            <Link
              href={`/writing/${prevEssay.slug}`}
              className="group flex flex-col py-10 sm:pr-8 hover-surface transition-colors duration-[var(--dur-fast)] ease-obsidian"
            >
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                Previous essay
              </span>
              <span className="mt-2 font-serif font-normal text-[26px] lg:text-[30px] leading-[1.1] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                {prevEssay.title}
              </span>
            </Link>
          )}
        </div>

        <div>
          {nextEssay && (
            <Link
              href={`/writing/${nextEssay.slug}`}
              className="group flex flex-col sm:items-end py-10 sm:pl-8 sm:text-right border-t sm:border-t-0 border-[var(--border-neutral)] hover-surface transition-colors duration-[var(--dur-fast)] ease-obsidian"
            >
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                Next essay
              </span>
              <span className="mt-2 font-serif font-normal text-[26px] lg:text-[30px] leading-[1.1] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                {nextEssay.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
