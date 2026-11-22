'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Lenis from 'lenis';
import type { VolumetricMorphStageProps } from '@/components/three/VolumetricMorphStage';

const VolumetricMorphStage = dynamic<VolumetricMorphStageProps>(
  () =>
    import('@/components/three/VolumetricMorphStage').then((mod) => {
      const m = mod as {
        VolumetricMorphStage?: React.ComponentType<VolumetricMorphStageProps>;
        default?: React.ComponentType<VolumetricMorphStageProps>;
      };
      return (m.VolumetricMorphStage ??
        m.default) as React.ComponentType<VolumetricMorphStageProps>;
    }),
  { ssr: false }
);

interface ActConfig {
  id: string;
  roman: string;
  label: string;
  ghostWord: string;
  atmoBackground: string;
}

const ACTS: ActConfig[] = [
  {
    id: 'hero',
    roman: 'I',
    label: 'Introduction',
    ghostWord: 'SYLHET',
    atmoBackground:
      'radial-gradient(54% 48% at 68% 46%, rgba(230, 196, 143, 0.16) 0%, rgba(217, 155, 82, 0.06) 44%, rgba(7, 10, 9, 0) 76%), radial-gradient(42% 38% at 18% 72%, rgba(217, 155, 82, 0.07) 0%, rgba(7, 10, 9, 0) 70%)',
  },
  {
    id: 'ujaan',
    roman: 'II',
    label: 'Ujaan',
    ghostWord: 'UJAAN',
    atmoBackground:
      'radial-gradient(54% 48% at 66% 48%, rgba(214, 142, 68, 0.17) 0%, rgba(164, 92, 38, 0.07) 46%, rgba(7, 10, 9, 0) 78%), radial-gradient(38% 36% at 22% 28%, rgba(214, 142, 68, 0.06) 0%, rgba(7, 10, 9, 0) 72%)',
  },
  {
    id: 'ottobudget',
    roman: 'III',
    label: 'OttoBudget',
    ghostWord: 'VAULT',
    atmoBackground:
      'radial-gradient(54% 48% at 66% 46%, rgba(68, 152, 122, 0.16) 0%, rgba(36, 94, 76, 0.07) 46%, rgba(7, 10, 9, 0) 78%), radial-gradient(40% 34% at 20% 70%, rgba(82, 166, 134, 0.05) 0%, rgba(7, 10, 9, 0) 70%)',
  },
  {
    id: 'vellum',
    roman: 'IV',
    label: 'Vellum',
    ghostWord: 'VELLUM',
    atmoBackground:
      'radial-gradient(54% 48% at 68% 48%, rgba(196, 118, 86, 0.16) 0%, rgba(139, 84, 62, 0.07) 46%, rgba(7, 10, 9, 0) 78%), radial-gradient(40% 36% at 18% 32%, rgba(217, 155, 82, 0.06) 0%, rgba(7, 10, 9, 0) 72%)',
  },
  {
    id: 'mess-manager',
    roman: 'V',
    label: 'Mess Manager',
    ghostWord: 'LEDGER',
    atmoBackground:
      'radial-gradient(54% 48% at 66% 46%, rgba(164, 184, 192, 0.14) 0%, rgba(217, 178, 122, 0.06) 46%, rgba(7, 10, 9, 0) 78%), radial-gradient(38% 34% at 22% 72%, rgba(164, 184, 192, 0.05) 0%, rgba(7, 10, 9, 0) 72%)',
  },
];

interface WorkSpread {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  plate: string;
  plateAlt: string;
  summary: string;
  metrics: string;
  imageFirst: boolean;
}

