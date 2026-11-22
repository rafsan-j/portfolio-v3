'use client';

import React, { useMemo, useState } from 'react';
import { BANGLADESH_DISTRICTS } from '@/content/bangladesh-districts';
import type { DistrictPath } from '@/content/types';

const ANCHOR_ORDER = ['sylhet', 'dinajpur', 'rajshahi'] as const;

const ANCHOR_CSS_VAR: Record<string, string> = {
  sylhet: 'var(--anchor-sylhet)',
  dinajpur: 'var(--anchor-dinajpur)',
  rajshahi: 'var(--anchor-rajshahi)',
};

const ANCHOR_FALLBACK_LABELS: Record<string, { label: string; note: string }> = {
  sylhet: {
    label: 'SUST CSE — Current Base',
    note: 'Studying B.Sc. (Engg.) in Computer Science & Engineering at Shahjalal University of Science and Technology.',
  },
  dinajpur: {
    label: 'Hometown',
    note: 'Where I grew up in northern Bangladesh.',
  },
  rajshahi: {
    label: 'Rajshahi Cadet College',
    note: 'Alma mater where I served as College Prefect leading 297 cadets.',
  },
};

export function BangladeshMap() {
  const [selectedId, setSelectedId] = useState<string>('sylhet');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeDistrict: DistrictPath | undefined = useMemo(() => {
    const targetId = hoveredId ?? selectedId;
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === targetId) ??
      BANGLADESH_DISTRICTS[0]
    );
  }, [hoveredId, selectedId]);

  const activeIndex = useMemo(() => {
    if (!activeDistrict) return 0;
    return BANGLADESH_DISTRICTS.findIndex((d) => d.id === activeDistrict.id) + 1;
  }, [activeDistrict]);

  const anchorDistricts = useMemo(
    () =>
      ANCHOR_ORDER.map((id) =>
        BANGLADESH_DISTRICTS.find((d) => d.id === id)
      ).filter((d): d is DistrictPath => Boolean(d)),
    []
  );

  const handleDistrictKeyDown = (
    event: React.KeyboardEvent<SVGPathElement>,
    id: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(id);
    }
  };

  const activeAnchorColor = activeDistrict
    ? ANCHOR_CSS_VAR[activeDistrict.id]
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--border-neutral)] font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
          <span>BANGLADESH · 64 DISTRICTS</span>
          <span>3 ANCHORS</span>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <svg
            viewBox="0 0 1544.65 2132.51"
            role="img"
            aria-label="Interactive 64-district map of Bangladesh highlighting Sylhet, Dinajpur, and Rajshahi"
            className="w-full h-auto select-none"
          >
            {BANGLADESH_DISTRICTS.map((district) => {
              const anchorColor = ANCHOR_CSS_VAR[district.id];
              const isSelected = selectedId === district.id;
              const isHovered = hoveredId === district.id;

              let fill = 'var(--map-land)';
              if (anchorColor) {
                fill = anchorColor;
              } else if (isSelected) {
                fill = 'var(--map-land-active)';
              } else if (isHovered) {
                fill = 'var(--map-land-hover)';
              }

              return (
                <path
                  key={district.id}
                  id={`district-${district.id}`}
                  d={district.d}
                  tabIndex={0}
                  role="button"
                  aria-label={`${district.name}, ${district.division}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(district.id)}
                  onMouseEnter={() => setHoveredId(district.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setSelectedId(district.id)}
                  onKeyDown={(e) => handleDistrictKeyDown(e, district.id)}
                  style={{
                    fill,
                    fillOpacity: anchorColor ? (isSelected || isHovered ? 0.92 : 0.72) : 1,
                    stroke: isSelected ? 'var(--ink-primary)' : 'var(--map-stroke)',
                    strokeWidth: isSelected ? 4 : 1.75,
                    transition: 'fill 140ms ease, fill-opacity 140ms ease',
                  }}
                  className="cursor-pointer focus:outline-none"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
            <span>INSPECTOR READOUT</span>
            <span>
              {String(activeIndex).padStart(2, '0')} / {BANGLADESH_DISTRICTS.length}
            </span>
          </div>

          {activeDistrict ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: activeAnchorColor ?? 'var(--border-interactive)',
                  }}
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold tracking-[-0.015em] text-[var(--ink-primary)]">
                  {activeDistrict.name}
                </h3>
              </div>

              <p className="font-mono text-xs text-[var(--ink-secondary)] tracking-[0.02em]">
                {activeDistrict.division}
              </p>

              {activeDistrict.anchor || ANCHOR_FALLBACK_LABELS[activeDistrict.id] ? (
                <div className="pt-3 border-t border-[var(--border-neutral)] space-y-1.5">
                  <div
                    className="font-mono text-xs font-medium"
                    style={{ color: activeAnchorColor ?? 'var(--accent)' }}
                  >
                    {activeDistrict.anchor?.label ??
                      ANCHOR_FALLBACK_LABELS[activeDistrict.id]?.label}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {activeDistrict.anchor?.note ??
                      ANCHOR_FALLBACK_LABELS[activeDistrict.id]?.note}
                  </p>
                </div>
              ) : (
                <p className="pt-3 border-t border-[var(--border-neutral)] text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Select any district on the map or use the anchor buttons below to inspect Sylhet, Dinajpur, and Rajshahi.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-4 space-y-2.5">
          <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
            Anchor Districts
          </div>

          <div className="grid grid-cols-1 gap-2">
            {anchorDistricts.map((anchor) => {
              const colorVar = ANCHOR_CSS_VAR[anchor.id];
              const isSelected = selectedId === anchor.id;
              const label =
                anchor.anchor?.label ?? ANCHOR_FALLBACK_LABELS[anchor.id]?.label;

              return (
                <button
                  key={anchor.id}
                  type="button"
                  onClick={() => setSelectedId(anchor.id)}
                  className={`min-h-[44px] w-full text-left px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors duration-[var(--dur-fast)] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[var(--bg-track)] border-[var(--border-interactive)]'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-neutral)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colorVar }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[var(--ink-primary)] truncate">
                      {anchor.name}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--ink-secondary)] truncate">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BangladeshMap;
