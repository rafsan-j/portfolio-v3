import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Box, Mail } from 'lucide-react';
import { PROFILE } from '@/content/profile';
import { FLAGSHIP_PROJECTS } from '@/content/projects';
import { ESSAYS } from '@/content/writing';
import { formatDate } from '@/lib/utils';
import { ProjectVisualHeader } from '@/components/ProjectVisualHeader';
import { CopyEmailButton } from '@/components/CopyEmailButton';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.04em] text-[var(--ink-secondary)]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
          <span>{PROFILE.home.eyebrow}</span>
        </p>

        <h1 className="mt-4 text-3xl sm:text-[2.75rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          {PROFILE.home.headline}
        </h1>

        <p className="mt-5 text-base sm:text-[1.0625rem] leading-[1.68] text-[var(--ink-secondary)]">
          {PROFILE.home.bio}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/work"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
          >
            <span>Explore Work</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/studio"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:border-[var(--border-hover)]"
          >
            <Box
              className="h-4 w-4 text-[var(--ink-secondary)]"
              aria-hidden="true"
            />
            <span>Enter 3D Studio</span>
          </Link>

          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
          >
            <span>Get in touch</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Selected Work */}
      <section aria-labelledby="selected-work-heading" className="mt-20 sm:mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Selected Work
            </p>
            <h2
              id="selected-work-heading"
              className="mt-1.5 text-2xl sm:text-[1.875rem] font-semibold tracking-[-0.025em] leading-[1.22] text-[var(--ink-primary)]"
            >
              Flagship Systems &amp; Products
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
          >
            <span>All work</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {FLAGSHIP_PROJECTS.map((project, idx) => {
            const isOddLast =
              FLAGSHIP_PROJECTS.length % 2 === 1 &&
              idx === FLAGSHIP_PROJECTS.length - 1;
            return (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className={`group flex flex-col justify-between rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6 transition-colors duration-150 hover:border-[var(--border-hover)] ${
                  isOddLast ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <ProjectVisualHeader slug={project.slug} compact />

                  <div className="mt-5 flex items-center justify-between gap-3 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                    <span>{project.index}</span>
                    <span>{project.year}</span>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.015em] leading-[1.35] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                      {project.title}
                    </h3>
                    <ArrowUpRight
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-secondary)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--ink-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-2 text-sm leading-[1.6] text-[var(--ink-secondary)]">
                    {project.tagline}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.stack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-[var(--bg-track)] px-2 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Living Sylhet 3D Studio Invitation */}
      <section
        aria-labelledby="studio-invite-heading"
        className="mt-20 sm:mt-24"
      >
        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6 sm:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
                Interactive 3D Workspace · Isolated on /studio
              </p>
              <h2
                id="studio-invite-heading"
                className="mt-2 text-2xl sm:text-[1.75rem] font-semibold tracking-[-0.025em] leading-[1.22] text-[var(--ink-primary)]"
              >
                {PROFILE.home.studioCallout.headline}
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-[1.65] text-[var(--ink-secondary)]">
                {PROFILE.home.studioCallout.body}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/studio"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
                >
                  <Box className="h-4 w-4" aria-hidden="true" />
                  <span>{PROFILE.home.studioCallout.ctaLabel}</span>
                </Link>
                <span className="font-mono text-xs text-[var(--ink-secondary)]">
                  {PROFILE.home.studioCallout.caption}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ProjectVisualHeader slug="living-sylhet-studio" compact />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Writing */}
      <section
        aria-labelledby="latest-writing-heading"
        className="mt-20 sm:mt-24"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Latest Writing
            </p>
            <h2
              id="latest-writing-heading"
              className="mt-1.5 text-2xl sm:text-[1.875rem] font-semibold tracking-[-0.025em] leading-[1.22] text-[var(--ink-primary)]"
            >
              Engineering Notes
            </h2>
          </div>
          <Link
            href="/writing"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:text-[var(--ink-primary)]"
          >
            <span>All essays</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[var(--border-neutral)] rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)]">
          {ESSAYS.map((essay) => (
            <Link
              key={essay.slug}
              href={`/writing/${essay.slug}`}
              className="group flex flex-col gap-2 p-5 sm:p-6 transition-colors duration-150 hover:bg-[var(--bg-track)] first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
                <time dateTime={essay.publishedAt}>
                  {formatDate(essay.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{essay.readingTimeMinutes} min read</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base sm:text-lg font-semibold tracking-[-0.015em] leading-[1.35] text-[var(--ink-primary)] group-hover:text-[var(--accent)] transition-colors duration-150">
                  {essay.title}
                </h3>
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)]"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm leading-[1.6] text-[var(--ink-secondary)]">
                {essay.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Direct Contact Band */}
      <section aria-labelledby="contact-band-heading" className="mt-20 sm:mt-24">
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Direct Contact
            </p>
            <h2
              id="contact-band-heading"
              className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--ink-primary)]"
            >
              Have an engineering project or technical question?
            </h2>
            <p className="mt-2 text-sm leading-[1.6] text-[var(--ink-secondary)]">
              {PROFILE.contact.availability}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <CopyEmailButton />
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Contact Page</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
