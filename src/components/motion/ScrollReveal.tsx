'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* ClipReveal — Progressive masked clip-path: inset(...) typography reveal    */
/* -------------------------------------------------------------------------- */

export interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  as?: 'div' | 'span' | 'section' | 'header' | 'figure';
  threshold?: number;
}

const HIDDEN_CLIP: Record<NonNullable<ClipRevealProps['direction']>, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};

const HIDDEN_OFFSET: Record<
  NonNullable<ClipRevealProps['direction']>,
  string
> = {
  up: 'translate3d(0, 14px, 0)',
  down: 'translate3d(0, -14px, 0)',
  left: 'translate3d(14px, 0, 0)',
  right: 'translate3d(-14px, 0, 0)',
};

export function ClipReveal({
  children,
  className,
  delay = 0,
  duration = 720,
  direction = 'up',
  as = 'div',
  threshold = 0.12,
}: ClipRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Start visible on SSR so headlines never vanish without JS or during hydration;
  // arm the clip-reveal only for elements genuinely below the initial viewport.
  const [phase, setPhase] = useState<'visible' | 'armed' | 'revealed'>(
    'visible'
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('revealed');
      return;
    }

    const rect = el.getBoundingClientRect();
    // If already in view or above the fold, leave visible immediately
    if (rect.top < window.innerHeight * 0.94) {
      setPhase('revealed');
      return;
    }

    setPhase('armed');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase('revealed');
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: '0px 0px -4% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const isHidden = phase === 'armed';

  const style: CSSProperties =
    phase === 'visible'
      ? {}
      : {
          clipPath: isHidden ? HIDDEN_CLIP[direction] : 'inset(0% 0% 0% 0%)',
          transform: isHidden ? HIDDEN_OFFSET[direction] : 'translate3d(0, 0, 0)',
          opacity: isHidden ? 0.001 : 1,
          transitionProperty: 'clip-path, transform, opacity',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: isHidden ? 'clip-path, transform, opacity' : 'auto',
        };

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      data-clip-reveal={phase}
      style={style}
      className={cn(as === 'span' ? 'inline-block' : 'block', className)}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* ParallaxFrame — Viewport-gated subtle parallax depth on artwork plates     */
/* -------------------------------------------------------------------------- */

export interface ParallaxFrameProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Maximum vertical parallax travel in pixels (default 28) */
  distance?: number;
  /** Slight overscan scale to hide edge travel (default 1.07) */
  scale?: number;
}

export function ParallaxFrame({
  children,
  className,
  innerClassName,
  distance = 28,
  scale = 1.07,
}: ParallaxFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      inner.style.transform = 'translate3d(0, 0, 0) scale(1)';
      return;
    }

    let inView = false;
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      if (!inView) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height * 0.5;
      const norm = Math.max(-1, Math.min(1, (vh * 0.5 - center) / (vh * 0.65)));
      const offsetY = norm * distance;
      inner.style.transform = `translate3d(0, ${offsetY.toFixed(
        2
      )}px, 0) scale(${scale})`;
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
          if (inView) {
            scheduleUpdate();
          }
        }
      },
      { rootMargin: '120px 0px 120px 0px' }
    );

    observer.observe(container);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    inView = true;
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [distance, scale]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        ref={innerRef}
        className={cn('h-full w-full will-change-transform', innerClassName)}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ChapterRail — Minimal right-edge vertical progress rail (GPU scaleY)       */
/* -------------------------------------------------------------------------- */

export interface ChapterRailItem {
  id: string;
  index: string;
  label: string;
}

export interface ChapterRailProps {
  chapters?: ChapterRailItem[];
  className?: string;
}

const DEFAULT_CHAPTERS: ChapterRailItem[] = [
  { id: 'hero-aperture', index: '00', label: 'Aperture' },
  { id: 'chapter-ujaan', index: '01', label: 'Ujaan' },
  { id: 'chapter-ottobudget', index: '02', label: 'OttoBudget' },
  { id: 'chapter-vellum', index: '03', label: 'Vellum' },
  { id: 'chapter-mess-manager', index: '04', label: 'Mess Manager' },
];

export function ChapterRail({
  chapters = DEFAULT_CHAPTERS,
  className,
}: ChapterRailProps) {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? '');

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      rafId = null;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;
      }

      const anchorY = window.innerHeight * 0.36;
      let currentActive = chapters[0]?.id ?? '';
      for (const ch of chapters) {
        const el = document.getElementById(ch.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorY) {
          currentActive = ch.id;
        }
      }
      setActiveId((prev) => (prev === currentActive ? prev : currentActive));
    };

    const schedule = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [chapters]);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <aside
      aria-label="Monograph chapter progress"
      className={cn(
        'pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 mix-blend-difference 2xl:flex',
        className
      )}
    >
      <div className="relative h-36 w-[1px] bg-[#EDE7DA]/25">
        <div
          ref={fillRef}
          className="h-full w-full origin-top bg-[#EDE7DA] will-change-transform"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>

      <nav className="pointer-events-auto flex flex-col items-end gap-2">
        {chapters.map((ch) => {
          const isActive = activeId === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => scrollToChapter(ch.id)}
              title={`${ch.index} · ${ch.label}`}
              aria-label={`Jump to ${ch.index} ${ch.label}`}
              aria-current={isActive ? 'location' : undefined}
              className="group flex items-center gap-2 py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EDE7DA]"
            >
              <span
                className={cn(
                  'font-mono text-[9px] tracking-[0.14em] tabular-nums transition-opacity duration-200',
                  isActive
                    ? 'text-[#EDE7DA] opacity-100'
                    : 'text-[#EDE7DA]/65 opacity-0 group-hover:opacity-100'
                )}
              >
                {ch.index}
              </span>
              <span
                className={cn(
                  'block h-1.5 w-1.5 rounded-full transition-transform duration-200',
                  isActive
                    ? 'scale-125 bg-[#EDE7DA]'
                    : 'scale-75 bg-[#EDE7DA]/40 group-hover:scale-100 group-hover:bg-[#EDE7DA]/80'
                )}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
