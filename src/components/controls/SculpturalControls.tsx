'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '@/lib/utils';

export interface TactileScrubberProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (nextValue: number) => void;
  /** Visual surface tone for dark charcoal or warm chalk paper */
  tone?: 'dark' | 'light';
  /** Formatted value display (e.g., "৳12,400") */
  formattedValue?: string;
  /** Accessible aria-valuetext override */
  valueText?: string;
  minLabel?: string;
  maxLabel?: string;
  /** Number of etched major graduation intervals (default 8) */
  majorIntervals?: number;
  className?: string;
}

function clampAndSnap(
  raw: number,
  min: number,
  max: number,
  step: number
): number {
  const clamped = Math.min(max, Math.max(min, raw));
  if (step <= 0) return clamped;
  const snapped = Math.round((clamped - min) / step) * step + min;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(6))));
}

export function TactileScrubber({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  tone = 'dark',
  formattedValue,
  valueText,
  minLabel,
  maxLabel,
  majorIntervals = 8,
  className,
}: TactileScrubberProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const ratio = useMemo(() => {
    if (max <= min) return 0;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }, [value, min, max]);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const next = clampAndSnap(min + pct * (max - min), min, max, step);
      if (next !== value) {
        onChange(next);
      }
    },
    [min, max, step, value, onChange]
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    setIsDragging(true);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const coarseStep = Math.max(step, (max - min) / 10);
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clampAndSnap(value + step, min, max, step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clampAndSnap(value - step, min, max, step);
        break;
      case 'PageUp':
        next = clampAndSnap(value + coarseStep, min, max, step);
        break;
      case 'PageDown':
        next = clampAndSnap(value - coarseStep, min, max, step);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (next !== null && next !== value) {
      onChange(next);
    }
  };

  const ticks = useMemo(() => {
    const totalSubTicks = majorIntervals * 4;
    return Array.from({ length: totalSubTicks + 1 }, (_, i) => ({
      index: i,
      isMajor: i % 4 === 0,
      pct: (i / totalSubTicks) * 100,
    }));
  }, [majorIntervals]);

  const isLight = tone === 'light';
  const percent = ratio * 100;

  return (
    <div className={cn('w-full select-none', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span
          className={cn(
            'font-mono text-[11px] uppercase tracking-[0.16em]',
            isLight ? 'text-[#1C1F1E]/70' : 'text-[#EDE7DA]/65'
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'font-mono text-base font-medium tracking-[-0.01em] tabular-nums',
            isLight ? 'text-[#1C1F1E]' : 'text-[#EDE7DA]'
          )}
        >
          {formattedValue ?? value}
        </span>
      </div>

      {/* Machined linear fader track — zero native <input type="range"> */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText ?? formattedValue ?? String(value)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative flex h-12 w-full cursor-ew-resize touch-none items-center rounded-[2px] border px-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
          isLight
            ? 'border-[#1C1F1E]/18 bg-[#ECE7DC] shadow-[inset_0_1px_2px_rgba(28,31,30,0.08)] hover:border-[#1C1F1E]/32 focus-visible:ring-[#46564B]'
            : 'border-[#EDE7DA]/16 bg-[#131615] shadow-[inset_0_1px_3px_rgba(0,0,0,0.65)] hover:border-[#EDE7DA]/30 focus-visible:ring-[#C9A46C]'
        )}
      >
        {/* Etched graduation ticks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 top-1.5 flex h-2.5 items-start justify-between"
        >
          {ticks.map((tick) => {
            const passed = tick.pct <= percent + 0.01;
            return (
              <span
                key={tick.index}
                className={cn(
                  'block w-[1px] transition-colors duration-100',
                  tick.isMajor ? 'h-2.5' : 'h-1.5',
                  isLight
                    ? passed
                      ? 'bg-[#46564B]/75'
                      : 'bg-[#1C1F1E]/22'
                    : passed
                      ? 'bg-[#C9A46C]/80'
                      : 'bg-[#EDE7DA]/20'
                )}
              />
            );
          })}
        </div>

        {/* Recessed fader channel */}
        <div
          aria-hidden="true"
          className={cn(
            'relative mt-3 h-[3px] w-full overflow-hidden rounded-full',
            isLight ? 'bg-[#1C1F1E]/14' : 'bg-[#EDE7DA]/14'
          )}
        >
          <div
            className={cn(
              'h-full origin-left',
              isLight ? 'bg-[#46564B]' : 'bg-[#C9A46C]'
            )}
            style={{ width: `${percent.toFixed(2)}%` }}
          />
        </div>

        {/* Machined brass-notched fader cap */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 bottom-0 top-0"
        >
          <div
            className={cn(
              'absolute top-1/2 flex h-7 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2px] border transition-transform duration-100',
              isDragging ? 'scale-[1.06]' : 'group-hover:scale-[1.03]',
              isLight
                ? 'border-[#1C1F1E]/35 bg-[#FAF8F3] shadow-[0_2px_6px_rgba(28,31,30,0.18)]'
                : 'border-[#EDE7DA]/35 bg-[#232725] shadow-[0_3px_10px_rgba(0,0,0,0.55)]'
            )}
            style={{ left: `${percent.toFixed(2)}%` }}
          >
            {/* Central brass/cypress index hairline */}
            <span
              className={cn(
                'block h-4 w-[2px] rounded-full',
                isLight ? 'bg-[#9C7A42]' : 'bg-[#D9B173]'
              )}
            />
          </div>
        </div>
      </div>

      {(minLabel || maxLabel) && (
        <div
          className={cn(
            'mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.08em] tabular-nums',
            isLight ? 'text-[#1C1F1E]/50' : 'text-[#EDE7DA]/45'
          )}
        >
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
