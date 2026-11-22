'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import {
  MonsoonAtmosphere,
  type AtmosphereMood,
} from '@/components/motion/MonsoonAtmosphere';
import { cn } from '@/lib/utils';

function formatSylhetTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function HeroStudioAperture() {
  const [mood, setMood] = useState<AtmosphereMood>('tungsten');
  const [sylhetTime, setSylhetTime] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgLayerRef = useRef<HTMLDivElement | null>(null);

  // Client-mounted live Sylhet clock (Asia/Dhaka, UTC+6)
  useEffect(() => {
    const updateClock = () => setSylhetTime(formatSylhetTime(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Subtle GPU pointer parallax on background plate (max 14px)
  useEffect(() => {
    const section = sectionRef.current;
    const bgLayer = bgLayerRef.current;
    if (!section || !bgLayer) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

    if (reducedMotion || !finePointer) {
      bgLayer.style.transform = 'translate3d(0, 0, 0) scale(1.03)';
      return;
    }

    const MAX_SHIFT = 14;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, -nx * MAX_SHIFT));
      targetY = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, -ny * MAX_SHIFT));
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      bgLayer.style.transform = `translate3d(${currentX.toFixed(
        2
      )}px, ${currentY.toFixed(2)}px, 0) scale(1.045)`;
      rafId = window.requestAnimationFrame(tick);
    };

    section.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    section.addEventListener('pointerleave', handlePointerLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const isDawn = mood === 'dawn';

  const toggleMood = () => {
    setMood((prev) => (prev === 'tungsten' ? 'dawn' : 'tungsten'));
  };

  return (
    <section
      id="hero-aperture"
      ref={sectionRef}
      aria-label="The Sylhet Monograph Hero Aperture"
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#0E100F] text-[#EDE7DA]"
    >
      {/* Byte-0 full-bleed photographic plate with subtle pointer parallax */}
      <div
        ref={bgLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-18px] will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0) scale(1.045)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/hero-sylhet-studio.jpg"
          alt=""
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          className={cn(
            'h-full w-full object-cover object-center transition-[filter] duration-1000 ease-out',
            isDawn
              ? 'brightness-[0.86] contrast-[0.98] hue-rotate-[18deg] saturate-[0.76]'
              : 'brightness-[0.78] contrast-[1.06] saturate-[1.04]'
          )}
        />
      </div>

      {/* Circular light-shift mood filter (warm brass tungsten vs. cool misty Sylhet dawn) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[clip-path,opacity] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          background:
            'radial-gradient(circle at 74% 34%, rgba(164, 198, 212, 0.24) 0%, rgba(74, 108, 122, 0.16) 42%, rgba(14, 22, 26, 0.42) 100%)',
          clipPath: isDawn
            ? 'circle(150% at 74% 34%)'
            : 'circle(0% at 74% 34%)',
          opacity: isDawn ? 1 : 0,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background:
            'radial-gradient(circle at 68% 42%, rgba(217, 154, 78, 0.16) 0%, rgba(138, 86, 36, 0.08) 40%, rgba(14, 16, 15, 0) 75%)',
          opacity: isDawn ? 0 : 1,
        }}
      />

      {/* MonsoonAtmosphere: slanted rain streaks, 24fps film grain, pointer depth pool */}
      <MonsoonAtmosphere mood={mood} intensity={isDawn ? 0.85 : 1} />

      {/* Warm chiaroscuro top & bottom scrim for AAA typographic legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(14, 16, 15, 0.72) 0%, rgba(14, 16, 15, 0.18) 28%, rgba(14, 16, 15, 0.24) 56%, rgba(14, 16, 15, 0.90) 92%, rgba(14, 16, 15, 0.98) 100%)',
        }}
      />

      {/* Quiet top telemetry row (below header clearance pt-20) */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 pt-20 sm:px-10 lg:px-14">
        <p className="font-mono text-[11px] tracking-[0.14em] text-[#EDE7DA]/80 uppercase">
          24.8949° N, 91.8687° E — Sylhet, Bangladesh
        </p>

        <div className="flex items-center gap-5">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#EDE7DA]/80 tabular-nums">
            {sylhetTime ? `${sylhetTime} BST` : '--:--:-- BST'}
          </span>
        </div>
      </header>

      {/* Middle editorial aperture: Desk Lamp Switch + Statement + CTA */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-6 pb-8 pt-16 sm:px-10 lg:px-14">
        <div className="mb-10 flex flex-col items-start justify-between gap-8 border-b border-[#EDE7DA]/16 pb-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C9A46C]">
              The Sylhet Monograph · Vol. IV
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#EDE7DA]/88 sm:text-lg">
              Offline-first Android ledgers, civic flood-dispatch solvers, and
              procedural visual software — engineered from a rainy desk in
              Sylhet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            {/* Signature Interactive Moment — The Desk Lamp Switch */}
            <button
              type="button"
              onClick={toggleMood}
              aria-pressed={isDawn}
              aria-label={`Switch studio lighting. Currently ${
                isDawn ? 'Sylhet Dawn' : 'Tungsten Midnight'
              }`}
              className="group inline-flex items-center gap-3 rounded-full border border-[#EDE7DA]/24 bg-[#0E100F]/65 px-4 py-2.5 text-left backdrop-blur-md transition-colors duration-200 hover:border-[#EDE7DA]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A46C]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative flex h-3 w-3 items-center justify-center rounded-full border transition-colors duration-500',
                  isDawn
                    ? 'border-[#A7C4CE] bg-[#A7C4CE]/85'
                    : 'border-[#D9A75A] bg-[#D9A75A]'
                )}
              >
                <span
                  className={cn(
                    'h-1 w-1 rounded-full transition-colors duration-500',
                    isDawn ? 'bg-[#0E100F]' : 'bg-[#FFF5E1]'
                  )}
                />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#EDE7DA]/90">
                {isDawn ? 'Sylhet Dawn' : 'Tungsten Midnight'}
              </span>
            </button>

            {/* Primary CTA */}
            <Link
              href="/studio"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#EDE7DA] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#0E100F] transition-colors duration-200 hover:bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A46C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E100F]"
            >
              <span>Enter 3D Studio</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Monumental edge-to-edge bottom display nameplate */}
        <div className="flex flex-col gap-5">
          <h1
            className="w-full select-none font-serif font-normal uppercase text-[#EDE7DA]"
            style={{
              fontSize: 'clamp(4.2rem, 12.2vw, 12.2rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.03em',
            }}
          >
            RAFSAN JANI
          </h1>

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#EDE7DA]/60">
              Software Engineer · SUST CSE
            </span>
            <a
              href="#chapter-ujaan"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#EDE7DA]/75 transition-colors duration-200 hover:text-[#EDE7DA]"
            >
              <span>Scroll to read the monograph</span>
              <ArrowDown
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
