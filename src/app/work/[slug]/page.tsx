import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { FLAGSHIP_PROJECTS, getProjectBySlug } from '@/content/projects';
import { ProjectVisualHeader } from '@/components/ProjectVisualHeader';
import { OttoBudgetInstrument } from '@/components/instruments/OttoBudgetInstrument';
import { MessManagerInstrument } from '@/components/instruments/MessManagerInstrument';
import { UjaanInstrument } from '@/components/instruments/UjaanInstrument';
import { VellumInstrument } from '@/components/instruments/VellumInstrument';
import { StudioHeroPortal } from '@/components/instruments/StudioHeroPortal';

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

const PROJECT_PLATES: Record<
  string,
  { src: string; alt: string; caption: string }
> = {
  ottobudget: {
    src: '/media/plate-ottobudget.jpg',
    alt: 'OttoBudget offline-first native Android finance engine plate',
    caption: 'Plate 01 — OttoBudget · Offline-first Android Finance Engine',
  },
  ujaan: {
    src: '/media/plate-ujaan.jpg',
    alt: 'Ujaan Haor Basin flood-risk combine-harvester dispatch plate',
    caption: 'Plate 02 — Ujaan · Haor Basin Flood Dispatch Optimization',
  },
  'mess-manager': {
    src: '/media/plate-mess-manager.jpg',
    alt: 'Mess Manager integer-paisa hostel accounting plate',
    caption: 'Plate 03 — Mess Manager · Integer-Paisa Hostel Accounting',
  },
  vellum: {
    src: '/media/plate-vellum.jpg',
    alt: 'Vellum programmatic Remotion lyric cinema plate',
    caption: 'Plate 04 — Vellum · Programmatic Remotion Cinema Pipeline',
  },
  'living-sylhet-studio': {
    src: '/media/hero-sylhet-studio.jpg',
    alt: 'Living Sylhet 3D Studio rainy desk nocturnal plate',
    caption: 'Plate 05 — Living Sylhet 3D Studio · Procedural Three.js Workspace',
  },
};

function renderProjectInstrument(slug: string) {
  switch (slug) {
    case 'ottobudget':
      return <OttoBudgetInstrument />;
    case 'mess-manager':
      return <MessManagerInstrument />;
    case 'ujaan':
      return <UjaanInstrument />;
    case 'vellum':
      return <VellumInstrument />;
    case 'living-sylhet-studio':
      return (
        <div className="min-h-[520px] lg:min-h-[600px] border border-[var(--border-neutral)] flex flex-col">
          <StudioHeroPortal />
        </div>
      );
    default:
      return <ProjectVisualHeader slug={slug} />;
  }
}

