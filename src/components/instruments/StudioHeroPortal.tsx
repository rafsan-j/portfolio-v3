'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Monitor, Play } from 'lucide-react';

function CornerReticle({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 flex h-3.5 w-3.5 items-center justify-center font-mono text-[11px] leading-none text-[var(--ink-secondary)] opacity-60 select-none ${className}`}
    >
      +
    </span>
  );
}

export function StudioHeroPortal() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [mobileLaunched, setMobileLaunched] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const syncViewport = () => setIsDesktop(mq.matches);
    syncViewport();

    mq.addEventListener('change', syncViewport);
    return () => mq.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldMountIframe = (isDesktop === true && isInView) || mobileLaunched;

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[460px] lg:h-full overflow-hidden rounded-2xl border border-[var(--border-neutral)] bg-[#0B0E11]"
    >
      {/* Architectural Corner Reticles */}
      <CornerReticle className="top-2.5 left-2.5" />
      <CornerReticle className="top-2.5 right-2.5" />
      <CornerReticle className="bottom-2.5 left-2.5" />
      <CornerReticle className="bottom-2.5 right-2.5" />

      {/* Quiet Top-Left Live Caption */}
      <div className="pointer-events-none absolute top-5 left-5 z-20 inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-translucent)] px-3 py-1.5 backdrop-blur-md">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
        />
        <span className="font-mono text-[11px] tracking-[0.01em] text-[var(--ink-primary)]">
          Sylhet Desk — Interactive WebGL
        </span>
      </div>

      {/* Desktop Lazy-Mounted 3D Studio Iframe (or Mobile Opt-in) */}
      {shouldMountIframe ? (
        <>
          <iframe
            src="/studio-scene.html"
            title="Living Sylhet 3D Studio Preview"
            allow="autoplay"
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full min-h-[460px] border-0 block"
          />

          {/* Instant Obsidian Loading Veil */}
          <div
            aria-hidden={iframeLoaded}
            className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B0E11] transition-opacity duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
              iframeLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <div className="h-7 w-7 rounded-full border border-[#232934] border-t-[var(--accent)] animate-spin" />
              <p className="font-mono text-xs text-[#8A94A6] tabular-nums">
                Initializing Sylhet viewport
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Static Interactive-Launch Fallback on Compact (< 768px) Viewports or Initial Hydration */
        <div className="relative flex min-h-[460px] h-full w-full flex-col items-center justify-center bg-[#0B0E11] px-6 py-16 text-center">
          {/* Subtle Architectural Grid Lines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, #232934 1px, transparent 1px), linear-gradient(to bottom, #232934 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 flex max-w-xs flex-col items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#232934] bg-[#151921] text-[var(--accent)]">
              <Monitor className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[#EAECEF]">
                Interactive 3D Sylhet Desk
              </p>
              <p className="text-xs leading-relaxed text-[#8A94A6]">
                WebGL preview stays paused on compact screens to keep scrolling
                instant.
              </p>
            </div>

            {isDesktop === false && (
              <button
                type="button"
                onClick={() => setMobileLaunched(true)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#232934] bg-[#151921] px-4 py-2 font-mono text-xs text-[#EAECEF] transition-[transform,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:border-[#333C4D] active:scale-[0.97]"
              >
                <Play
                  className="h-3.5 w-3.5 text-[var(--accent)]"
                  aria-hidden="true"
                />
                <span>Launch Live Preview</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clean Bottom-Right "Open Full Studio" Link */}
      <Link
        href="/studio"
        className="absolute bottom-5 right-5 z-20 inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface-translucent)] px-3.5 py-2 font-mono text-xs text-[var(--ink-primary)] backdrop-blur-md transition-[transform,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:border-[var(--border-hover)] active:scale-[0.97]"
      >
        <span>Open Full Studio</span>
        <ArrowUpRight
          className="h-3.5 w-3.5 text-[var(--accent)]"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

export default StudioHeroPortal;
