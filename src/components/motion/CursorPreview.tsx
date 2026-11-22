'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CursorPreviewItem {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt?: string;
  indexLabel?: string;
  subtitle?: string;
  year?: string;
}

interface CursorPreviewContextValue {
  activeItem: CursorPreviewItem | null;
  isFinePointer: boolean;
  showPreview: (item: CursorPreviewItem) => void;
  hidePreview: (id?: string) => void;
}

const CursorPreviewContext = createContext<CursorPreviewContextValue | null>(
  null
);

export function useCursorPreview(): CursorPreviewContextValue {
  const ctx = useContext(CursorPreviewContext);
  if (!ctx) {
    return {
      activeItem: null,
      isFinePointer: false,
      showPreview: () => {},
      hidePreview: () => {},
    };
  }
  return ctx;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 216;
const CURSOR_OFFSET_X = 28;
const CURSOR_OFFSET_Y = -108;

export function CursorPreviewProvider({ children }: { children: ReactNode }) {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [activeItem, setActiveItem] = useState<CursorPreviewItem | null>(null);
  const [previousItem, setPreviousItem] = useState<CursorPreviewItem | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const floatingRef = useRef<HTMLDivElement | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  const springRef = useRef({
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tilt: 0,
    initialized: false,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateMatch = () => setIsFinePointer(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, []);

  const showPreview = useCallback(
    (item: CursorPreviewItem) => {
      if (!isFinePointer) return;
      if (activeIdRef.current === item.id) return;

      setActiveItem((current) => {
        if (current && current.id !== item.id) {
          setPreviousItem(current);
          setIsTransitioning(true);
          if (fadeTimeoutRef.current !== null) {
            window.clearTimeout(fadeTimeoutRef.current);
          }
          fadeTimeoutRef.current = window.setTimeout(() => {
            setIsTransitioning(false);
            setPreviousItem(null);
          }, 260);
        }
        return item;
      });
      activeIdRef.current = item.id;
    },
    [isFinePointer]
  );

  const hidePreview = useCallback((id?: string) => {
    if (id && activeIdRef.current !== id) return;
    activeIdRef.current = null;
    setActiveItem(null);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let rafId: number | null = null;
    let lastTime = performance.now();

    const clampPosition = (clientX: number, clientY: number) => {
      const pad = 20;
      const maxX = Math.max(pad, window.innerWidth - PREVIEW_WIDTH - pad);
      const maxY = Math.max(pad, window.innerHeight - PREVIEW_HEIGHT - pad);
      const preferredX =
        clientX + CURSOR_OFFSET_X + PREVIEW_WIDTH > window.innerWidth - pad
          ? clientX - PREVIEW_WIDTH - 24
          : clientX + CURSOR_OFFSET_X;
      const preferredY = clientY + CURSOR_OFFSET_Y;
      return {
        x: Math.min(maxX, Math.max(pad, preferredX)),
        y: Math.min(maxY, Math.max(pad, preferredY)),
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { x, y } = clampPosition(event.clientX, event.clientY);
      const s = springRef.current;
      s.targetX = x;
      s.targetY = y;
      if (!s.initialized) {
        s.x = x;
        s.y = y;
        s.initialized = true;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const s = springRef.current;
      const el = floatingRef.current;

      if (el && s.initialized) {
        if (reducedMotion) {
          s.x = s.targetX;
          s.y = s.targetY;
          s.tilt = 0;
        } else {
          // Critically damped spring interpolation
          const stiffness = 190;
          const damping = 24;
          const ax = (s.targetX - s.x) * stiffness - s.vx * damping;
          const ay = (s.targetY - s.y) * stiffness - s.vy * damping;
          s.vx += ax * dt;
          s.vy += ay * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;

          const targetTilt = Math.max(-5.5, Math.min(5.5, s.vx * 0.0055));
          s.tilt += (targetTilt - s.tilt) * Math.min(1, dt * 14);
        }

        el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(
          1
        )}px, 0) rotate(${s.tilt.toFixed(2)}deg)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [isFinePointer]);

  const value = useMemo<CursorPreviewContextValue>(
    () => ({
      activeItem,
      isFinePointer,
      showPreview,
      hidePreview,
    }),
    [activeItem, isFinePointer, showPreview, hidePreview]
  );

  const visible = isFinePointer && activeItem !== null;

  return (
    <CursorPreviewContext.Provider value={value}>
      {children}

      {isFinePointer && (
        <div
          ref={floatingRef}
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed left-0 top-0 z-50 w-[320px] select-none will-change-transform transition-opacity duration-200 ease-out',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="overflow-hidden border border-[#EDE7DA]/20 bg-[#0E100F] shadow-[0_24px_56px_rgba(0,0,0,0.55)]">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141716]">
              {previousItem && isTransitioning && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`prev-${previousItem.id}`}
                  src={previousItem.imageSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-0 blur-[2px] transition-all duration-200 ease-out"
                />
              )}

              {activeItem && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`curr-${activeItem.id}`}
                  src={activeItem.imageSrc}
                  alt={activeItem.imageAlt ?? activeItem.title}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out',
                    isTransitioning
                      ? 'scale-[1.03] opacity-90 blur-[2px]'
                      : 'scale-100 opacity-100 blur-0'
                  )}
                />
              )}
            </div>

            {activeItem && (
              <div className="flex items-center justify-between gap-3 border-t border-[#EDE7DA]/12 bg-[#0E100F]/95 px-3.5 py-2.5 text-[#EDE7DA]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {activeItem.indexLabel && (
                      <span className="font-mono text-[10px] tracking-[0.14em] text-[#C9A46C] tabular-nums">
                        {activeItem.indexLabel}
                      </span>
                    )}
                    <span className="truncate font-serif text-base leading-none tracking-[-0.01em]">
                      {activeItem.title}
                    </span>
                  </div>
                  {activeItem.subtitle && (
                    <p className="mt-1 truncate text-[11px] text-[#EDE7DA]/65">
                      {activeItem.subtitle}
                    </p>
                  )}
                </div>
                {activeItem.year && (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#EDE7DA]/55 tabular-nums">
                    {activeItem.year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </CursorPreviewContext.Provider>
  );
}

export interface EditorialIndexRowProps {
  item: CursorPreviewItem;
  href?: string;
  meta?: string;
  roleLabel?: string;
  tone?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
}

export function EditorialIndexRow({
  item,
  href,
  meta,
  roleLabel,
  tone = 'dark',
  className,
  onClick,
}: EditorialIndexRowProps) {
  const { showPreview, hidePreview } = useCursorPreview();

  const isLight = tone === 'light';

  const rowClasses = cn(
    'group relative flex w-full items-baseline justify-between gap-6 border-b py-6 text-left transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-1',
    isLight
      ? 'border-[#141615]/15 text-[#141615] hover:border-[#141615]/45 focus-visible:ring-[#141615]/50'
      : 'border-[#EDE7DA]/14 text-[#EDE7DA] hover:border-[#EDE7DA]/40 focus-visible:ring-[#C9A46C]',
    className
  );

  const innerContent = (
    <>
      <div className="flex min-w-0 flex-1 items-baseline gap-5 sm:gap-8">
        {item.indexLabel && (
          <span
            className={cn(
              'w-8 shrink-0 font-mono text-xs tracking-[0.14em] tabular-nums transition-colors duration-200',
              isLight
                ? 'text-[#141615]/50 group-hover:text-[#141615]'
                : 'text-[#EDE7DA]/45 group-hover:text-[#C9A46C]'
            )}
          >
            {item.indexLabel}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-serif text-2xl leading-tight tracking-[-0.015em] transition-transform duration-200 ease-out group-hover:translate-x-1 sm:text-3xl">
              {item.title}
            </span>
            {item.subtitle && (
              <span
                className={cn(
                  'text-sm',
                  isLight ? 'text-[#141615]/60' : 'text-[#EDE7DA]/60'
                )}
              >
                {item.subtitle}
              </span>
            )}
          </div>
          {meta && (
            <p
              className={cn(
                'mt-1.5 max-w-2xl text-sm leading-relaxed',
                isLight ? 'text-[#141615]/65' : 'text-[#EDE7DA]/60'
              )}
            >
              {meta}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        {roleLabel && (
          <span
            className={cn(
              'hidden font-mono text-[11px] uppercase tracking-[0.12em] md:inline-block',
              isLight ? 'text-[#141615]/55' : 'text-[#EDE7DA]/50'
            )}
          >
            {roleLabel}
          </span>
        )}
        {item.year && (
          <span
            className={cn(
              'font-mono text-xs tracking-[0.1em] tabular-nums',
              isLight ? 'text-[#141615]/55' : 'text-[#EDE7DA]/55'
            )}
          >
            {item.year}
          </span>
        )}
        <ArrowUpRight
          aria-hidden="true"
          className={cn(
            'h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
            isLight
              ? 'text-[#141615]/45 group-hover:text-[#141615]'
              : 'text-[#EDE7DA]/45 group-hover:text-[#C9A46C]'
          )}
        />
      </div>
    </>
  );

  const handlers = {
    onPointerEnter: () => showPreview(item),
    onPointerLeave: () => hidePreview(item.id),
    onFocus: () => showPreview(item),
    onBlur: () => hidePreview(item.id),
  };

  if (href) {
    return (
      <Link href={href} className={rowClasses} {...handlers} onClick={onClick}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={rowClasses}
      {...handlers}
      onClick={onClick}
    >
      {innerContent}
    </button>
  );
}
