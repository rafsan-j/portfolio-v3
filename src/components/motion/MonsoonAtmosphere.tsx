'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type AtmosphereMood = 'tungsten' | 'dawn';

export interface MonsoonAtmosphereProps {
  className?: string;
  mood?: AtmosphereMood;
  /** Multiplier for rain streak density and opacity (default 1) */
  intensity?: number;
}

interface RainStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  width: number;
}

const GRAIN_SIZE = 128;
const GRAIN_INTERVAL_MS = 1000 / 24; // 24fps organic analog film grain
const GRAIN_OPACITY = 0.028; // ~2.8%
const RAIN_ANGLE_RAD = (15.5 * Math.PI) / 180; // Slanted Sylhet monsoon drift

function createGrainCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = GRAIN_SIZE;
  canvas.height = GRAIN_SIZE;
  return canvas;
}

function populateGrainFrame(ctx: CanvasRenderingContext2D): void {
  const imageData = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Organic monochrome silver-halide grain distribution
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

function seedRainStreaks(
  width: number,
  height: number,
  count: number
): RainStreak[] {
  const streaks: RainStreak[] = [];
  for (let i = 0; i < count; i += 1) {
    const depth = Math.random();
    streaks.push({
      x: Math.random() * (width + 200) - 100,
      y: Math.random() * height,
      length: 34 + depth * 72,
      speed: 220 + depth * 310,
      alpha: 0.035 + depth * 0.085,
      width: 0.6 + depth * 0.55,
    });
  }
  return streaks;
}

export function MonsoonAtmosphere({
  className,
  mood = 'tungsten',
  intensity = 1,
}: MonsoonAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moodRef = useRef<AtmosphereMood>(mood);
  const intensityRef = useRef<number>(intensity);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const grainCanvas = createGrainCanvas();
    const grainCtx = grainCanvas.getContext('2d');
    if (grainCtx) {
      populateGrainFrame(grainCtx);
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    let prefersReducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let streaks: RainStreak[] = [];
    let rafId: number | null = null;
    let lastFrameTime = performance.now();
    let lastGrainTime = performance.now();

    // Pointer-reactive warm tungsten / silver depth pool (normalized 0..1)
    const pointer = {
      targetX: 0.52,
      targetY: 0.42,
      x: 0.52,
      y: 0.42,
      active: false,
    };

    const sinA = Math.sin(RAIN_ANGLE_RAD);
    const cosA = Math.cos(RAIN_ANGLE_RAD);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const baseCount = Math.round(
        Math.min(72, Math.max(24, (width * height) / 26000)) *
          intensityRef.current
      );
      streaks = seedRainStreaks(width, height, baseCount);
    };

    const drawFrame = (dtSec: number, now: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      const currentMood = moodRef.current;
      const currentIntensity = intensityRef.current;

      // Smooth pointer damping
      if (animate) {
        const lerp = 1 - Math.exp(-4.5 * dtSec);
        pointer.x += (pointer.targetX - pointer.x) * lerp;
        pointer.y += (pointer.targetY - pointer.y) * lerp;
      }

      // 1. Soft pointer-reactive warm tungsten / cool silver depth pool
      const poolX = pointer.x * width;
      const poolY = pointer.y * height;
      const poolRadius = Math.max(width, height) * 0.48;
      const poolGradient = ctx.createRadialGradient(
        poolX,
        poolY,
        0,
        poolX,
        poolY,
        poolRadius
      );

      if (currentMood === 'tungsten') {
        poolGradient.addColorStop(0, 'rgba(218, 165, 102, 0.11)');
        poolGradient.addColorStop(0.45, 'rgba(180, 128, 72, 0.045)');
        poolGradient.addColorStop(1, 'rgba(14, 16, 15, 0)');
      } else {
        poolGradient.addColorStop(0, 'rgba(182, 206, 214, 0.11)');
        poolGradient.addColorStop(0.45, 'rgba(128, 156, 168, 0.045)');
        poolGradient.addColorStop(1, 'rgba(14, 16, 15, 0)');
      }

      ctx.fillStyle = poolGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle slanted monsoon rain-light streaks
      const streakColor =
        currentMood === 'tungsten'
          ? '234, 214, 184'
          : '204, 224, 232';

      ctx.lineCap = 'round';
      for (let i = 0; i < streaks.length; i += 1) {
        const s = streaks[i];
        if (animate) {
          const step = s.speed * dtSec;
          s.x -= sinA * step;
          s.y += cosA * step;

          if (s.y - s.length > height || s.x < -120) {
            s.y = -s.length - Math.random() * 80;
            s.x = Math.random() * (width + 220) - 40;
          }
        }

        const x2 = s.x - sinA * s.length;
        const y2 = s.y + cosA * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, x2, y2);
        const peakAlpha = Math.min(0.22, s.alpha * currentIntensity);
        grad.addColorStop(0, `rgba(${streakColor}, 0)`);
        grad.addColorStop(0.65, `rgba(${streakColor}, ${peakAlpha.toFixed(4)})`);
        grad.addColorStop(1, `rgba(${streakColor}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 3. 24fps 128x128 organic analog film grain (~2.8%)
      if (animate && grainCtx && now - lastGrainTime >= GRAIN_INTERVAL_MS) {
        populateGrainFrame(grainCtx);
        lastGrainTime = now;
      }

      const pattern = ctx.createPattern(grainCanvas, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.globalAlpha = GRAIN_OPACITY;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    };

    const tick = (now: number) => {
      if (document.hidden || prefersReducedMotion) {
        rafId = null;
        return;
      }
      const dtSec = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      drawFrame(dtSec, now, true);
      rafId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (prefersReducedMotion) {
        drawFrame(0, performance.now(), false);
        return;
      }
      if (rafId === null && !document.hidden) {
        lastFrameTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      pointer.targetX = Math.min(1, Math.max(0, nx));
      pointer.targetY = Math.min(1, Math.max(0, ny));
      pointer.active = true;
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion) {
        stop();
        drawFrame(0, performance.now(), false);
      } else {
        start();
      }
    };

    resize();
    start();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize();
            if (prefersReducedMotion) {
              drawFrame(0, performance.now(), false);
            }
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(canvas);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      stop();
      resizeObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotionQuery.removeEventListener(
        'change',
        handleReducedMotionChange
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
    />
  );
}