const WORK_SPREADS: WorkSpread[] = [
  {
    slug: 'ujaan',
    title: 'Ujaan',
    subtitle: 'Haor basin flood dispatch.',
    year: '2026',
    plate: '/media/plate-ujaan.jpg',
    plateAlt: 'Ujaan flood-risk combine-harvester dispatch interface and Haor Basin topography',
    summary:
      'Three-module civic optimization platform built for Sunamganj’s Boro harvest. Fuses Sentinel-1 SAR radar, FFWC river gauges, Open-Meteo forecasts, and 6-hour TTL field overrides into a Pydantic-gated Bangla/Banglish intake pipeline and an OR-Tools CP-SAT harvester scheduler.',
    metrics: '41,800 ha · 6h TTL · OR-Tools CP-SAT · Offline PWA',
    imageFirst: true,
  },
  {
    slug: 'ottobudget',
    title: 'OttoBudget',
    subtitle: 'Zero-knowledge personal finance.',
    year: 'Ongoing',
    plate: '/media/plate-ottobudget.jpg',
    plateAlt: 'OttoBudget native Android finance ledger and encrypted vault',
    summary:
      'Offline-first native Kotlin and Jetpack Compose ledger backed by Room SQLite. Captures bKash, Nagad, Rocket, and bank alerts through NotificationListenerService with zero SMS permissions, syncing a single AES-256-GCM encrypted vault.enc blob to Supabase Storage.',
    metrics: 'AES-256-GCM · Room SQLite · NotificationListener · ৳0 baseline',
    imageFirst: false,
  },
  {
    slug: 'vellum',
    title: 'Vellum',
    subtitle: 'Words, given voice.',
    year: '2026',
    plate: '/media/plate-vellum.jpg',
    plateAlt: 'Vellum procedural vocal-nasheed cinema frame from Qurrat al-Ayn',
    summary:
      'Independent vocal-nasheed cinema and contemporary lyric archive rendered declaratively in Remotion v3.0. Generates 9 style-locked 16:9 scenes and 3 vertical Shorts from one TypeScript codebase with gimbal camera breathing, 3-layer SVG Bezier ribbons, and libx264 CRF 18 mastering.',
    metrics: 'Remotion v3.0 · --gl=angle · CRF 18 · VLM-2026-001',
    imageFirst: true,
  },
  {
    slug: 'mess-manager',
    title: 'Mess Manager',
    subtitle: 'Zero-drift shared accounting.',
    year: 'Ongoing',
    plate: '/media/plate-mess-manager.jpg',
    plateAlt: 'Mess Manager period-scoped hostel meal and expense ledger',
    summary:
      'Period-scoped native Android hostel and shared-living ledger built in Kotlin and Jetpack Compose. Computes every BDT figure strictly in integer paisa across a 7-term balance formula, allocating indivisible meal-rate remainders via the Hamilton Largest-Remainder method.',
    metrics: '৳0.00 drift · 1 BDT = 100 paisa · Hamilton method · Kotlin',
    imageFirst: false,
  },
];

const NAV_LINKS = [
  { label: 'Work', href: '/work', hideOnXs: false },
  { label: 'About', href: '/about', hideOnXs: true },
  { label: 'Writing', href: '/writing', hideOnXs: true },
  { label: 'Studio', href: '/studio', hideOnXs: false },
  { label: 'Contact', href: '/contact', hideOnXs: false },
];

