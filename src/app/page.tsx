import React from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { PROFILE } from '@/content/profile';
import { SUPPORTING_PROJECTS, getProjectBySlug } from '@/content/projects';
import { getPublishedEssays } from '@/content/writing';
import { formatDate } from '@/lib/utils';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { HeroStudioAperture } from '@/components/chapters/HeroStudioAperture';
import { FlagshipChapters } from '@/components/chapters/FlagshipChapters';
import { EditorialIndexRow } from '@/components/motion/CursorPreview';
import {
  ChapterRail,
  ClipReveal,
  type ChapterRailItem,
} from '@/components/motion/ScrollReveal';

const MONOGRAPH_CHAPTERS: ChapterRailItem[] = [
  { id: 'hero', index: '01', label: 'Studio' },
  { id: 'thesis', index: '02', label: 'Thesis' },
  { id: 'work', index: '03', label: 'Chapters' },
  { id: 'index', index: '04', label: 'Ledger' },
  { id: 'contact', index: '05', label: 'Contact' },
];

const CHAPTER_ANCHORS = [
  {
    index: '01',
    title: 'Ujaan',
    scope: 'Haor Flood Dispatch',
    href: '#chapter-ujaan',
  },
  {
    index: '02',
    title: 'OttoBudget',
    scope: 'Offline-First Android',
    href: '#chapter-ottobudget',
  },
  {
    index: '03',
    title: 'Vellum',
    scope: 'Remotion Cinema',
    href: '#chapter-vellum',
  },
  {
    index: '04',
    title: 'Mess Manager',
    scope: 'Integer-Paisa Ledger',
    href: '#chapter-mess-manager',
  },
] as const;

const ESSAY_PREVIEW_PLATES: Record<string, string> = {
  'why-we-avoided-sms-permissions-in-ottobudget': '/media/plate-ottobudget.jpg',
  'hamilton-largest-remainder-in-integer-paisa':
    '/media/plate-mess-manager.jpg',
  'isolating-threejs-from-editorial-routes': '/media/hero-sylhet-studio.jpg',
};

