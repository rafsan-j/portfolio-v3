'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

// Authentic Vellum editorial palette (Qurrat al-Ayn, VLM-2026-001)
const VELLUM_INK = '#202321';
const VELLUM_CREAM = '#E8DFC9';
const VELLUM_CYPRESS = '#46564B';
const VELLUM_OXIDE = '#8B5E46';

interface RibbonLayer {
  color: string;
  alpha: number;
  strands: number;
  baseYRatio: number;
  ampRatio: number;
  freq: number;
  speed: number;
  phaseOffset: number;
  lineWidth: number;
}

const RIBBON_LAYERS: readonly RibbonLayer[] = [
  {
    color: VELLUM_CYPRESS,
    alpha: 0.72,
    strands: 9,
    baseYRatio: 0.56,
    ampRatio: 0.16,
    freq: 1.15,
    speed: 0.42,
    phaseOffset: 0.0,
    lineWidth: 1.35,
  },
  {
    color: VELLUM_OXIDE,
    alpha: 0.62,
    strands: 7,
    baseYRatio: 0.48,
    ampRatio: 0.14,
    freq: 1.45,
    speed: 0.56,
    phaseOffset: 1.9,
    lineWidth: 1.15,
  },
  {
    color: VELLUM_CREAM,
    alpha: 0.85,
    strands: 6,
    baseYRatio: 0.5,
    ampRatio: 0.12,
    freq: 1.75,
    speed: 0.68,
    phaseOffset: 3.6,
    lineWidth: 1.0,
  },
] as const;

export function VellumInstrument() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(1.8);
  const lastTimestampRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [tension, setTension] = useState<number>(1.0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const tensionRef = useRef<number>(tension);
  tensionRef.current = tension;

  const drawFrame = useCallback((elapsed: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Matte Vellum Ink Stage
    ctx.fillStyle = VELLUM_INK;
    ctx.fillRect(0, 0, width, height);

    // Subtle editorial baseline hairlines
    ctx.strokeStyle = 'rgba(232, 223, 201, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    const currentTension = tensionRef.current;

    for (const layer of RIBBON_LAYERS) {
      const centerY = height * layer.baseYRatio;
      const amp = height * layer.ampRatio * (0.55 + currentTension * 0.55);
      const t = elapsed * layer.speed + layer.phaseOffset;

      for (let s = 0; s < layer.strands; s++) {
        const strandNorm = layer.strands > 1 ? s / (layer.strands - 1) - 0.5 : 0;
        const spread = strandNorm * (14 + currentTension * 18);
        const strandPhase = t + strandNorm * 0.48 * currentTension;

        const y0 = centerY + Math.sin(strandPhase) * amp * 0.65 + spread * 0.5;
        const cp1x = width * 0.32;
        const cp1y =
          centerY +
          Math.sin(strandPhase * layer.freq + 1.1) * amp +
          spread;
        const cp2x = width * 0.68;
        const cp2y =
          centerY +
          Math.cos(strandPhase * layer.freq * 0.85 - 0.7) * amp -
          spread * 0.85;
        const y3 =
          centerY +
          Math.sin(strandPhase + 2.3) * amp * 0.6 -
          spread * 0.4;

        const falloff = 1 - Math.abs(strandNorm) * 1.15;
        ctx.strokeStyle = layer.color;
        ctx.globalAlpha = Math.max(0.14, layer.alpha * falloff);
        ctx.lineWidth = layer.lineWidth;

        ctx.beginPath();
        ctx.moveTo(-12, y0);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width + 12, y3);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }, []);

  // Respect prefers-reduced-motion on initial mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setIsPlaying(false);
    }
    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) {
        setIsPlaying(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 60 FPS Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimestampRef.current = null;
      drawFrame(timeRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;
      timeRef.current += deltaSec;

      drawFrame(timeRef.current);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, drawFrame]);

  // Redraw immediately on resize or when tension changes while paused
  useEffect(() => {
    drawFrame(timeRef.current);
  }, [tension, drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      drawFrame(timeRef.current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawFrame]);

  return (
    <section
      aria-label="Vellum 3-Layer Bezier Silk-Ribbon Canvas"
      className="flex flex-col gap-4 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full transition-colors duration-[180ms] ${
                isPlaying ? 'bg-[var(--accent)]' : 'bg-[var(--border-interactive)]'
              }`}
            />
            <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
              Qurrat al-Ayn — Silk-Ribbon Breath
            </h3>
          </div>
          <p className="font-mono text-xs text-[var(--ink-secondary)]">
            VLM-2026-001 — 3-Layer Cubic Bezier Canvas
          </p>
        </div>

        <span className="font-mono text-[11px] text-[var(--ink-secondary)] tabular-nums">
          {isPlaying ? '60 FPS' : reducedMotion ? 'Reduced Motion' : 'Paused'}
        </span>
      </div>

      {/* Matte 16:9 Theatrical Frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--border-neutral)] bg-[#202321]">
        <canvas
          ref={canvasRef}
          aria-label="Animated 3-layer silk ribbon waveform in Vellum Cream, Cypress, and Oxide"
          className="block h-full w-full"
        />

        {/* Quiet Edition Swatches in Frame Corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-[#323834] bg-[#202321]/85 px-2.5 py-1 backdrop-blur-sm"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: VELLUM_CREAM }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: VELLUM_CYPRESS }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: VELLUM_OXIDE }}
          />
          <span className="ml-1 font-mono text-[10px] text-[#E8DFC9]/80">
            VLM-2026-001
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          aria-pressed={isPlaying}
          onClick={() => setIsPlaying((prev) => !prev)}
          className="inline-flex min-h-[36px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-3.5 py-1.5 text-xs font-medium text-[var(--ink-primary)] transition-[transform,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:border-[var(--border-hover)] active:scale-[0.97]"
        >
          {isPlaying ? (
            <Pause
              className="h-3.5 w-3.5 text-[var(--accent)]"
              aria-hidden="true"
            />
          ) : (
            <Play
              className="h-3.5 w-3.5 text-[var(--accent)]"
              aria-hidden="true"
            />
          )}
          <span>{isPlaying ? 'Pause Breath' : 'Play Breath'}</span>
        </button>

        <div className="flex flex-1 items-center gap-3 sm:max-w-xs">
          <label
            htmlFor="vellum-tension-slider"
            className="shrink-0 text-xs text-[var(--ink-secondary)]"
          >
            Harmonic Tension
          </label>
          <input
            id="vellum-tension-slider"
            type="range"
            min={0.2}
            max={1.8}
            step={0.05}
            value={tension}
            onChange={(e) => setTension(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-track)] accent-[var(--accent)]"
          />
          <span className="w-10 text-right font-mono text-xs font-semibold text-[var(--ink-primary)] tabular-nums">
            {tension.toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
}

export default VellumInstrument;
