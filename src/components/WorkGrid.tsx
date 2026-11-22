'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project, SupportingProject } from '@/content/types';
import { ProjectVisualHeader } from '@/components/ProjectVisualHeader';

type FilterLabel = 'All' | 'Mobile' | 'AI & Automation' | 'Systems' | 'Web';

const FILTERS: FilterLabel[] = ['All', 'Mobile', 'AI & Automation', 'Systems', 'Web'];

function matchesCategory(category: string, filter: FilterLabel): boolean {
  if (filter === 'All') return true;
  const normalized = category.toLowerCase();
  switch (filter) {
    case 'Mobile':
      return normalized === 'android' || normalized === 'mobile';
    case 'AI & Automation':
      return normalized === 'ai-systems' || normalized === 'ai & automation';
    case 'Systems':
      return normalized === 'pipeline' || normalized === 'systems';
    case 'Web':
      return normalized === 'graphics' || normalized === 'web';
    default:
      return true;
  }
}

interface WorkGridProps {
  projects: Project[];
  supportingProjects?: SupportingProject[];
}

export function WorkGrid({ projects, supportingProjects = [] }: WorkGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All');

  const flagshipProjects = useMemo(
    () => projects.filter((project) => project.featured !== false),
    [projects]
  );

  const nonFeaturedFromMain = useMemo(
    () => projects.filter((project) => project.featured === false),
    [projects]
  );

  const filteredFlagships = useMemo(
    () => flagshipProjects.filter((project) => matchesCategory(project.category, activeFilter)),
    [flagshipProjects, activeFilter]
  );

  const supportingRows = useMemo(() => {
    const combined: Array<{
      slug: string;
      title: string;
      tagline: string;
      summary: string;
      stack: string[];
      category?: string;
      href?: string;
    }> = [
      ...nonFeaturedFromMain.map((p) => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        summary: p.summary,
        stack: p.stack,
        category: p.category,
        href: `/work/${p.slug}`,
      })),
      ...supportingProjects.map((sp) => ({
        slug: sp.slug,
        title: sp.title,
        tagline: sp.tagline,
        summary: sp.summary,
        stack: sp.stack,
        category: 'android',
      })),
    ];

    if (activeFilter === 'All') return combined;
    return combined.filter((item) => matchesCategory(item.category ?? 'android', activeFilter));
  }, [nonFeaturedFromMain, supportingProjects, activeFilter]);

  return (
    <div className="space-y-12">
      <div
        role="tablist"
        aria-label="Filter projects by discipline"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveFilter(filter)}
              className={`min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 rounded-full font-mono text-xs tracking-[0.02em] border transition-colors duration-[var(--dur-fast)] active:scale-[0.97] ${
                isSelected
                  ? 'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--border-interactive)]'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-neutral)] hover:border-[var(--border-hover)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {filteredFlagships.length === 0 ? (
        <p className="py-12 text-sm text-[var(--ink-secondary)]">
          No flagship case studies match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFlagships.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] hover:border-[var(--border-hover)] p-5 transition-colors duration-[var(--dur-base)]"
            >
              <div className="space-y-4">
                <ProjectVisualHeader slug={project.slug} compact />

                <div className="flex items-center justify-between gap-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                  <span>{project.index}</span>
                  <span>{project.year}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.015em] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)]">
                      {project.title}
                    </h2>
                    <ArrowUpRight
                      className="w-4 h-4 text-[var(--ink-secondary)] group-hover:text-[var(--accent)] shrink-0 mt-1 transition-colors duration-[var(--dur-fast)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {project.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-neutral)] flex flex-wrap gap-1.5">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-md bg-[var(--bg-track)] font-mono text-[11px] text-[var(--ink-secondary)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {supportingRows.length > 0 ? (
        <section aria-labelledby="supporting-work-heading" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[var(--border-neutral)] pb-3">
            <h2
              id="supporting-work-heading"
              className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]"
            >
              Supporting Work
            </h2>
            <span className="font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
              {supportingRows.length}
            </span>
          </div>

          <div className="divide-y divide-[var(--border-neutral)] border-b border-[var(--border-neutral)]">
            {supportingRows.map((item) => {
              const rowInner = (
                <div className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--ink-primary)] tracking-[-0.015em]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)] leading-relaxed max-w-2xl">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-[var(--bg-track)] font-mono text-[11px] text-[var(--ink-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className="block hover:bg-[var(--bg-surface)] transition-colors duration-[var(--dur-fast)] px-2 -mx-2 rounded-lg"
                  >
                    {rowInner}
                  </Link>
                );
              }

              return <div key={item.slug}>{rowInner}</div>;
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default WorkGrid;
