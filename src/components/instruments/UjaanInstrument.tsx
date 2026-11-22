'use client';

import React, { useMemo, useState } from 'react';
import { CloudRain, Radio, Tractor } from 'lucide-react';

interface HaorBasin {
  id: string;
  name: string;
  district: string;
  baseRisk: number;
  rainSlope: number;
  overrideBoost: number;
  harvesters: number;
}

interface EvaluatedBasin extends HaorBasin {
  urgency: number;
  tier: 'Immediate' | 'Pre-Position' | 'Standby';
}

const HAOR_BASINS: readonly HaorBasin[] = [
  {
    id: 'tanguar',
    name: 'Tanguar Haor',
    district: 'Sunamganj',
    baseRisk: 22,
    rainSlope: 0.34,
    overrideBoost: 18,
    harvesters: 14,
  },
  {
    id: 'hakaluki',
    name: 'Hakaluki Haor',
    district: 'Moulvibazar',
    baseRisk: 18,
    rainSlope: 0.31,
    overrideBoost: 7,
    harvesters: 19,
  },
  {
    id: 'dekhar',
    name: 'Dekhar Haor',
    district: 'Sunamganj',
    baseRisk: 14,
    rainSlope: 0.37,
    overrideBoost: 15,
    harvesters: 11,
  },
  {
    id: 'hail',
    name: 'Hail Haor',
    district: 'Sreemangal',
    baseRisk: 12,
    rainSlope: 0.25,
    overrideBoost: 4,
    harvesters: 8,
  },
] as const;

function classifyTier(score: number): EvaluatedBasin['tier'] {
  if (score >= 70) return 'Immediate';
  if (score >= 45) return 'Pre-Position';
  return 'Standby';
}