export function MonographExperience() {
  const stageSectionRef = useRef<HTMLElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const progressRef = useRef<number>(0);
  const lockedProgressRef = useRef<number | null>(null);
  const activeActRef = useRef<number>(0);

  const [activeAct, setActiveAct] = useState<number>(0);
  const [stillMode, setStillMode] = useState<boolean>(false);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      })
    );
  }, []);

  const scrollToSelectedWork = useCallback(() => {
    const target = document.getElementById('selected-work');
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  const scrollToAct = useCallback((actIndex: number) => {
    const section = stageSectionRef.current;
    if (!section) return;
    const clampedIndex = Math.max(0, Math.min(4, actIndex));
    const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight);
    const targetY = section.offsetTop + (clampedIndex / 4) * maxScroll;

    if (lockedProgressRef.current !== null) {
      const nextP = clampedIndex / 4;
      lockedProgressRef.current = nextP;
      progressRef.current = nextP;
      activeActRef.current = clampedIndex;
      setActiveAct(clampedIndex);
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleY(${Math.max(0.04, nextP)})`;
      }
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.1 });
    } else {
      window.scrollTo(0, targetY);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pParam = params.get('p');
    const stillParam = params.get('still');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isStill =
      stillParam === '' ||
      stillParam === '1' ||
      stillParam === 'true' ||
      reducedMotion;

    setStillMode(isStill);

    let lockedP: number | null = null;
    if (pParam !== null && pParam.trim() !== '') {
      const parsed = Number.parseFloat(pParam);
      if (!Number.isNaN(parsed)) {
        lockedP = Math.max(0, Math.min(1, parsed));
        lockedProgressRef.current = lockedP;
        progressRef.current = lockedP;
        const initialAct = Math.min(4, Math.max(0, Math.floor(lockedP * 4 + 0.5)));
        activeActRef.current = initialAct;
        setActiveAct(initialAct);
        if (railFillRef.current) {
          railFillRef.current.style.transform = `scaleY(${Math.max(0.04, lockedP)})`;
        }
      }
    }

    let lenis: Lenis | null = null;
    if (!isStill) {
      lenis = new Lenis({
        lerp: 0.075,
        smoothWheel: true,
      });
      lenisRef.current = lenis;
    }

    let rafId = 0;

    const tick = (time: number) => {
      if (lenis) {
        lenis.raf(time);
      }

      if (lockedProgressRef.current === null && stageSectionRef.current) {
        const rect = stageSectionRef.current.getBoundingClientRect();
        const scrollable = Math.max(1, stageSectionRef.current.offsetHeight - window.innerHeight);
        const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollable));

        if (isStill) {
          progressRef.current = rawProgress;
        } else {
          progressRef.current += (rawProgress - progressRef.current) * 0.14;
          if (Math.abs(rawProgress - progressRef.current) < 0.0004) {
            progressRef.current = rawProgress;
          }
        }

        const p = progressRef.current;
        if (railFillRef.current) {
          railFillRef.current.style.transform = `scaleY(${Math.max(0.04, p)})`;
        }

        const nextAct = Math.min(4, Math.max(0, Math.floor(p * 4 + 0.5)));
        if (nextAct !== activeActRef.current) {
          activeActRef.current = nextAct;
          setActiveAct(nextAct);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  const actPanelClass = (idx: number) =>
    [
      'col-start-1 row-start-1 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
      activeAct === idx
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : activeAct > idx
          ? 'opacity-0 -translate-y-6 pointer-events-none'
          : 'opacity-0 translate-y-6 pointer-events-none',
    ].join(' ');

  return (
    <div
      className={`relative min-h-screen bg-[#070A09] text-[#EDE7DA] selection:bg-[#D99B52]/25 selection:text-[#EDE7DA] ${stillMode ? 'still-mode' : ''}`}
    >
      <a
        href="#selected-work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-[#E6C48F] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#070A09]"
      >
        Skip to selected work
      </a>

      {/* Whisper-Quiet Floating Navigation */}
      <header className="fixed top-0 inset-x-0 z-30 pointer-events-none bg-gradient-to-b from-[#070A09]/85 via-[#070A09]/35 to-transparent">
        <nav
          aria-label="Primary"
          className="pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between px-[6vw] py-6"
        >
          <Link
            href="/"
            className="font-serif text-[1.25rem] tracking-[-0.01em] text-[#EDE7DA] transition-colors duration-300 hover:text-[#E6C48F]"
          >
            Rafsan Jani
          </Link>

          <div className="flex items-center gap-4 sm:gap-7">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${item.hideOnXs ? 'hidden sm:inline-block' : 'inline-block'} text-[13px] tracking-[0.02em] text-[#EDE7DA]/75 transition-colors duration-300 hover:text-[#EDE7DA]`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Open command palette"
              className="pl-1 font-mono text-[11px] tracking-[0.06em] text-[#EDE7DA]/60 transition-colors duration-300 hover:text-[#E6C48F]"
            >
              ⌘K
            </button>
          </div>
        </nav>
      </header>

      {/* Act I — Scroll-Driven 5-Act Volumetric Sculpture Stage */}
      <section
        ref={stageSectionRef}
        aria-label="Interactive 5-act volumetric portfolio stage"
        className="relative h-[460vh] bg-[#070A09]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* z-0: Atmospheric Base & Act-Reactive Radial Blooms */}
          <div className="atmo-layer z-0" aria-hidden="true" />
          {ACTS.map((act, idx) => (
            <div
              key={act.id}
              aria-hidden="true"
              className="atmo-layer z-0"
              style={{
                backgroundColor: 'transparent',
                backgroundImage: act.atmoBackground,
                opacity: activeAct === idx ? 1 : 0,
              }}
            />
          ))}

          {/* z-0: Occluded Ghost Wordmark Behind 3D Canvas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center overflow-hidden pb-[9vh] md:items-center md:justify-end md:pb-0 md:pr-[4vw]"
          >
            {ACTS.map((act, idx) => (
              <span
                key={act.id}
                className="ghost-wordmark absolute"
                style={{
                  opacity: activeAct === idx ? 0.045 : 0,
                  transform:
                    activeAct === idx
                      ? 'translate3d(0, 0, 0)'
                      : activeAct > idx
                        ? 'translate3d(0, -18px, 0)'
                        : 'translate3d(0, 18px, 0)',
                }}
              >
                {act.ghostWord}
              </span>
            ))}
          </div>

          {/* z-[1]: Three.js Volumetric Morph Sculpture */}
          <div className="absolute inset-0 z-[1]">
            <VolumetricMorphStage
              progressRef={progressRef}
              activeAct={activeAct}
              stillMode={stillMode}
            />
          </div>

          {/* z-[2]: Vignette & Subtle Film Grain */}
          <div className="stage-vignette z-[2]" aria-hidden="true" />
          <div className="stage-grain z-[2]" aria-hidden="true" />

          {/* z-[10]: Frameless Left-Aligned Editorial Typography */}
          <div className="pointer-events-none absolute inset-y-0 left-[6vw] z-[10] flex w-[calc(100vw-12vw-44px)] max-w-[540px] items-center">
            <div className="grid w-full">
              {/* Act 0: Hero */}
              <div className={actPanelClass(0)} aria-hidden={activeAct !== 0}>
                <h1 className="font-serif font-normal text-[clamp(3.2rem,5.6vw,5.6rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
                  Engineering quiet,
                  <br />
                  <em className="italic text-[#E6C48F]">enduring</em> software.
                </h1>
                <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.68] text-[#EDE7DA]/80 sm:text-[16px]">
                  Rafsan Jani — CSE at SUST, Sylhet. Offline-first native Android apps, applied AI systems, and procedural visual software.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-6">
                  <button
                    type="button"
                    onClick={scrollToSelectedWork}
                    tabIndex={activeAct === 0 ? 0 : -1}
                    className="tactile-press inline-flex items-center gap-2 rounded-full bg-[#E6C48F] px-6 py-3 text-[13.5px] font-medium tracking-[0.01em] text-[#070A09] transition-colors duration-300 hover:bg-[#F0D3A5]"
                  >
                    Explore work <span aria-hidden="true">↓</span>
                  </button>
                  <Link
                    href="/studio"
                    tabIndex={activeAct === 0 ? 0 : -1}
                    className="inline-flex items-center gap-1.5 border-b border-[#EDE7DA]/30 pb-1 text-[13.5px] tracking-[0.01em] text-[#EDE7DA]/85 transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                  >
                    Enter 3D Studio <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>

              {/* Act 1: Ujaan */}
              <div className={actPanelClass(1)} aria-hidden={activeAct !== 1}>
                <h2 className="font-serif font-normal text-[clamp(3rem,5.2vw,5.1rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
                  Ujaan
                </h2>
                <p className="mt-2 font-serif italic text-[clamp(1.35rem,2.1vw,1.85rem)] leading-[1.2] text-[#E6C48F]">
                  Haor basin flood dispatch.
                </p>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.68] text-[#EDE7DA]/80 sm:text-[16px]">
                  Sentinel-1 SAR imagery, FFWC river gauges, and OR-Tools CP-SAT harvester scheduling built for Sunamganj’s Boro harvest.
                </p>
                <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-[#EDE7DA]/60 tnum">
                  41,800 ha · 6h TTL · Offline PWA
                </p>
                <div className="mt-7">
                  <Link
                    href="/work/ujaan"
                    tabIndex={activeAct === 1 ? 0 : -1}
                    className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/35 pb-1 text-[14px] text-[#EDE7DA] transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                  >
                    Read case study <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Act 2: OttoBudget */}
              <div className={actPanelClass(2)} aria-hidden={activeAct !== 2}>
                <h2 className="font-serif font-normal text-[clamp(3rem,5.2vw,5.1rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
                  OttoBudget
                </h2>
                <p className="mt-2 font-serif italic text-[clamp(1.35rem,2.1vw,1.85rem)] leading-[1.2] text-[#E6C48F]">
                  Zero-knowledge personal finance.
                </p>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.68] text-[#EDE7DA]/80 sm:text-[16px]">
                  Offline-first Kotlin &amp; Jetpack Compose ledger with AES-256-GCM Supabase sync and local bKash/Nagad alert parsing.
                </p>
                <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-[#EDE7DA]/60 tnum">
                  AES-256-GCM · Room SQLite · ৳0 baseline
                </p>
                <div className="mt-7">
                  <Link
                    href="/work/ottobudget"
                    tabIndex={activeAct === 2 ? 0 : -1}
                    className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/35 pb-1 text-[14px] text-[#EDE7DA] transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                  >
                    Read case study <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Act 3: Vellum */}
              <div className={actPanelClass(3)} aria-hidden={activeAct !== 3}>
                <h2 className="font-serif font-normal text-[clamp(3rem,5.2vw,5.1rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
                  Vellum
                </h2>
                <p className="mt-2 font-serif italic text-[clamp(1.35rem,2.1vw,1.85rem)] leading-[1.2] text-[#E6C48F]">
                  Words, given voice.
                </p>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.68] text-[#EDE7DA]/80 sm:text-[16px]">
                  Independent vocal-nasheed cinema rendered procedurally in Remotion v3.0 — debut release Qurrat al-Ayn.
                </p>
                <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-[#EDE7DA]/60 tnum">
                  Remotion v3.0 · CRF 18 · VLM-2026-001
                </p>
                <div className="mt-7">
                  <Link
                    href="/work/vellum"
                    tabIndex={activeAct === 3 ? 0 : -1}
                    className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/35 pb-1 text-[14px] text-[#EDE7DA] transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                  >
                    Read case study <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* Act 4: Mess Manager */}
              <div className={actPanelClass(4)} aria-hidden={activeAct !== 4}>
                <h2 className="font-serif font-normal text-[clamp(3rem,5.2vw,5.1rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
                  Mess Manager
                </h2>
                <p className="mt-2 font-serif italic text-[clamp(1.35rem,2.1vw,1.85rem)] leading-[1.2] text-[#E6C48F]">
                  Zero-drift shared accounting.
                </p>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.68] text-[#EDE7DA]/80 sm:text-[16px]">
                  Native Android meal and expense ledger using integer-paisa Hamilton Largest-Remainder rounding across a 7-term formula.
                </p>
                <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-[#EDE7DA]/60 tnum">
                  ৳0.00 drift · Hamilton method · Kotlin
                </p>
                <div className="mt-7">
                  <Link
                    href="/work/mess-manager"
                    tabIndex={activeAct === 4 ? 0 : -1}
                    className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/35 pb-1 text-[14px] text-[#EDE7DA] transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                  >
                    Read case study <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Far-Right Whisper-Quiet Scroll Rail */}
          <nav
            aria-label="Stage acts"
            className="absolute right-[3vw] top-1/2 z-[12] flex -translate-y-1/2 items-center gap-3.5"
          >
            <div className="flex flex-col items-end gap-5">
              {ACTS.map((act, idx) => {
                const isCurrent = activeAct === idx;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => scrollToAct(idx)}
                    aria-label={`Jump to Act ${act.roman}: ${act.label}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    className="group flex items-center gap-2.5 py-0.5 text-right focus-visible:outline-offset-4"
                  >
                    <span
                      className={`font-serif text-[12px] tracking-[0.14em] transition-colors duration-300 ${
                        isCurrent
                          ? 'text-[#E6C48F]'
                          : 'text-[#EDE7DA]/35 group-hover:text-[#EDE7DA]/75'
                      }`}
                    >
                      {act.roman}
                    </span>
                    <span
                      className={`block h-[5px] w-[5px] rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'scale-125 bg-[#E6C48F]'
                          : 'bg-[#EDE7DA]/25 group-hover:bg-[#EDE7DA]/65'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div
              aria-hidden="true"
              className="relative h-44 w-px overflow-hidden bg-[#EDE7DA]/15"
            >
              <div
                ref={railFillRef}
                className="h-full w-full origin-top bg-[#E6C48F]"
                style={{ transform: 'scaleY(0.04)' }}
              />
            </div>
          </nav>
        </div>
      </section>

      {/* Act II — Asymmetric Editorial Selected Work Spreads */}
      <main
        id="selected-work"
        className="relative z-20 bg-[#080B0A] text-[#EDE7DA]"
      >
        <div className="mx-auto max-w-[1340px] px-[6vw] py-28 md:py-36">
          {/* Section Header */}
          <div className="flex flex-col items-start justify-between gap-6 pb-14 sm:flex-row sm:items-end">
            <h2 className="font-serif font-normal text-[clamp(2.8rem,5vw,4.75rem)] leading-[0.95] tracking-[-0.025em] text-[#EDE7DA]">
              Selected Work
            </h2>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/25 pb-1 text-[13.5px] tracking-[0.01em] text-[#EDE7DA]/75 transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
            >
              All projects <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* 4 Asymmetric Full-Bleed Magazine Spreads */}
          <div className="space-y-24 md:space-y-32">
            {WORK_SPREADS.map((spread) => (
              <article
                key={spread.slug}
                className="group border-t border-[#EDE7DA]/15 pt-12 md:pt-16"
              >
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
                  {/* Image Column (7 cols) */}
                  <Link
                    href={`/work/${spread.slug}`}
                    className={`block overflow-hidden bg-[#0E1210] lg:col-span-7 ${
                      spread.imageFirst ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={spread.plate}
                        alt={spread.plateAlt}
                        fill
                        sizes="(min-width: 1024px) 56vw, 88vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    </div>
                  </Link>

                  {/* Copy Column (5 cols) */}
                  <div
                    className={`flex flex-col justify-between lg:col-span-5 ${
                      spread.imageFirst ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif font-normal text-[clamp(2.2rem,3.4vw,3.25rem)] leading-[1.02] tracking-[-0.02em] text-[#EDE7DA]">
                          <Link
                            href={`/work/${spread.slug}`}
                            className="transition-colors duration-300 hover:text-[#E6C48F]"
                          >
                            {spread.title}
                          </Link>
                        </h3>
                        <span className="font-mono text-[12px] tracking-[0.06em] text-[#EDE7DA]/45 tnum">
                          {spread.year}
                        </span>
                      </div>

                      <p className="mt-2 font-serif italic text-[clamp(1.25rem,1.8vw,1.55rem)] leading-[1.25] text-[#E6C48F]/95">
                        {spread.subtitle}
                      </p>

                      <p className="mt-6 text-[15px] leading-[1.72] text-[#EDE7DA]/75">
                        {spread.summary}
                      </p>

                      <p className="mt-6 font-mono text-[12px] leading-[1.6] tracking-[0.04em] text-[#EDE7DA]/50 tnum">
                        {spread.metrics}
                      </p>
                    </div>

                    <div className="mt-9">
                      <Link
                        href={`/work/${spread.slug}`}
                        className="inline-flex items-center gap-2 border-b border-[#EDE7DA]/30 pb-1 text-[13.5px] tracking-[0.01em] text-[#EDE7DA] transition-colors duration-300 hover:border-[#E6C48F] hover:text-[#E6C48F]"
                      >
                        Explore case study <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Interactive 3D Studio Feature Spread */}
          <section
            aria-label="Sylhet 3D Studio"
            className="mt-28 border-t border-[#EDE7DA]/15 pt-14 md:mt-36 md:pt-20"
          >
            <Link
              href="/studio"
              className="group block overflow-hidden bg-[#0E1210]"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
                <Image
                  src="/media/hero-sylhet-studio.jpg"
                  alt="Rainy evening inside the procedural Three.js Sylhet 3D Studio desk"
                  fill
                  sizes="88vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="mt-10 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <h2 className="font-serif font-normal text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.0] tracking-[-0.02em] text-[#EDE7DA]">
                  Step inside the rainy{' '}
                  <em className="italic text-[#E6C48F]">Sylhet desk.</em>
                </h2>
                <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.72] text-[#EDE7DA]/75">
                  A procedural PBR Three.js workspace isolated to its own route: GLSL wet-glass rain, a 78-keycap instanced mechanical keyboard, a 64-district Bangladesh map, playable 60 FPS Beamline Breaker, and a dual-sided page-flip hardcover notebook.
                </p>
              </div>
              <div className="md:col-span-5 md:text-right">
                <Link
                  href="/studio"
                  className="tactile-press inline-flex items-center gap-2 rounded-full border border-[#E6C48F]/45 px-7 py-3.5 text-[13.5px] font-medium tracking-[0.01em] text-[#E6C48F] transition-colors duration-300 hover:border-[#E6C48F] hover:bg-[#E6C48F] hover:text-[#070A09]"
                >
                  Enter the Sylhet 3D Studio <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Practice & Background Strip */}
          <section
            aria-label="Practice and Background"
            className="mt-28 md:mt-36"
          >
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
              <div className="border-t border-[#EDE7DA]/15 pt-6">
                <h3 className="font-serif italic text-[1.45rem] font-normal text-[#E6C48F]">
                  Education
                </h3>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-[#EDE7DA]/80">
                  B.Sc. (Engg.) CSE, Shahjalal University of Science and Technology (SUST), Sylhet (Batch CSE-25).
                </p>
              </div>

              <div className="border-t border-[#EDE7DA]/15 pt-6">
                <h3 className="font-serif italic text-[1.45rem] font-normal text-[#E6C48F]">
                  Current Roles
                </h3>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-[#EDE7DA]/80">
                  AI &amp; Automation Executive at Waffle Up; STEM &amp; Programming Instructor at Tworon.
                </p>
              </div>

              <div className="border-t border-[#EDE7DA]/15 pt-6">
                <h3 className="font-serif italic text-[1.45rem] font-normal text-[#E6C48F]">
                  Foundation
                </h3>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-[#EDE7DA]/80">
                  Rajshahi Cadet College alumnus — College Prefect (297 cadets), 17th National Merit HSC (5.00/5.00), Talentpool Scholar 2025.
                </p>
              </div>
            </div>
          </section>

          {/* Monumental Closing Curtain & Quiet Footer */}
          <footer className="mt-32 border-t border-[#EDE7DA]/15 pt-20 pb-8 md:mt-40 md:pt-28">
            <h2 className="font-serif font-normal text-[clamp(3rem,6.6vw,6.4rem)] leading-[0.96] tracking-[-0.025em] text-[#EDE7DA]">
              Let&apos;s build something{' '}
              <em className="italic text-[#E6C48F]">that lasts.</em>
            </h2>

            <div className="mt-14 flex flex-col justify-between gap-8 border-t border-[#EDE7DA]/10 pt-8 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px]">
                <a
                  href="mailto:rafsan2972jani@gmail.com"
                  className="text-[#EDE7DA] transition-colors duration-300 hover:text-[#E6C48F]"
                >
                  rafsan2972jani@gmail.com
                </a>
                <a
                  href="https://github.com/rafsan-j"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#EDE7DA]/70 transition-colors duration-300 hover:text-[#EDE7DA]"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/rafsan-jani72"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#EDE7DA]/70 transition-colors duration-300 hover:text-[#EDE7DA]"
                >
                  LinkedIn
                </a>
                <Link
                  href="/contact"
                  className="text-[#EDE7DA]/70 transition-colors duration-300 hover:text-[#EDE7DA]"
                >
                  Contact
                </Link>
              </div>

              <p className="font-mono text-[12px] tracking-[0.04em] text-[#EDE7DA]/45 tnum">
                © 2026 Rafsan Jani · Sylhet, Bangladesh
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default MonographExperience;