export default function HomePage() {
  const studioProject = getProjectBySlug('living-sylhet-studio');
  const kairyn = SUPPORTING_PROJECTS.find((p) => p.slug === 'kairyn');
  const essays = getPublishedEssays();

  return (
    <div className="relative">
      <ChapterRail chapters={MONOGRAPH_CHAPTERS} />

      {/* Section 1: Full-Bleed Nocturnal Sylhet Studio Hero */}
      <div id="hero">
        <HeroStudioAperture />
      </div>

      {/* Section 2: Archival Vellum Monograph Intro Sheet */}
      <section
        id="thesis"
        aria-labelledby="thesis-heading"
        className="bg-[#EDE7DA] text-[#141615] py-24 lg:py-36 border-b border-[#141615]/12"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#141615]/15 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5C5952]">
            <span>02 · The Sylhet Monograph</span>
            <span className="tnum">24.8949° N, 91.8687° E · SUST CSE</span>
          </div>

          <div className="mt-12 lg:mt-16 max-w-5xl">
            <ClipReveal>
              <h2
                id="thesis-heading"
                className="font-serif font-light text-[42px] sm:text-[56px] lg:text-[74px] leading-[1.02] tracking-[-0.025em] text-[#141615]"
              >
                Engineering systems that endure{' '}
                <em className="italic font-normal text-[#8B5E46]">real-world</em>{' '}
                pressure — built from a rainy desk in Sylhet.
              </h2>
            </ClipReveal>
          </div>

          <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-10 border-t border-[#141615]/15">
            <div className="lg:col-span-5 space-y-5 text-[15px] lg:text-base leading-[1.78] text-[#2F3230]">
              <p>
                I&apos;m a Computer Science and Engineering undergraduate at{' '}
                <strong className="font-medium text-[#141615]">
                  Shahjalal University of Science and Technology (SUST)
                </strong>
                , building native Android engines, civic optimization pipelines,
                and procedural visual software designed to hold up under patchy
                networks, strict rounding invariants, and small screens.
              </p>
              <p>
                Alongside coursework, I lead applied AI and workflow automation
                at <strong className="font-medium text-[#141615]">Waffle Up</strong>{' '}
                and teach STEM fundamentals and programming at{' '}
                <strong className="font-medium text-[#141615]">Tworon</strong>.
              </p>
            </div>

            <div className="lg:col-span-7 lg:pl-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#5C5952] mb-5">
                Selected Chapters · 01 — 04
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-[#141615]/15">
                {CHAPTER_ANCHORS.map((chapter) => (
                  <a
                    key={chapter.index}
                    href={chapter.href}
                    className="group flex items-baseline justify-between gap-4 py-5 sm:odd:pr-6 sm:even:pl-6 border-b border-[#141615]/15 transition-colors duration-[var(--dur-fast)] ease-obsidian hover:border-[#8B5E46]/50"
                  >
                    <div className="flex items-baseline gap-3.5 min-w-0">
                      <span className="font-mono text-xs text-[#8B5E46] tnum">
                        {chapter.index}
                      </span>
                      <div className="min-w-0">
                        <span className="block font-serif text-2xl leading-tight text-[#141615] group-hover:text-[#8B5E46] transition-colors duration-[var(--dur-fast)]">
                          {chapter.title}
                        </span>
                        <span className="block mt-0.5 font-mono text-[11px] text-[#5C5952]">
                          {chapter.scope}
                        </span>
                      </div>
                    </div>
                    <ArrowDownRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-[#5C5952] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-[#8B5E46]"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Alternating Chiaroscuro Flagship Chapters */}
      <div id="work">
        <FlagshipChapters />
      </div>

      {/* Section 4: Full-Width Archive & Engineering Writing Ledger */}
      <section
        id="index"
        aria-labelledby="ledger-heading"
        className="bg-[#111312] text-[#EDE7DA] py-24 lg:py-32 border-t border-white/10"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#EDE7DA]/14">
            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D99B52]">
                04 · Archive &amp; Engineering Writing
              </p>
              <ClipReveal>
                <h2
                  id="ledger-heading"
                  className="font-serif font-light text-[40px] sm:text-[52px] lg:text-[64px] leading-[0.98] tracking-[-0.02em] text-[#EDE7DA]"
                >
                  Index &amp; <em className="italic font-normal">Field Notes</em>
                </h2>
              </ClipReveal>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#9A9891]">
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 transition-colors duration-[var(--dur-fast)] hover:text-[#EDE7DA]"
              >
                <span>Complete work index</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/writing"
                className="inline-flex items-center gap-1.5 transition-colors duration-[var(--dur-fast)] hover:text-[#EDE7DA]"
              >
                <span>All essays</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="group/list">
            {studioProject && (
              <EditorialIndexRow
                href={`/work/${studioProject.slug}`}
                tone="dark"
                roleLabel="Procedural WebGL"
                meta={studioProject.tagline}
                className="transition-opacity duration-200 group-hover/list:opacity-45 hover:!opacity-100"
                item={{
                  id: studioProject.slug,
                  indexLabel: '05',
                  title: studioProject.title,
                  subtitle: 'Three.js · GLSL',
                  year: studioProject.year,
                  imageSrc: '/media/hero-sylhet-studio.jpg',
                  imageAlt: 'Living Sylhet 3D Studio rainy desk preview',
                }}
              />
            )}

            {kairyn && (
              <EditorialIndexRow
                href="/work"
                tone="dark"
                roleLabel="Android Utility"
                meta={kairyn.tagline}
                className="transition-opacity duration-200 group-hover/list:opacity-45 hover:!opacity-100"
                item={{
                  id: kairyn.slug,
                  indexLabel: '06',
                  title: kairyn.title,
                  subtitle: 'Jetpack Compose · Glance',
                  year: 'Android',
                  imageSrc: '/media/plate-mess-manager.jpg',
                  imageAlt: 'Kairyn offline-first study planner preview',
                }}
              />
            )}

            {essays.map((essay, idx) => (
              <EditorialIndexRow
                key={essay.slug}
                href={`/writing/${essay.slug}`}
                tone="dark"
                roleLabel={`Essay · ${essay.readingTimeMinutes} min`}
                meta={essay.excerpt}
                className="transition-opacity duration-200 group-hover/list:opacity-45 hover:!opacity-100"
                item={{
                  id: essay.slug,
                  indexLabel: `E${String(idx + 1).padStart(2, '0')}`,
                  title: essay.title,
                  year: formatDate(essay.publishedAt),
                  imageSrc:
                    ESSAY_PREVIEW_PLATES[essay.slug] ??
                    '/media/plate-ujaan.jpg',
                  imageAlt: essay.title,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Monumental Closing Curtain */}
      <section
        id="contact"
        aria-labelledby="closing-curtain-heading"
        className="bg-[#0E100F] text-[#EDE7DA] py-28 lg:py-40 relative overflow-hidden border-t border-white/10"
      >
        {/* Subtle Warm Tungsten Bottom Light Bloom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]"
          style={{
            background:
              'radial-gradient(62% 55% at 50% 100%, rgba(217, 155, 82, 0.2) 0%, rgba(217, 155, 82, 0.06) 44%, rgba(14, 16, 15, 0) 78%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D99B52]">
            05 · Correspondence
          </p>

          <div className="mt-6 max-w-5xl">
            <ClipReveal>
              <h2
                id="closing-curtain-heading"
                className="font-serif font-light text-[52px] sm:text-[72px] lg:text-[98px] leading-[0.94] tracking-[-0.025em] text-[#EDE7DA]"
              >
                Let&apos;s build something{' '}
                <em className="italic font-normal text-[#D99B52]">
                  worth keeping.
                </em>
              </h2>
            </ClipReveal>
          </div>

          <p className="mt-8 max-w-[54ch] text-base leading-[1.72] text-[#9A9891]">
            {PROFILE.contact.availability}
          </p>

          <div className="mt-12 pt-10 border-t border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A9891]">
                Direct Electronic Mail
              </span>
              <a
                href={PROFILE.links.email}
                className="inline-block font-serif text-[30px] sm:text-[42px] lg:text-[50px] leading-[1.08] tracking-[-0.015em] text-[#EDE7DA] underline decoration-white/25 underline-offset-[10px] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:text-[#D99B52] hover:decoration-[#D99B52] break-all"
              >
                {PROFILE.email}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <CopyEmailButton className="!rounded-full !border-white/15 !bg-[#151817]/90 !text-[#EDE7DA] hover:!border-[#D99B52]/60" />

              <Link
                href="/contact"
                className="tactile-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#EDE7DA] px-6 py-2.5 text-sm font-medium text-[#0E100F] transition-colors duration-[var(--dur-fast)] ease-obsidian hover:bg-[#D99B52]"
              >
                <span>Open contact page</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