export function UjaanInstrument() {
  const [rainfallMm, setRainfallMm] = useState<number>(135);
  const [fieldOverride, setFieldOverride] = useState<boolean>(false);

  const rankedBasins = useMemo<EvaluatedBasin[]>(() => {
    return HAOR_BASINS.map((basin) => {
      const rawScore =
        basin.baseRisk +
        rainfallMm * basin.rainSlope +
        (fieldOverride ? basin.overrideBoost : 0);
      const urgency = Math.max(0, Math.min(100, Math.round(rawScore)));
      return {
        ...basin,
        urgency,
        tier: classifyTier(urgency),
      };
    }).sort((a, b) => b.urgency - a.urgency);
  }, [rainfallMm, fieldOverride]);

  const peakBasin = rankedBasins[0];

  return (
    <section
      aria-label="Ujaan Haor Flood-Risk and Harvester Dispatch Console"
      className="flex flex-col gap-5 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-neutral)] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--accent)]"
            />
            <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
              Haor Flood-Risk &amp; Harvester Dispatch
            </h3>
          </div>
          <p className="font-mono text-xs text-[var(--ink-secondary)]">
            Ujaan (উজান) — Sylhet Basin Telemetry
          </p>
        </div>

        <button
          type="button"
          aria-pressed={fieldOverride}
          onClick={() => setFieldOverride((prev) => !prev)}
          className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-[transform,border-color,background-color,color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
            fieldOverride
              ? 'border-[var(--border-interactive)] bg-[var(--accent-tint)] text-[var(--ink-primary)]'
              : 'border-[var(--border-neutral)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] [@media(hover:hover)]:hover:border-[var(--border-hover)] [@media(hover:hover)]:hover:text-[var(--ink-primary)]'
          }`}
        >
          <Radio
            className={`h-3.5 w-3.5 ${
              fieldOverride
                ? 'text-[var(--accent)]'
                : 'text-[var(--ink-secondary)]'
            }`}
            aria-hidden="true"
          />
          <span>6h Field Override</span>
        </button>
      </div>

      {/* 24h Rainfall Slider */}
      <div className="space-y-2.5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-4">
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor="ujaan-rainfall-slider"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-secondary)]"
          >
            <CloudRain className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            <span>24h Upstream Rainfall Forecast</span>
          </label>
          <span className="font-mono text-lg font-semibold text-[var(--ink-primary)] tabular-nums">
            {rainfallMm} mm
          </span>
        </div>

        <input
          id="ujaan-rainfall-slider"
          type="range"
          min={10}
          max={240}
          step={5}
          value={rainfallMm}
          onChange={(e) => setRainfallMm(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-track)] accent-[var(--accent)]"
        />

        <div className="flex justify-between font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
          <span>10 mm</span>
          <span>125 mm</span>
          <span>240 mm</span>
        </div>
      </div>

      {/* Inline SVG Topographic Urgency Meter */}
      <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--ink-primary)]">
            Topographic Urgency Profile
          </span>
          <span className="font-mono text-[11px] text-[var(--ink-secondary)] tabular-nums">
            Peak: {peakBasin.name} ({peakBasin.urgency}/100)
          </span>
        </div>

        <svg
          viewBox="0 0 360 116"
          role="img"
          aria-label={`Topographic urgency chart showing ${rankedBasins
            .map((b) => `${b.name} at ${b.urgency}`)
            .join(', ')}`}
          className="h-[116px] w-full overflow-visible"
        >
          {/* Subtle Topographic Contour Curves */}
          <path
            d="M 0 92 Q 90 74, 180 86 T 360 78"
            fill="none"
            stroke="var(--border-neutral)"
            strokeWidth="1"
          />
          <path
            d="M 0 66 Q 95 48, 190 60 T 360 52"
            fill="none"
            stroke="var(--border-neutral)"
            strokeWidth="1"
          />
          <path
            d="M 0 40 Q 100 22, 195 34 T 360 28"
            fill="none"
            stroke="var(--border-neutral)"
            strokeWidth="1"
          />

          {/* Dispatch Trigger Threshold Line (70/100 => y = 100 - 70*0.84 = 41.2) */}
          <line
            x1="0"
            y1="41"
            x2="360"
            y2="41"
            stroke="var(--border-interactive)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x="356"
            y="36"
            textAnchor="end"
            fill="var(--ink-secondary)"
            fontSize="9"
            fontFamily="var(--font-jetbrains-mono), monospace"
          >
            Dispatch 70
          </text>

          {/* Basin Urgency Bars */}
          {rankedBasins.map((basin, idx) => {
            const x = 18 + idx * 86;
            const barWidth = 56;
            const barHeight = Math.max(4, Math.round(basin.urgency * 0.84));
            const y = 100 - barHeight;
            const isCritical = basin.urgency >= 70;

            return (
              <g key={basin.id}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isCritical ? 'var(--accent)' : 'var(--bg-track)'}
                  stroke={
                    isCritical
                      ? 'var(--accent)'
                      : 'var(--border-interactive)'
                  }
                  strokeWidth="1"
                />
                <text
                  x={x + barWidth / 2}
                  y={Math.max(12, y - 5)}
                  textAnchor="middle"
                  fill="var(--ink-primary)"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-jetbrains-mono), monospace"
                >
                  {basin.urgency}
                </text>
                <text
                  x={x + barWidth / 2}
                  y="113"
                  textAnchor="middle"
                  fill="var(--ink-secondary)"
                  fontSize="9.5"
                  fontFamily="var(--font-jetbrains-mono), monospace"
                >
                  {basin.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Priority-Sorted Dispatch Queue */}
      <div className="space-y-2">
        {rankedBasins.map((basin, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={basin.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-3.5 py-2.5 transition-[border-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:border-[var(--border-hover)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                    isTop
                      ? 'bg-[var(--accent)] text-[var(--ink-on-accent)]'
                      : 'bg-[var(--bg-track)] text-[var(--ink-secondary)]'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink-primary)]">
                    {basin.name}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--ink-secondary)]">
                    {basin.district}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[var(--ink-secondary)] tabular-nums">
                  <Tractor className="h-3 w-3" aria-hidden="true" />
                  <span>{basin.harvesters} units</span>
                </span>

                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium ${
                    basin.tier === 'Immediate'
                      ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                      : 'border border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--ink-secondary)]'
                  }`}
                >
                  {basin.tier}
                </span>

                <span className="w-8 text-right font-mono text-sm font-semibold text-[var(--ink-primary)] tabular-nums">
                  {basin.urgency}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default UjaanInstrument;
