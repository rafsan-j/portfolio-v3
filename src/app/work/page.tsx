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
    <div className="w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Sticky Left Header Rail */}
        <header className="lg:col-span-4 lg:border-r border-[var(--border-neutral)] py-12 lg:py-16 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-20 lg:self-start space-y-5">
            <h1 className="editorial-display text-[var(--ink-primary)]">
              Work
            </h1>
            <p className="text-[15px] leading-[1.68] text-[var(--ink-secondary)]">
              Case studies spanning native Android finance and hostel accounting
              engines, civic flood-dispatch optimization, programmatic video
              pipelines, and procedural WebGL graphics.
            </p>
            <div className="pt-4 border-t border-[var(--border-neutral)] flex items-center justify-between font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
              <span>Selected index</span>
              <span>
                {FLAGSHIP_PROJECTS.length} flagships, {SUPPORTING_PROJECTS.length} supporting
              </span>
            </div>
          </div>
        </header>

        {/* Right 8-Column Editorial Archive */}
        <section
          aria-label="Flagship projects"
          className="lg:col-span-8 py-10 lg:py-16 lg:pl-10"
        >
          <WorkGrid
            projects={FLAGSHIP_PROJECTS}
            supportingProjects={SUPPORTING_PROJECTS}
          />
        </section>
      </div>
    </div>
  );
}
