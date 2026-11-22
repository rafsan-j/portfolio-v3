'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  Pause,
  Play,
  Unlock,
} from 'lucide-react';
import { ClipReveal, ParallaxFrame } from '@/components/motion/ScrollReveal';
import { TactileScrubber } from '@/components/controls/SculpturalControls';
import { cn } from '@/lib/utils';

/* ========================================================================== */
/* CHAPTER 01 · UJAAN (উজান) — Storm Slate + SAR Vector Overlay Canvas       */
/* ========================================================================== */

type UjaanScenarioId = 'normal' | 'surge' | 'override';

interface SubBasinRank {
  id: string;
  name: string;
  district: string;
  /** Normalized position over the aerial Haor Basin print */
  nx: number;
  ny: number;
  urgency: number;
  waterDeltaCm: string;
  harvesters: number;
  windowLabel: string;
}

const UJAAN_SCENARIOS: Record<
  UjaanScenarioId,
  {
    label: string;
    note: string;
    solverTimeMs: number;
    basins: SubBasinRank[];
  }
> = {
  normal: {
    label: 'Monsoon Normal',
    note: 'Baseline Sentinel-1 SAR backscatter paired with steady FFWC Surma–Kushiyara gauge levels.',
    solverTimeMs: 118,
    basins: [
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        district: 'Sunamganj',
        nx: 0.34,
        ny: 0.36,
        urgency: 0.64,
        waterDeltaCm: '+14 cm',
        harvesters: 5,
        windowLabel: '48h clear',
      },
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        district: 'Sunamganj',
        nx: 0.56,
        ny: 0.44,
        urgency: 0.52,
        waterDeltaCm: '+9 cm',
        harvesters: 3,
        windowLabel: '62h clear',
      },
      {
        id: 'hakaluki',
        name: 'Hakaluki Haor',
        district: 'Moulvibazar',
        nx: 0.72,
        ny: 0.63,
        urgency: 0.41,
        waterDeltaCm: '+6 cm',
        harvesters: 2,
        windowLabel: '72h clear',
      },
      {
        id: 'shanir',
        name: 'Shanir Haor',
        district: 'Tahirpur',
        nx: 0.28,
        ny: 0.64,
        urgency: 0.37,
        waterDeltaCm: '+4 cm',
        harvesters: 2,
        windowLabel: '78h clear',
      },
    ],
  },
  surge: {
    label: 'Flash Surge',
    note: 'Meghalaya upland runoff detected by Open-Meteo; CP-SAT re-routes fleet toward northern embankments.',
    solverTimeMs: 164,
    basins: [
      {
        id: 'shanir',
        name: 'Shanir Haor',
        district: 'Tahirpur',
        nx: 0.28,
        ny: 0.64,
        urgency: 0.94,
        waterDeltaCm: '+68 cm',
        harvesters: 6,
        windowLabel: '14h critical',
      },
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        district: 'Sunamganj',
        nx: 0.34,
        ny: 0.36,
        urgency: 0.88,
        waterDeltaCm: '+54 cm',
        harvesters: 4,
        windowLabel: '19h critical',
      },
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        district: 'Sunamganj',
        nx: 0.56,
        ny: 0.44,
        urgency: 0.71,
        waterDeltaCm: '+31 cm',
        harvesters: 2,
        windowLabel: '28h watch',
      },
      {
        id: 'hakaluki',
        name: 'Hakaluki Haor',
        district: 'Moulvibazar',
        nx: 0.72,
        ny: 0.63,
        urgency: 0.58,
        waterDeltaCm: '+22 cm',
        harvesters: 0,
        windowLabel: '38h watch',
      },
    ],
  },
  override: {
    label: '6h Field Override',
    note: 'Missed-call Bangla intake confirms embankment seepage at Dekhar; 6-hour TTL field override elevated.',
    solverTimeMs: 142,
    basins: [
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        district: 'Sunamganj',
        nx: 0.56,
        ny: 0.44,
        urgency: 0.98,
        waterDeltaCm: '+74 cm*',
        harvesters: 7,
        windowLabel: '6h TTL override',
      },
      {
        id: 'shanir',
        name: 'Shanir Haor',
        district: 'Tahirpur',
        nx: 0.28,
        ny: 0.64,
        urgency: 0.85,
        waterDeltaCm: '+49 cm',
        harvesters: 3,
        windowLabel: '16h critical',
      },
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        district: 'Sunamganj',
        nx: 0.34,
        ny: 0.36,
        urgency: 0.76,
        waterDeltaCm: '+38 cm',
        harvesters: 2,
        windowLabel: '24h watch',
      },
      {
        id: 'hakaluki',
        name: 'Hakaluki Haor',
        district: 'Moulvibazar',
        nx: 0.72,
        ny: 0.63,
        urgency: 0.49,
        waterDeltaCm: '+15 cm',
        harvesters: 0,
        windowLabel: '50h clear',
      },
    ],
  },
};

