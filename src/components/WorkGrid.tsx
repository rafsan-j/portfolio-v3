'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
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
    <div>
      {/* Discipline Filter Rail */}
      <div
        role="tablist"
        aria-label="Filter projects by discipline"
        className="flex flex-wrap items-center gap-2 pb-8 border-b border-[var(--border-neutral)]"
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
              className={`min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 rounded-md font-mono text-xs border transition-colors duration-[var(--dur-fast)] ease-obsidian active:scale-[0.97] ${
                isSelected
                  ? 'bg-[var(--accent-tint)] text-[var(--accent)] border-[var(--border-interactive)]'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-neutral)] hover-border hover-ink'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Flagship Grid */}
      {filteredFlagships.length === 0 ? (
        <p className="py-12 text-sm text-[var(--ink-secondary)]">
          No flagship case studies match this filter.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-neutral)]">
          {filteredFlagships.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 py-9 hover-surface xl:px-6 xl:-mx-6 transition-colors duration-[var(--dur-fast)] ease-obsidian"
            >
              <div className="xl:col-span-5">
                <ProjectVisualHeader slug={project.slug} compact />
              </div>

              <div className="xl:col-span-7 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                    <span>{project.role}</span>
                    <span>{project.year}</span>
                  </div>

                  <h2 className="font-serif font-normal text-[34px] lg:text-[40px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                    {project.title}
                  </h2>

                  <p className="text-sm lg:text-[15px] leading-[1.65] text-[var(--ink-secondary)]">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-neutral)]">
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[var(--ink-primary)] underline decoration-[var(--border-interactive)] underline-offset-4 group-hover:decoration-[var(--accent)]">
                    Read case study
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Supporting Work Ledger */}
      {supportingRows.length > 0 && (
        <section
          aria-labelledby="supporting-work-heading"
          className="pt-12 mt-4 border-t border-[var(--border-neutral)]"
        >
          <div className="flex items-baseline justify-between pb-4 border-b border-[var(--border-neutral)]">
            <h2
              id="supporting-work-heading"
              className="font-serif font-normal text-[28px] leading-[1.1] text-[var(--ink-primary)]"
            >
              Supporting Work
            </h2>
            <span className="font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
              {supportingRows.length}
            </span>
          </div>

          <div className="divide-y divide-[var(--border-neutral)]">
            {supportingRows.map((item) => {
              const rowInner = (
                <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                  <div className="md:col-span-8 space-y-1">
                    <h3 className="text-base font-medium text-[var(--ink-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)] leading-[1.6]">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap md:justify-end gap-1.5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]"
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
                    className="block hover-surface xl:px-6 xl:-mx-6"
                  >
                    {rowInner}
                  </Link>
                );
              }

              return <div key={item.slug}>{rowInner}</div>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default WorkGrid;