export default function ProjectCaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    notFound();
  }

  const plate = PROJECT_PLATES[project.slug];

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
    <article className="pt-16 w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      {/* Asymmetric Case Study Header */}
      <header className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]">
        <div className="lg:col-span-7 lg:border-r border-[var(--border-neutral)] py-10 lg:py-16 lg:pr-10 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/work"
              className="tactile-press inline-flex min-h-[44px] items-center gap-2 font-mono text-xs text-[var(--ink-secondary)] hover-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Work</span>
            </Link>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)] tnum">
              Case Study {project.index}
            </span>
          </div>

          <h1 className="editorial-display text-[var(--ink-primary)]">
            {project.title}
          </h1>

          <p className="max-w-[56ch] text-base lg:text-lg leading-[1.66] text-[var(--ink-secondary)]">
            {project.tagline}
          </p>

          {(project.context || (project.team && project.team.length > 0)) && (
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-[var(--ink-secondary)]">
              {project.context && <span>{project.context}</span>}
              {project.team && project.team.length > 0 && (
                <span>Team: {project.team.join(', ')}</span>
              )}
            </div>
          )}
        </div>

        <dl className="lg:col-span-5 grid grid-cols-2 border-t lg:border-t-0 border-[var(--border-neutral)]">
          <div className="p-6 lg:p-8 border-r border-b border-[var(--border-neutral)] flex flex-col justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
              Role
            </dt>
            <dd className="mt-3 text-sm font-medium text-[var(--ink-primary)]">
              {project.role}
            </dd>
          </div>

          <div className="p-6 lg:p-8 border-b border-[var(--border-neutral)] flex flex-col justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
              Year
            </dt>
            <dd className="mt-3 font-mono text-sm font-medium text-[var(--ink-primary)] tnum">
              {project.year}
            </dd>
          </div>

          <div className="p-6 lg:p-8 border-r border-[var(--border-neutral)] flex flex-col justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
              Status
            </dt>
            <dd className="mt-3 text-sm font-medium text-[var(--ink-primary)]">
              {STATUS_LABELS[project.status] ?? project.status}
            </dd>
          </div>

          <div className="p-6 lg:p-8 flex flex-col justify-between">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
              {project.links.live || project.links.github
                ? 'Access'
                : 'Primary Stack'}
            </dt>
            <dd className="mt-3 text-sm font-medium text-[var(--ink-primary)]">
              {project.links.live ? (
                <Link
                  href={project.links.live}
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
                >
                  <span>Open Live Studio</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : project.links.github ? (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
                >
                  <span>View Repository</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span>{project.stack.slice(0, 2).join(', ')}</span>
              )}
            </dd>
          </div>
        </dl>
      </header>

      {/* Monograph Hero Plate */}
      {plate && (
        <figure className="py-10 lg:py-14 border-b border-[var(--border-neutral)]">
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] overflow-hidden border border-[var(--border-neutral)] bg-[#111312]">
            <Image
              src={plate.src}
              alt={plate.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1560px"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--ink-secondary)]">
            <span>{plate.caption}</span>
            {project.subtitle && (
              <span className="italic font-serif text-sm text-[var(--ink-primary)]">
                {project.subtitle}
              </span>
            )}
          </figcaption>
        </figure>
      )}

      {/* Full-Width Interactive Instrument Stage */}
      <section
        aria-label={`${project.title} interactive preview`}
        className="py-10 lg:py-14 border-b border-[var(--border-neutral)]"
      >
        {renderProjectInstrument(project.slug)}
      </section>

      {/* Asymmetric Case Study Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[var(--border-neutral)]">
        {/* Sticky Left Technical Specifications & Stack Rail */}
        <aside className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-16 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-10">
            {project.specs.length > 0 && (
              <section
                aria-label="Technical specifications"
                className="space-y-4"
              >
                <h2 className="font-serif font-normal text-[30px] leading-[1.08] text-[var(--ink-primary)]">
                  Specifications
                </h2>
                <dl className="divide-y divide-[var(--border-neutral)] border-t border-b border-[var(--border-neutral)]">
                  {project.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="py-3.5 flex items-baseline justify-between gap-4"
                    >
                      <dt className="font-mono text-xs text-[var(--ink-secondary)]">
                        {spec.label}
                      </dt>
                      <dd className="font-mono text-xs text-right text-[var(--ink-primary)] tnum">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section aria-label="Technology stack" className="space-y-4">
              <h2 className="font-serif font-normal text-[30px] leading-[1.08] text-[var(--ink-primary)]">
                Technology Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-3 py-1 font-mono text-xs text-[var(--ink-primary)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Right 8-Column Case Study Prose */}
        <div className="lg:col-span-8 py-12 lg:py-16 lg:pl-12">
          <div className="prose-obsidian">
            <h2 className="!mt-0">Problem</h2>
            <p>{project.problem}</p>

            <h2>Architecture</h2>
            <p>{project.architecture}</p>

            <h2>Engineering &amp; Craft Highlights</h2>
            <ul>
              {project.craftHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prev / Next Navigation */}
      <nav
        aria-label="Project navigation"
        className="grid grid-cols-1 sm:grid-cols-2"
      >
        <div className="sm:border-r border-[var(--border-neutral)]">
          {prevProject && (
            <Link
              href={`/work/${prevProject.slug}`}
              className="group flex flex-col py-10 sm:pr-8 hover-surface transition-colors duration-[var(--dur-fast)] ease-obsidian"
            >
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                Previous case study
              </span>
              <span className="mt-2 font-serif font-normal text-[30px] lg:text-[36px] leading-[1.06] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                {prevProject.title}
              </span>
            </Link>
          )}
        </div>

        <div>
          {nextProject && (
            <Link
              href={`/work/${nextProject.slug}`}
              className="group flex flex-col sm:items-end py-10 sm:pl-8 sm:text-right border-t sm:border-t-0 border-[var(--border-neutral)] hover-surface transition-colors duration-[var(--dur-fast)] ease-obsidian"
            >
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                Next case study
              </span>
              <span className="mt-2 font-serif font-normal text-[30px] lg:text-[36px] leading-[1.06] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-obsidian">
                {nextProject.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
