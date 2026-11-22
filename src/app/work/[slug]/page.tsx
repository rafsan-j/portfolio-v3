import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { FLAGSHIP_PROJECTS, getProjectBySlug } from '@/content/projects';
import { ProjectVisualHeader } from '@/components/ProjectVisualHeader';

export const dynamicParams = false;

export function generateStaticParams() {
  return FLAGSHIP_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: 'Project Not Found' };
  }
  return {
    title: project.title,
    description: project.summary,
  };
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active Development',
  shipped: 'Shipped',
  hackathon: 'Hackathon Build',
};

export default function ProjectCaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    notFound();
  }

  const currentIndex = FLAGSHIP_PROJECTS.findIndex(
    (p) => p.slug === project.slug
  );
  const prevProject =
    currentIndex > 0 ? FLAGSHIP_PROJECTS[currentIndex - 1] : null;
  const nextProject =
    currentIndex < FLAGSHIP_PROJECTS.length - 1
      ? FLAGSHIP_PROJECTS[currentIndex + 1]
      : null;

  return (
    <article className="mx-auto max-w-5xl px-5 sm:px-8 pt-10 sm:pt-14 pb-16">
      <Link
        href="/work"
        className="inline-flex min-h-[44px] items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Work</span>
      </Link>

      {/* Case Study Header */}
      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
          <span>{project.index}</span>
          <span aria-hidden="true">·</span>
          <span className="uppercase">{project.category}</span>
          {project.subtitle && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.subtitle}</span>
            </>
          )}
        </div>

        <h1 className="mt-3 text-3xl sm:text-[2.75rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          {project.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base sm:text-lg leading-[1.6] text-[var(--ink-secondary)]">
          {project.tagline}
        </p>

        {/* 4-Column Metadata Rail */}
        <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:grid-cols-4 sm:gap-6">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Role
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-[var(--ink-primary)]">
              {project.role}
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Year
            </dt>
            <dd className="mt-1.5 font-mono text-sm font-medium text-[var(--ink-primary)] tabular-nums">
              {project.year}
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Status
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-[var(--ink-primary)]">
              {STATUS_LABELS[project.status] ?? project.status}
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              {project.links.live || project.links.github ? 'Links' : 'Primary Stack'}
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-[var(--ink-primary)]">
              {project.links.live ? (
                <Link
                  href={project.links.live}
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <span>Open Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : project.links.github ? (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <span>Repository</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span>{project.stack.slice(0, 2).join(', ')}</span>
              )}
            </dd>
          </div>
        </dl>

        {(project.context || (project.team && project.team.length > 0)) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-secondary)]">
            {project.context && (
              <span className="font-mono">{project.context}</span>
            )}
            {project.team && project.team.length > 0 && (
              <span>Team: {project.team.join(', ')}</span>
            )}
          </div>
        )}
      </header>

      {/* Full-Width Visual Preview */}
      <div className="mt-8">
        <ProjectVisualHeader slug={project.slug} />
      </div>

      {/* Architectural Specs Strip */}
      {project.specs.length > 0 && (
        <section aria-label="Technical specifications" className="mt-8">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {project.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-4 py-3.5"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-secondary)]">
                  {spec.label}
                </dt>
                <dd className="mt-1 font-mono text-xs sm:text-[13px] font-medium text-[var(--ink-primary)] tabular-nums">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Case Study Prose */}
      <div className="prose-obsidian mt-12">
        <h2>Problem</h2>
        <p>{project.problem}</p>

        <h2>Architecture</h2>
        <p>{project.architecture}</p>

        <h2>Engineering &amp; Craft Highlights</h2>
        <ul>
          {project.craftHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <h2>Technology Stack</h2>
        <div className="not-prose mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink-primary)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Prev / Next Navigation */}
      <nav
        aria-label="Project navigation"
        className="mt-16 grid grid-cols-1 gap-4 border-t border-[var(--border-neutral)] pt-8 sm:grid-cols-2"
      >
        <div>
          {prevProject && (
            <Link
              href={`/work/${prevProject.slug}`}
              className="group flex flex-col rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 transition-colors duration-150 hover:border-[var(--border-hover)]"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)]">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Previous · {prevProject.index}</span>
              </span>
              <span className="mt-2 text-base font-semibold text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                {prevProject.title}
              </span>
            </Link>
          )}
        </div>

        <div>
          {nextProject && (
            <Link
              href={`/work/${nextProject.slug}`}
              className="group flex flex-col items-end rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 text-right transition-colors duration-150 hover:border-[var(--border-hover)]"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--ink-secondary)]">
                <span>Next · {nextProject.index}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-2 text-base font-semibold text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                {nextProject.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