const DEPOT_NORM = { nx: 0.84, ny: 0.24 };

function UjaanSarOverlay({ basins }: { basins: SubBasinRank[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const basinsRef = useRef<SubBasinRank[]>(basins);

  useEffect(() => {
    basinsRef.current = basins;
  }, [basins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId: number | null = null;
    let phase = 0;

    const pointer = { x: 0.5, y: 0.5, inside: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const currentBasins = basinsRef.current;
      const depotX = DEPOT_NORM.nx * width;
      const depotY = DEPOT_NORM.ny * height;

      // Subtle SAR topographic contour rings around each sub-basin
      for (let i = 0; i < currentBasins.length; i += 1) {
        const b = currentBasins[i];
        const bx = b.nx * width;
        const by = b.ny * height;
        const baseRadius = 26 + b.urgency * 42;
        const pulse = reducedMotion ? 0 : Math.sin(phase * 1.6 + i * 1.1) * 4;

        for (let ring = 1; ring <= 3; ring += 1) {
          const r = baseRadius * (0.48 + ring * 0.34) + pulse * (ring * 0.3);
          ctx.beginPath();
          ctx.ellipse(
            bx,
            by,
            r * 1.18,
            r * 0.78,
            -0.25 + i * 0.14,
            0,
            Math.PI * 2
          );
          const alpha =
            b.urgency >= 0.8
              ? 0.28 - ring * 0.06
              : 0.16 - ring * 0.035;
          ctx.strokeStyle =
            b.urgency >= 0.8
              ? `rgba(217, 130, 43, ${Math.max(0.05, alpha).toFixed(3)})`
              : `rgba(226, 236, 234, ${Math.max(0.04, alpha).toFixed(3)})`;
          ctx.lineWidth = ring === 1 ? 1.1 : 0.75;
          ctx.stroke();
        }
      }

      // Harvester dispatch curved vectors from Sunamganj hub depot
      for (let i = 0; i < currentBasins.length; i += 1) {
        const b = currentBasins[i];
        if (b.harvesters <= 0) continue;
        const bx = b.nx * width;
        const by = b.ny * height;
        const midX = (depotX + bx) * 0.5;
        const midY = (depotY + by) * 0.5 - 28 - i * 10;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(depotX, depotY);
        ctx.quadraticCurveTo(midX, midY, bx, by);
        ctx.strokeStyle =
          i === 0 ? 'rgba(217, 130, 43, 0.88)' : 'rgba(217, 130, 43, 0.45)';
        ctx.lineWidth = i === 0 ? 1.6 : 1.05;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = reducedMotion ? 0 : -phase * 22;
        ctx.stroke();
        ctx.restore();

        // Moving dispatch pulse along primary vectors
        const t = reducedMotion ? 0.55 : ((phase * 0.24 + i * 0.27) % 1);
        const inv = 1 - t;
        const px =
          inv * inv * depotX + 2 * inv * t * midX + t * t * bx;
        const py =
          inv * inv * depotY + 2 * inv * t * midY + t * t * by;

        ctx.beginPath();
        ctx.arc(px, py, i === 0 ? 3.2 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#F2A950';
        ctx.fill();
      }

      // Depot marker
      ctx.beginPath();
      ctx.arc(depotX, depotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#E2ECEA';
      ctx.fill();
      ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = 'rgba(226, 236, 234, 0.85)';
      ctx.fillText('HUB · SUNAMGANJ', depotX - 96, depotY - 10);

      // Basin nodes & labels
      for (let i = 0; i < currentBasins.length; i += 1) {
        const b = currentBasins[i];
        const bx = b.nx * width;
        const by = b.ny * height;

        ctx.beginPath();
        ctx.arc(bx, by, i === 0 ? 4.5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = b.urgency >= 0.8 ? '#D9822B' : '#E2ECEA';
        ctx.fill();

        ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillStyle = 'rgba(226, 236, 234, 0.92)';
        ctx.fillText(
          `${b.name.toUpperCase()} · ${(b.urgency * 100).toFixed(0)}`,
          bx + 9,
          by + 3
        );
      }

      // Subtle pointer-reactive SAR reticle & bearing line to nearest basin
      if (pointer.inside) {
        const px = pointer.x * width;
        const py = pointer.y * height;

        let nearest = currentBasins[0];
        let bestDist = Infinity;
        for (const b of currentBasins) {
          const dx = b.nx * width - px;
          const dy = b.ny * height - py;
          const d = dx * dx + dy * dy;
          if (d < bestDist) {
            bestDist = d;
            nearest = b;
          }
        }

        if (nearest) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nearest.nx * width, nearest.ny * height);
          ctx.strokeStyle = 'rgba(226, 236, 234, 0.34)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(217, 130, 43, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const tick = () => {
      if (document.hidden || reducedMotion) {
        rafId = null;
        return;
      }
      phase += 0.016;
      draw();
      rafId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion) {
        draw();
        return;
      }
      if (rafId === null && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      pointer.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      pointer.inside = true;
      if (reducedMotion) draw();
    };

    const handlePointerLeave = () => {
      pointer.inside = false;
      if (reducedMotion) draw();
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    start();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize();
            if (reducedMotion) draw();
          })
        : null;
    ro?.observe(canvas);

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      ro?.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive Sentinel-1 SAR contour and amber harvester dispatch overlay"
      className="absolute inset-0 h-full w-full cursor-crosshair"
    />
  );
}

/* ========================================================================== */
/* CHAPTER 02 · OTTOBUDGET — Archival Vellum + Press-and-Hold Stealth Vault   */
/* ========================================================================== */

const OTTO_7DAY_SPEND = [
  { day: 'Mon', bdt: 420 },
  { day: 'Tue', bdt: 890 },
  { day: 'Wed', bdt: 310 },
  { day: 'Thu', bdt: 1240 },
  { day: 'Fri', bdt: 680 },
  { day: 'Sat', bdt: 530 },
  { day: 'Sun', bdt: 960 },
];

const OTTO_MAX_SPEND = Math.max(...OTTO_7DAY_SPEND.map((d) => d.bdt));

/* ========================================================================== */
/* CHAPTER 03 · VELLUM — 21:9 Cinema + 3-Layer Bezier Silk-Ribbon Canvas      */
/* ========================================================================== */

function VellumRibbonCanvas({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef<boolean>(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId: number | null = null;
    let t = 0;

    let lastClientX = 0;
    let hasLastX = false;
    let velocityEnergy = 0;

    const layers = [
      {
        color: 'rgba(232, 223, 201, 0.34)',
        lineWidth: 1.5,
        amp: 26,
        freq: 1.0,
        phaseOffset: 0,
        yRatio: 0.56,
      },
      {
        color: 'rgba(139, 94, 70, 0.55)',
        lineWidth: 2.1,
        amp: 34,
        freq: 0.78,
        phaseOffset: 1.9,
        yRatio: 0.61,
      },
      {
        color: 'rgba(201, 164, 108, 0.30)',
        lineWidth: 1.15,
        amp: 20,
        freq: 1.24,
        phaseOffset: 3.7,
        yRatio: 0.65,
      },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (const layer of layers) {
        const baseY = height * layer.yRatio;
        const dynamicAmp = layer.amp * (1 + velocityEnergy * 0.9);
        const p = t * layer.freq + layer.phaseOffset;

        ctx.beginPath();
        ctx.moveTo(-20, baseY + Math.sin(p) * dynamicAmp * 0.4);

        const cp1x = width * 0.25;
        const cp1y = baseY + Math.sin(p + 0.9) * dynamicAmp;
        const cp2x = width * 0.5;
        const cp2y = baseY - Math.cos(p * 0.85 + 1.4) * dynamicAmp * 1.15;
        const midX = width * 0.52;
        const midY = baseY + Math.sin(p + 2.1) * dynamicAmp * 0.55;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, midX, midY);

        const cp3x = width * 0.72;
        const cp3y = baseY + Math.cos(p + 2.7) * dynamicAmp * 1.1;
        const cp4x = width * 0.88;
        const cp4y = baseY - Math.sin(p * 0.9 + 3.2) * dynamicAmp * 0.9;

        ctx.bezierCurveTo(
          cp3x,
          cp3y,
          cp4x,
          cp4y,
          width + 20,
          baseY + Math.cos(p + 0.4) * dynamicAmp * 0.35
        );

        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.lineWidth;
        ctx.stroke();
      }
    };

    const tick = () => {
      if (document.hidden || reducedMotion) {
        rafId = null;
        return;
      }
      if (!pausedRef.current) {
        t += 0.014 + velocityEnergy * 0.018;
      }
      velocityEnergy *= 0.92;
      drawFrame();
      rafId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion) {
        drawFrame();
        return;
      }
      if (rafId === null && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (hasLastX) {
        const dx = Math.abs(e.clientX - lastClientX);
        velocityEnergy = Math.min(1.6, velocityEnergy + dx * 0.012);
      }
      lastClientX = e.clientX;
      hasLastX = true;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    start();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize();
            if (reducedMotion) drawFrame();
          })
        : null;
    ro?.observe(canvas);

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      ro?.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 h-full w-full"
    />
  );
}

/* ========================================================================== */
/* CHAPTER 04 · MESS MANAGER — Integer-Paisa Hamilton Largest-Remainder       */
/* ========================================================================== */

interface MessRoommate {
  id: string;
  name: string;
  meals: number;
}

const ROOMMATES: MessRoommate[] = [
  { id: 'rafsan', name: 'Rafsan Jani', meals: 47 },
  { id: 'araf', name: 'Abdullah Al Araf', meals: 42 },
  { id: 'sadiq', name: 'Ahnaf Sadiq', meals: 39 },
  { id: 'shafkat', name: 'Shafkat Ahsan', meals: 35 },
];

interface HamiltonAllocation {
  id: string;
  name: string;
  meals: number;
  sharePaisa: number;
  receivedRemainder: boolean;
}

function allocateHamiltonPaisa(
  totalBdt: number,
  members: MessRoommate[]
): {
  totalPaisa: number;
  totalMeals: number;
  mealRatePaisa: number;
  rows: HamiltonAllocation[];
  sumPaisa: number;
} {
  const totalPaisa = Math.round(totalBdt * 100);
  const totalMeals = members.reduce((acc, m) => acc + m.meals, 0);

  const prelim = members.map((m, idx) => {
    const numerator = totalPaisa * m.meals;
    const floorPaisa = Math.floor(numerator / totalMeals);
    const remainderNum = numerator % totalMeals;
    return {
      idx,
      id: m.id,
      name: m.name,
      meals: m.meals,
      floorPaisa,
      remainderNum,
    };
  });

  const floorSum = prelim.reduce((acc, item) => acc + item.floorPaisa, 0);
  const leftoverPaisa = totalPaisa - floorSum;

  const rankedByRemainder = [...prelim].sort((a, b) => {
    if (b.remainderNum !== a.remainderNum) {
      return b.remainderNum - a.remainderNum;
    }
    return a.idx - b.idx;
  });

  const bonusIds = new Set(
    rankedByRemainder.slice(0, leftoverPaisa).map((r) => r.id)
  );

  const rows: HamiltonAllocation[] = prelim.map((item) => {
    const receivedRemainder = bonusIds.has(item.id);
    return {
      id: item.id,
      name: item.name,
      meals: item.meals,
      sharePaisa: item.floorPaisa + (receivedRemainder ? 1 : 0),
      receivedRemainder,
    };
  });

  const sumPaisa = rows.reduce((acc, r) => acc + r.sharePaisa, 0);

  return {
    totalPaisa,
    totalMeals,
    mealRatePaisa: totalPaisa / totalMeals,
    rows,
    sumPaisa,
  };
}

function formatBdtFromPaisa(paisa: number): string {
  const bdt = paisa / 100;
  return `৳${bdt.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatWholeBdt(bdt: number): string {
  return `৳${bdt.toLocaleString('en-IN')}`;
}

/* ========================================================================== */
/* MAIN EXPORT: FlagshipChapters                                              */
/* ========================================================================== */

export function FlagshipChapters() {
  // Chapter 01 · Ujaan state
  const [ujaanScenario, setUjaanScenario] = useState<UjaanScenarioId>('surge');
  const activeUjaan = UJAAN_SCENARIOS[ujaanScenario];

  // Chapter 02 · OttoBudget Stealth Vault state (450ms press-and-hold or click)
  const [stealthLocked, setStealthLocked] = useState(true);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdCompletedRef = useRef(false);

  const HOLD_DURATION_MS = 450;

  const cancelHold = () => {
    if (holdRafRef.current !== null) {
      window.cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdStartRef.current = null;
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdRafRef.current !== null) {
        window.cancelAnimationFrame(holdRafRef.current);
      }
    };
  }, []);

  const handleVaultPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    holdCompletedRef.current = false;
    holdStartRef.current = performance.now();

    const step = (now: number) => {
      if (holdStartRef.current === null) return;
      const elapsed = now - holdStartRef.current;
      const pct = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(pct);
      if (pct >= 1) {
        holdCompletedRef.current = true;
        setStealthLocked((prev) => !prev);
        cancelHold();
        return;
      }
      holdRafRef.current = window.requestAnimationFrame(step);
    };

    holdRafRef.current = window.requestAnimationFrame(step);
  };

  const handleVaultPointerUp = () => {
    if (holdStartRef.current !== null && !holdCompletedRef.current) {
      // Quick click / tap also toggles smoothly for effortless discovery
      setStealthLocked((prev) => !prev);
    }
    cancelHold();
  };

  const handleVaultPointerCancel = () => {
    cancelHold();
  };

  // Chapter 03 · Vellum cinema pause/resume state
  const [vellumPaused, setVellumPaused] = useState(false);

  // Chapter 04 · Mess Manager bazar BDT scrubber state
  const [bazarBdt, setBazarBdt] = useState(14350);
  const hamilton = useMemo(
    () => allocateHamiltonPaisa(bazarBdt, ROOMMATES),
    [bazarBdt]
  );

  return (
    <div className="w-full">
      {/* ================================================================== */}
      {/* 01 · UJAAN (উজান) — Storm Slate (#0F171A / #E2ECEA / #D9822B)     */}
      {/* ================================================================== */}
      <section
        id="chapter-ujaan"
        aria-labelledby="heading-ujaan"
        className="w-full bg-[#0F171A] py-24 text-[#E2ECEA] lg:py-36"
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          {/* Chapter header */}
          <div className="grid grid-cols-1 gap-8 border-b border-[#E2ECEA]/14 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <ClipReveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D9822B]">
                  01 · Civic Optimization · AI Builders Hackathon 2026
                </p>
              </ClipReveal>
              <ClipReveal delay={80}>
                <h2
                  id="heading-ujaan"
                  className="mt-3 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
                >
                  Ujaan <span className="italic text-[#E2ECEA]/75">উজান</span>
                </h2>
              </ClipReveal>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className="text-sm leading-relaxed text-[#E2ECEA]/75 sm:text-base lg:ml-auto lg:max-w-md">
                Flood-risk combine-harvester dispatch for Bangladesh&rsquo;s Haor
                Basin — fusing Sentinel-1 SAR radar, FFWC river gauges,
                Open-Meteo forecasts, and an OR-Tools CP-SAT solver.
              </p>
            </div>
          </div>

          {/* Full-bleed aerial Haor Basin print + interactive SAR contour & dispatch canvas */}
          <div className="mt-10">
            <ParallaxFrame
              distance={26}
              className="aspect-[16/9] w-full bg-[#091012] sm:aspect-[21/10]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/plate-ujaan.jpg"
                alt="Overhead monsoon dusk aerial print of the Haor Basin wetlands"
                className="h-full w-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F171A]/70 via-transparent to-[#0F171A]/25"
              />
              <UjaanSarOverlay basins={activeUjaan.basins} />
            </ParallaxFrame>
          </div>

          {/* Scenario switch + live sub-basin urgency rankings */}
          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E2ECEA]/55">
                Dispatch Scenario
              </p>
              <div
                role="tablist"
                aria-label="Ujaan hydrological scenario"
                className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-b border-[#E2ECEA]/14 pb-4"
              >
                {(
                  Object.keys(UJAAN_SCENARIOS) as UjaanScenarioId[]
                ).map((key) => {
                  const selected = ujaanScenario === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setUjaanScenario(key)}
                      className={cn(
                        'relative pb-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D9822B]',
                        selected
                          ? 'text-[#D9822B]'
                          : 'text-[#E2ECEA]/55 hover:text-[#E2ECEA]'
                      )}
                    >
                      {UJAAN_SCENARIOS[key].label}
                      {selected && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 -bottom-[17px] h-[2px] bg-[#D9822B]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#E2ECEA]/75">
                {activeUjaan.note}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#E2ECEA]/55 tabular-nums">
                <span>CP-SAT Solve: {activeUjaan.solverTimeMs} ms</span>
                <span>Fleet: 12 Harvesters</span>
              </div>

              <div className="mt-8">
                <Link
                  href="/work/ujaan"
                  className="group inline-flex items-center gap-2 border-b border-[#D9822B]/60 pb-1 font-mono text-xs uppercase tracking-[0.14em] text-[#E2ECEA] transition-colors duration-200 hover:border-[#D9822B] hover:text-[#D9822B]"
                >
                  <span>Read the Ujaan case study</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* Live sub-basin urgency table (open hairline typography, zero boxes) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-12 border-b border-[#E2ECEA]/16 pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#E2ECEA]/50">
                <span className="col-span-5">Sub-Basin</span>
                <span className="col-span-2 text-right">Urgency</span>
                <span className="col-span-2 text-right">Gauge Δ</span>
                <span className="col-span-3 text-right">Dispatch</span>
              </div>
              <div className="divide-y divide-[#E2ECEA]/10">
                {activeUjaan.basins.map((basin, idx) => (
                  <div
                    key={basin.id}
                    className="grid grid-cols-12 items-baseline py-4 transition-colors duration-200"
                  >
                    <div className="col-span-5 pr-3">
                      <span className="font-serif text-xl leading-none text-[#E2ECEA]">
                        {basin.name}
                      </span>
                      <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[#E2ECEA]/45 sm:inline">
                        {basin.district}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm tabular-nums">
                      <span
                        className={cn(
                          idx === 0 ? 'text-[#D9822B]' : 'text-[#E2ECEA]/85'
                        )}
                      >
                        {(basin.urgency * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-xs text-[#E2ECEA]/70 tabular-nums">
                      {basin.waterDeltaCm}
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs tabular-nums">
                      <span className="text-[#E2ECEA]">
                        {basin.harvesters} units
                      </span>
                      <span className="block text-[10px] text-[#E2ECEA]/50">
                        {basin.windowLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 02 · OTTOBUDGET — Archival Vellum (#EDE7DA / #141615 / #2E6F5E)    */}
      {/* ================================================================== */}
      <section
        id="chapter-ottobudget"
        aria-labelledby="heading-ottobudget"
        className="w-full bg-[#EDE7DA] py-24 text-[#141615] lg:py-36"
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left photographic plate on travertine stone */}
            <div className="lg:col-span-7">
              <ParallaxFrame
                distance={24}
                className="aspect-[4/3] w-full bg-[#DDD6C7]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/plate-ottobudget.jpg"
                  alt="Minimalist matte-black Android smartphone resting on warm travertine stone"
                  className="h-full w-full object-cover object-center"
                />
              </ParallaxFrame>
            </div>

            {/* Right daylight editorial spread + Press-and-Hold Stealth Vault */}
            <div className="lg:col-span-5">
              <ClipReveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#2E6F5E]">
                  02 · Native Android · Kotlin &amp; Compose
                </p>
              </ClipReveal>
              <ClipReveal delay={80}>
                <h2
                  id="heading-ottobudget"
                  className="mt-3 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.02em] sm:text-6xl"
                >
                  OttoBudget
                </h2>
              </ClipReveal>

              <p className="mt-5 text-sm leading-relaxed text-[#141615]/75 sm:text-base">
                Offline-first personal finance engine capturing bKash, Nagad,
                Rocket, and bank notifications without SMS permissions, backed
                up as a single zero-schema AES-256-GCM blob (
                <span className="font-mono text-xs">vault.enc</span>).
              </p>

              {/* Press-and-Hold Stealth Vault Gesture Control */}
              <div className="mt-8 border-t border-[#141615]/15 pt-7">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#141615]/55">
                    AES-256-GCM Savings Vault
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#2E6F5E]">
                    {stealthLocked ? (
                      <>
                        <Lock aria-hidden="true" className="h-3 w-3" />
                        Stealth Active
                      </>
                    ) : (
                      <>
                        <Unlock aria-hidden="true" className="h-3 w-3" />
                        Vault Revealed
                      </>
                    )}
                  </span>
                </div>

                {/* Quiet BDT balance readout directly on warm vellum paper */}
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#141615]/50">
                      Protected Reserve
                    </p>
                    <p
                      className={cn(
                        'mt-1 font-serif text-4xl leading-none tracking-[-0.02em] tabular-nums transition-[filter,opacity] duration-300 sm:text-5xl',
                        stealthLocked
                          ? 'select-none opacity-60 blur-[7px]'
                          : 'opacity-100 blur-0'
                      )}
                    >
                      ৳1,48,620
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#141615]/50">
                      7-Day Spend
                    </p>
                    <p
                      className={cn(
                        'mt-1 font-mono text-lg font-medium tabular-nums transition-[filter,opacity] duration-300',
                        stealthLocked
                          ? 'select-none opacity-60 blur-[6px]'
                          : 'opacity-100 blur-0'
                      )}
                    >
                      ৳5,030
                    </p>
                  </div>
                </div>

                {/* Proportional 7-day bar strip anchored strictly to ৳0 */}
                <div
                  aria-label="7-day proportional spending strip anchored at zero BDT"
                  className="mt-7"
                >
                  <div className="flex h-20 items-end justify-between gap-2 border-b border-[#141615]/20 pb-1">
                    {OTTO_7DAY_SPEND.map((entry) => {
                      const heightPct = (entry.bdt / OTTO_MAX_SPEND) * 100;
                      return (
                        <div
                          key={entry.day}
                          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                        >
                          <div
                            className={cn(
                              'w-full max-w-[26px] transition-all duration-300 ease-out',
                              stealthLocked
                                ? 'bg-[#141615]/22 blur-[2px]'
                                : 'bg-[#2E6F5E]'
                            )}
                            style={{
                              height: `${Math.max(8, heightPct).toFixed(1)}%`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.08em] text-[#141615]/55">
                    {OTTO_7DAY_SPEND.map((entry) => (
                      <span key={entry.day} className="flex-1 text-center">
                        {entry.day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tactile Press-and-Hold (450ms) or Click Gesture Button */}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onPointerDown={handleVaultPointerDown}
                    onPointerUp={handleVaultPointerUp}
                    onPointerLeave={handleVaultPointerCancel}
                    onPointerCancel={handleVaultPointerCancel}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setStealthLocked((prev) => !prev);
                      }
                    }}
                    aria-pressed={!stealthLocked}
                    className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[#141615]/25 bg-transparent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#141615] transition-colors duration-200 hover:border-[#2E6F5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6F5E]"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 bg-[#2E6F5E]/20"
                      style={{ width: `${(holdProgress * 100).toFixed(1)}%` }}
                    />
                    {stealthLocked ? (
                      <Eye aria-hidden="true" className="relative h-3.5 w-3.5 text-[#2E6F5E]" />
                    ) : (
                      <EyeOff aria-hidden="true" className="relative h-3.5 w-3.5 text-[#2E6F5E]" />
                    )}
                    <span className="relative">
                      {stealthLocked
                        ? 'Hold 450ms or Click to Reveal'
                        : 'Lock Stealth Mode'}
                    </span>
                  </button>

                  <Link
                    href="/work/ottobudget"
                    className="group inline-flex items-center gap-2 border-b border-[#141615]/40 pb-1 font-mono text-xs uppercase tracking-[0.14em] text-[#141615] transition-colors duration-200 hover:border-[#2E6F5E] hover:text-[#2E6F5E]"
                  >
                    <span>Explore OttoBudget</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 03 · VELLUM — Vellum Ink (#1A1D1B / #E8DFC9 / #8B5E46)             */}
      {/* ================================================================== */}
      <section
        id="chapter-vellum"
        aria-labelledby="heading-vellum"
        className="w-full bg-[#1A1D1B] py-24 text-[#E8DFC9] lg:py-36"
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <ClipReveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8B5E46]">
                  03 · Programmatic Cinema · Release VLM-2026-001
                </p>
              </ClipReveal>
              <ClipReveal delay={80}>
                <h2
                  id="heading-vellum"
                  className="mt-3 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
                >
                  Vellum{' '}
                  <span className="italic text-[#E8DFC9]/65">
                    Qurrat al-Ayn
                  </span>
                </h2>
              </ClipReveal>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className="text-sm leading-relaxed text-[#E8DFC9]/72 sm:text-base lg:ml-auto lg:max-w-md">
                Independent vocal-nasheed archive authored in code: Remotion
                v3.0 with ANGLE GPU rasterization and libx264 CRF 18 mastering
                across 9 style-locked scenes and 3 vertical Shorts.
              </p>
            </div>
          </div>
        </div>

        {/* Edge-to-edge 21:9 theatrical letterboxed plate + 3-layer Bezier silk-ribbon Canvas */}
        <div className="relative w-full overflow-hidden border-y border-[#E8DFC9]/12 bg-[#111312]">
          <div className="relative aspect-[21/9] w-full min-h-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/plate-vellum.jpg"
              alt="21:9 theatrical chiaroscuro silhouette overlooking misty cypress hills"
              className="h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1D1B]/60 via-transparent to-[#1A1D1B]/35"
            />

            {/* Live transparent 3-layer Bezier silk-ribbon visualizer */}
            <VellumRibbonCanvas paused={vellumPaused} />

            {/* Quiet floating Pause / Resume button */}
            <button
              type="button"
              onClick={() => setVellumPaused((prev) => !prev)}
              aria-pressed={vellumPaused}
              className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border border-[#E8DFC9]/28 bg-[#1A1D1B]/72 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#E8DFC9] backdrop-blur-md transition-colors duration-200 hover:border-[#E8DFC9]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E46] sm:bottom-6 sm:right-8"
            >
              {vellumPaused ? (
                <>
                  <Play aria-hidden="true" className="h-3 w-3" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause aria-hidden="true" className="h-3 w-3" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Colophon strip + case study link */}
        <div className="mx-auto mt-10 flex max-w-[1440px] flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#E8DFC9]/55">
            <span>Remotion v3.0 · --gl=angle</span>
            <span>libx264 CRF 18</span>
            <span>Words, given voice</span>
          </div>

          <Link
            href="/work/vellum"
            className="group inline-flex items-center gap-2 border-b border-[#8B5E46]/70 pb-1 font-mono text-xs uppercase tracking-[0.14em] text-[#E8DFC9] transition-colors duration-200 hover:border-[#E8DFC9]"
          >
            <span>Inspect the Vellum pipeline</span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 04 · MESS MANAGER — Raw Chalk (#F6F3EC / #1C1F1E / #46564B)        */}
      {/* ================================================================== */}
      <section
        id="chapter-mess-manager"
        aria-labelledby="heading-mess-manager"
        className="w-full bg-[#F6F3EC] py-24 text-[#1C1F1E] lg:py-36"
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left printed-ledger editorial spread + TactileScrubber */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <ClipReveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#46564B]">
                  04 · Exact-Paisa Accounting · Hamilton Method
                </p>
              </ClipReveal>
              <ClipReveal delay={80}>
                <h2
                  id="heading-mess-manager"
                  className="mt-3 font-serif text-5xl font-normal leading-[0.95] tracking-[-0.02em] sm:text-6xl"
                >
                  Mess Manager
                </h2>
              </ClipReveal>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#1C1F1E]/75 sm:text-base">
                Period-scoped hostel accounting in Kotlin and Jetpack Compose.
                Every taka is stored as integer paisa and reconciled via the
                Hamilton Largest-Remainder method so monthly settlements never
                drift by even a single paisa.
              </p>

              {/* Machined brass-indicator fader adjusting total monthly bazar BDT */}
              <div className="mt-8 border-t border-[#1C1F1E]/15 pt-7">
                <TactileScrubber
                  tone="light"
                  label="Monthly Bazar Pool (BDT)"
                  value={bazarBdt}
                  min={6000}
                  max={28000}
                  step={50}
                  onChange={setBazarBdt}
                  formattedValue={formatWholeBdt(bazarBdt)}
                  valueText={`${bazarBdt} Bangladeshi Taka`}
                  minLabel="৳6,000"
                  maxLabel="৳28,000"
                />

                {/* Crisp printed-ledger allocation sheet */}
                <div className="mt-8">
                  <div className="grid grid-cols-12 border-b border-[#1C1F1E]/22 pb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#1C1F1E]/55">
                    <span className="col-span-5">Member</span>
                    <span className="col-span-2 text-right">Meals</span>
                    <span className="col-span-5 text-right">Exact Share</span>
                  </div>

                  <div className="divide-y divide-[#1C1F1E]/12">
                    {hamilton.rows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-12 items-baseline py-3.5"
                      >
                        <div className="col-span-5 pr-2">
                          <span className="font-serif text-lg leading-none text-[#1C1F1E]">
                            {row.name}
                          </span>
                        </div>
                        <div className="col-span-2 text-right font-mono text-xs text-[#1C1F1E]/65 tabular-nums">
                          {row.meals}
                        </div>
                        <div className="col-span-5 flex items-baseline justify-end gap-2 font-mono text-sm text-[#1C1F1E] tabular-nums">
                          {row.receivedRemainder && (
                            <span
                              title="Allocated +1 paisa via largest remainder"
                              className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#46564B]"
                            >
                              +1p
                            </span>
                          )}
                          <span className="font-medium">
                            {formatBdtFromPaisa(row.sharePaisa)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reconciliation footer line — zero debug syntax */}
                  <div className="mt-1 flex flex-wrap items-baseline justify-between gap-4 border-t border-[#1C1F1E]/35 pt-3.5 font-mono text-xs tabular-nums">
                    <span className="text-[#46564B]">
                      {hamilton.totalMeals} meals · Rate{' '}
                      {formatBdtFromPaisa(Math.round(hamilton.mealRatePaisa))} ·
                      Reconciled to ৳0.00 drift
                    </span>
                    <span className="font-medium text-[#1C1F1E]">
                      {formatBdtFromPaisa(hamilton.sumPaisa)}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/work/mess-manager"
                    className="group inline-flex items-center gap-2 border-b border-[#1C1F1E]/40 pb-1 font-mono text-xs uppercase tracking-[0.14em] text-[#1C1F1E] transition-colors duration-200 hover:border-[#46564B] hover:text-[#46564B]"
                  >
                    <span>Read the Mess Manager ledger spec</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right overhead cotton paper + brass ruler plate */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <ParallaxFrame
                distance={24}
                className="aspect-[4/3] w-full bg-[#EAE4D7]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/plate-mess-manager.jpg"
                  alt="Overhead view of warm chalk cotton paper with a brushed-brass ruler and matte graphite pen"
                  className="h-full w-full object-cover object-center"
                />
              </ParallaxFrame>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
