import type { Metadata } from 'next';
import { FLAGSHIP_PROJECTS, SUPPORTING_PROJECTS } from '@/content/projects';
import { WorkGrid } from '@/components/WorkGrid';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected engineering case studies across offline-first native Android apps, applied AI optimization systems, programmatic video pipelines, and procedural Three.js graphics.',
};

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
          Selected Engineering
        </p>
        <h1 className="mt-2 text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          Work
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-[var(--ink-secondary)]">
          Case studies spanning native Android finance and hostel accounting
          engines, civic flood-dispatch optimization, programmatic video
          pipelines, and procedural WebGL graphics.
        </p>
      </header>

      <section aria-label="Flagship projects" className="mt-10">
        <WorkGrid projects={FLAGSHIP_PROJECTS} />
      </section>

      {SUPPORTING_PROJECTS.length > 0 && (
        <section
          aria-labelledby="supporting-work-heading"
          className="mt-16 pt-10 border-t border-[var(--border-neutral)]"
        >
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
            Additional Engineering
          </p>
          <h2
            id="supporting-work-heading"
            className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--ink-primary)]"
          >
            Supporting Work
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {SUPPORTING_PROJECTS.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold tracking-[-0.015em] text-[var(--ink-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">
                      {item.tagline}
                    </p>
                    <p className="mt-2 text-sm leading-[1.6] text-[var(--ink-secondary)]">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:max-w-xs sm:justify-end">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-[var(--bg-track)] px-2 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
