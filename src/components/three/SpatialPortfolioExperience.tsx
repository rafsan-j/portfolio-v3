'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as THREE from 'three';
import {
  ArrowUpRight,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Pause,
  Play,
  Unlock,
} from 'lucide-react';
import { PROFILE } from '@/content/profile';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { TactileScrubber } from '@/components/controls/SculpturalControls';
import { cn } from '@/lib/utils';
import type {
  StudioMood,
  UjaanScenario,
  WorldHandle,
} from '@/components/three/worlds/types';
import { createSylhetStudioWorld } from '@/components/three/worlds/SylhetStudioWorld';
import { createUjaanTerrainWorld } from '@/components/three/worlds/UjaanTerrainWorld';
import { createOttoVaultWorld } from '@/components/three/worlds/OttoVaultWorld';
import { createVellumRibbonsWorld } from '@/components/three/worlds/VellumRibbonsWorld';
import { createMessLedgerWorld } from '@/components/three/worlds/MessLedgerWorld';

/* ========================================================================== */
/* CHAPTER CONFIGURATION & CAMERA CHOREOGRAPHY                                */
/* ========================================================================== */

interface ChapterConfig {
  id: string;
  index: string;
  shortLabel: string;
  fogHex: string;
  stopT: number;
}

const CHAPTERS: readonly ChapterConfig[] = [
  {
    id: 'studio',
    index: '01',
    shortLabel: 'Studio',
    fogHex: '#090C0E',
    stopT: 0.0,
  },
  {
    id: 'ujaan',
    index: '02',
    shortLabel: 'Ujaan',
    fogHex: '#081318',
    stopT: 0.2,
  },
  {
    id: 'ottobudget',
    index: '03',
    shortLabel: 'OttoBudget',
    fogHex: '#0B0F10',
    stopT: 0.4,
  },
  {
    id: 'vellum',
    index: '04',
    shortLabel: 'Vellum',
    fogHex: '#121413',
    stopT: 0.6,
  },
  {
    id: 'mess-manager',
    index: '05',
    shortLabel: 'Mess',
    fogHex: '#0F1110',
    stopT: 0.8,
  },
  {
    id: 'contact',
    index: '06',
    shortLabel: 'Contact',
    fogHex: '#080A0B',
    stopT: 1.0,
  },
] as const;

const STUDIO_MOODS: { id: StudioMood; label: string }[] = [
  { id: 'midnight', label: 'Midnight' },
  { id: 'monsoon', label: 'Monsoon' },
  { id: 'dawn', label: 'Dawn' },
];

/* ========================================================================== */
/* DOMAIN DATA: UJAAN FLOOD SCENARIOS & MESS HAMILTON LEDGER                  */
/* ========================================================================== */

interface SubBasinReadout {
  id: string;
  name: string;
  urgency: number;
  deltaCm: string;
  harvesters: number;
  status: string;
}

const UJAAN_DATA: Record<
  UjaanScenario,
  {
    label: string;
    solverMs: number;
    summary: string;
    basins: SubBasinReadout[];
  }
> = {
  normal: {
    label: 'Monsoon Normal',
    solverMs: 118,
    summary:
      'Steady Surma–Kushiyara gauge readings; routine Sentinel-1 SAR cadence.',
    basins: [
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        urgency: 64,
        deltaCm: '+14 cm',
        harvesters: 5,
        status: '48h clear',
      },
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        urgency: 52,
        deltaCm: '+9 cm',
        harvesters: 3,
        status: '62h clear',
      },
      {
        id: 'hakaluki',
        name: 'Hakaluki Haor',
        urgency: 41,
        deltaCm: '+6 cm',
        harvesters: 2,
        status: '72h clear',
      },
    ],
  },
  surge: {
    label: 'Flash Surge',
    solverMs: 164,
    summary:
      'Meghalaya upland runoff spike; CP-SAT reroutes combine harvesters north.',
    basins: [
      {
        id: 'shanir',
        name: 'Shanir Haor',
        urgency: 94,
        deltaCm: '+68 cm',
        harvesters: 6,
        status: '14h critical',
      },
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        urgency: 88,
        deltaCm: '+54 cm',
        harvesters: 4,
        status: '19h critical',
      },
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        urgency: 71,
        deltaCm: '+31 cm',
        harvesters: 2,
        status: '28h watch',
      },
    ],
  },
  override: {
    label: '6h Override',
    solverMs: 142,
    summary:
      'Missed-call Bangla field intake confirms embankment seepage at Dekhar.',
    basins: [
      {
        id: 'dekhar',
        name: 'Dekhar Haor',
        urgency: 98,
        deltaCm: '+74 cm*',
        harvesters: 7,
        status: '6h TTL override',
      },
      {
        id: 'shanir',
        name: 'Shanir Haor',
        urgency: 85,
        deltaCm: '+49 cm',
        harvesters: 3,
        status: '16h critical',
      },
      {
        id: 'tanguar',
        name: 'Tanguar Haor',
        urgency: 76,
        deltaCm: '+38 cm',
        harvesters: 2,
        status: '24h watch',
      },
    ],
  },
};

const MESS_ROOMMATES = [
  { id: 'rafsan', name: 'Rafsan Jani', meals: 47 },
  { id: 'araf', name: 'Abdullah Al Araf', meals: 42 },
  { id: 'sadiq', name: 'Ahnaf Sadiq', meals: 39 },
  { id: 'shafkat', name: 'Shafkat Ahsan', meals: 35 },
] as const;

interface HamiltonRow {
  id: string;
  name: string;
  meals: number;
  sharePaisa: number;
  receivedRemainder: boolean;
}

function computeHamiltonPaisa(totalBdt: number): {
  totalPaisa: number;
  totalMeals: number;
  mealRateBdt: number;
  sumPaisa: number;
  rows: HamiltonRow[];
} {
  const totalPaisa = Math.round(totalBdt * 100);
  const totalMeals = MESS_ROOMMATES.reduce((acc, m) => acc + m.meals, 0);

  const prelim = MESS_ROOMMATES.map((m, idx) => {
    const numerator = totalPaisa * m.meals;
    return {
      idx,
      id: m.id,
      name: m.name,
      meals: m.meals,
      floorPaisa: Math.floor(numerator / totalMeals),
      remainderNum: numerator % totalMeals,
    };
  });

  const floorSum = prelim.reduce((acc, item) => acc + item.floorPaisa, 0);
  const leftoverPaisa = totalPaisa - floorSum;

  const ranked = [...prelim].sort((a, b) =>
    b.remainderNum !== a.remainderNum
      ? b.remainderNum - a.remainderNum
      : a.idx - b.idx
  );
  const bonusIds = new Set(ranked.slice(0, leftoverPaisa).map((r) => r.id));

  const rows: HamiltonRow[] = prelim.map((item) => {
    const receivedRemainder = bonusIds.has(item.id);
    return {
      id: item.id,
      name: item.name,
      meals: item.meals,
      sharePaisa: item.floorPaisa + (receivedRemainder ? 1 : 0),
      receivedRemainder,
    };
  });

  return {
    totalPaisa,
    totalMeals,
    mealRateBdt: totalPaisa / totalMeals / 100,
    sumPaisa: rows.reduce((acc, r) => acc + r.sharePaisa, 0),
    rows,
  };
}

function formatPaisa(paisa: number): string {
  return `৳${(paisa / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatWholeBdt(bdt: number): string {
  return `৳${bdt.toLocaleString('en-IN')}`;
}

function formatSylhetClock(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return '--:--:--';
  }
}

/* ========================================================================== */
/* TYPED WORLD HANDLES                                                        */
/* ========================================================================== */

interface WorldHandles {
  studio: WorldHandle & { setMood: (mood: StudioMood) => void };
  ujaan: WorldHandle & { setScenario: (scenario: UjaanScenario) => void };
  otto: WorldHandle & { setStealth: (stealth: boolean) => void };
  vellum: WorldHandle & { setPlaying: (playing: boolean) => void };
  mess: WorldHandle & { setPoolBdt: (bdt: number) => void };
}

const MAX_DRAG_RAD = (12 * Math.PI) / 180;
const HOLD_DURATION_MS = 450;

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="slider"], [data-hud-interactive="true"]';

/* ========================================================================== */
/* COMPONENT: SpatialPortfolioExperience                                      */
/* ========================================================================== */

export function SpatialPortfolioExperience() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const worldsRef = useRef<WorldHandles | null>(null);
  const forceRenderRef = useRef<(() => void) | null>(null);

  const [webglFailed, setWebglFailed] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [sylhetTime, setSylhetTime] = useState<string>('');
  const [isDraggingStage, setIsDraggingStage] = useState(false);

  // Interactive 3D world states
  const [studioMood, setStudioMood] = useState<StudioMood>('midnight');
  const [ujaanScenario, setUjaanScenario] = useState<UjaanScenario>('surge');
  const [stealthLocked, setStealthLocked] = useState<boolean>(true);
  const [vellumPlaying, setVellumPlaying] = useState<boolean>(true);
  const [messPoolBdt, setMessPoolBdt] = useState<number>(14500);

  // OttoBudget press-and-hold vault state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdCompletedRef = useRef(false);

  // Live Sylhet clock (Asia/Dhaka)
  useEffect(() => {
    setSylhetTime(formatSylhetClock(new Date()));
    const interval = window.setInterval(() => {
      setSylhetTime(formatSylhetClock(new Date()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Sync React controls -> 3D worlds
  useEffect(() => {
    worldsRef.current?.studio.setMood(studioMood);
    forceRenderRef.current?.();
  }, [studioMood]);

  useEffect(() => {
    worldsRef.current?.ujaan.setScenario(ujaanScenario);
    forceRenderRef.current?.();
  }, [ujaanScenario]);

  useEffect(() => {
    worldsRef.current?.otto.setStealth(stealthLocked);
    forceRenderRef.current?.();
  }, [stealthLocked]);

  useEffect(() => {
    worldsRef.current?.vellum.setPlaying(vellumPlaying);
    forceRenderRef.current?.();
  }, [vellumPlaying]);

  useEffect(() => {
    worldsRef.current?.mess.setPoolBdt(messPoolBdt);
    forceRenderRef.current?.();
  }, [messPoolBdt]);

  // Press-and-hold cleanup
  const cancelVaultHold = useCallback(() => {
    if (holdRafRef.current !== null) {
      window.cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

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
      const pct = Math.min(1, (now - holdStartRef.current) / HOLD_DURATION_MS);
      setHoldProgress(pct);
      if (pct >= 1) {
        holdCompletedRef.current = true;
        setStealthLocked((prev) => !prev);
        cancelVaultHold();
        return;
      }
      holdRafRef.current = window.requestAnimationFrame(step);
    };

    holdRafRef.current = window.requestAnimationFrame(step);
  };

  const handleVaultPointerUp = () => {
    if (holdStartRef.current !== null && !holdCompletedRef.current) {
      // Quick click also toggles vault cleanly
      setStealthLocked((prev) => !prev);
    }
    cancelVaultHold();
  };

  // Smooth chapter teleport
  const teleportToChapter = useCallback((chapterIndex: number) => {
    const chapter = CHAPTERS[chapterIndex];
    if (!chapter) return;
    const el = document.getElementById(chapter.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Main Three.js WebGL Stage & 6-Chapter Camera Flight
  useEffect(() => {
    const container = stageRef.current;
    if (!container) return;

    // Probe WebGL support safely before initializing Three.js
    const probeCanvas = document.createElement('canvas');
    const hasWebGL = Boolean(
      probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl') ||
        probeCanvas.getContext('experimental-webgl')
    );
    if (!hasWebGL) {
      setWebglFailed(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    let reducedMotion = reducedMotionQuery.matches;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const fogColors = CHAPTERS.map((ch) => new THREE.Color(ch.fogHex));
    const blendedFogColor = fogColors[0].clone();
    const fog = new THREE.FogExp2(blendedFogColor.getHex(), 0.022);
    scene.fog = fog;
    scene.background = blendedFogColor;

    // Subtle global atmospheric fill so transitions between worlds stay cohesive
    const globalHemi = new THREE.HemisphereLight(0xdbe6ef, 0x0b0d0e, 0.28);
    scene.add(globalHemi);

    const camera = new THREE.PerspectiveCamera(
      44,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      190
    );

    // Build all 5 3D worlds at their spatial coordinates
    const studioWorld = createSylhetStudioWorld();
    const ujaanWorld = createUjaanTerrainWorld();
    const ottoWorld = createOttoVaultWorld();
    const vellumWorld = createVellumRibbonsWorld();
    const messWorld = createMessLedgerWorld();

    scene.add(studioWorld.group);
    scene.add(ujaanWorld.group);
    scene.add(ottoWorld.group);
    scene.add(vellumWorld.group);
    scene.add(messWorld.group);

    // Sync initial control states immediately
    studioWorld.setMood(studioMood);
    ujaanWorld.setScenario(ujaanScenario);
    ottoWorld.setStealth(stealthLocked);
    vellumWorld.setPlaying(vellumPlaying);
    messWorld.setPoolBdt(messPoolBdt);

    const handles: WorldHandles = {
      studio: studioWorld,
      ujaan: ujaanWorld,
      otto: ottoWorld,
      vellum: vellumWorld,
      mess: messWorld,
    };
    worldsRef.current = handles;

    const worldList: { handle: WorldHandle; stopT: number }[] = [
      { handle: studioWorld, stopT: 0.0 },
      { handle: ujaanWorld, stopT: 0.2 },
      { handle: ottoWorld, stopT: 0.4 },
      { handle: vellumWorld, stopT: 0.6 },
      { handle: messWorld, stopT: 0.8 },
    ];

    // Smooth CatmullRomCurve3 camera & lookAt flight paths across all 6 chapters
    // Offset slightly left in X so 3D sculptures frame cleanly in open center-right on desktop
    const posCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-1.35, 1.95, 6.2), // 01 Sylhet Studio (0, 0, 0)
        new THREE.Vector3(-1.75, -10.8, -14.8), // 02 Ujaan Terrain (0, -14, -22)
        new THREE.Vector3(-1.4, -26.2, -37.2), // 03 OttoBudget Vault (0, -28, -44)
        new THREE.Vector3(-1.55, -40.5, -58.8), // 04 Vellum Ribbons (0, -42, -66)
        new THREE.Vector3(-1.55, -53.5, -80.6), // 05 Mess Ledger (0, -56, -88)
        new THREE.Vector3(6.2, -45.5, -72.0), // 06 Contact wide orbital finale
      ],
      false,
      'catmullrom',
      0.5
    );

    const lookCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.75, 0.35, 0.0), // 01 Studio
        new THREE.Vector3(-0.7, -14.0, -22.0), // 02 Ujaan
        new THREE.Vector3(-0.65, -28.0, -44.0), // 03 OttoBudget
        new THREE.Vector3(-0.65, -42.0, -66.0), // 04 Vellum
        new THREE.Vector3(-0.7, -55.5, -88.0), // 05 Mess
        new THREE.Vector3(0.0, -54.5, -88.0), // 06 Contact finale focus
      ],
      false,
      'catmullrom',
      0.5
    );

    // Reusable math scratch vectors (zero per-frame heap allocations)
    const camPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const viewOffset = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const rightAxis = new THREE.Vector3();

    // Scroll, pointer parallax, and ±12° drag look-around state
    let targetScroll = 0;
    let smoothScroll = 0;
    let lastReportedChapter = 0;

    const pointer = { x: 0, y: 0 };
    const smoothPointer = { x: 0, y: 0 };

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragBaseYaw = 0;
    let dragBasePitch = 0;
    let targetDragYaw = 0;
    let targetDragPitch = 0;
    let currentDragYaw = 0;
    let currentDragPitch = 0;

    const computeScrollProgress = () => {
      const scroller = scrollContainerRef.current;
      if (!scroller) return 0;
      const rect = scroller.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const syncScroll = () => {
      targetScroll = computeScrollProgress();
      const idx = Math.min(
        CHAPTERS.length - 1,
        Math.max(0, Math.round(targetScroll * (CHAPTERS.length - 1)))
      );
      if (idx !== lastReportedChapter) {
        lastReportedChapter = idx;
        setActiveChapter(idx);
      }
      if (reducedMotion) {
        renderFrame(0, true);
      }
    };

    targetScroll = computeScrollProgress();
    smoothScroll = targetScroll;

    let rafId: number | null = null;
    let lastNow = performance.now();
    let elapsed = 0;

    const renderFrame = (dt: number, snap = false) => {
      const clampedDt = Math.min(0.05, Math.max(0, dt));
      if (!reducedMotion) {
        elapsed += clampedDt;
      }

      // Frame-rate-independent damped scroll interpolation
      const scrollDamp = snap || reducedMotion ? 1 : 1 - Math.exp(-6.2 * clampedDt);
      smoothScroll += (targetScroll - smoothScroll) * scrollDamp;

      // Damped pointer parallax
      const ptrDamp = snap || reducedMotion ? 1 : 1 - Math.exp(-5.0 * clampedDt);
      smoothPointer.x += (pointer.x - smoothPointer.x) * ptrDamp;
      smoothPointer.y += (pointer.y - smoothPointer.y) * ptrDamp;

      // Elastic spring-back for pointer-drag look-around when released
      if (!dragging && !reducedMotion) {
        const decay = Math.exp(-1.7 * clampedDt);
        targetDragYaw *= decay;
        targetDragPitch *= decay;
      }
      const dragDamp = snap || reducedMotion ? 1 : 1 - Math.exp(-9.5 * clampedDt);
      currentDragYaw += (targetDragYaw - currentDragYaw) * dragDamp;
      currentDragPitch += (targetDragPitch - currentDragPitch) * dragDamp;

      // Interpolate atmospheric FogExp2 & background per chapter
      const scaled = smoothScroll * (CHAPTERS.length - 1);
      const segIdx = Math.min(CHAPTERS.length - 2, Math.floor(scaled));
      const segFrac = scaled - segIdx;
      blendedFogColor.copy(fogColors[segIdx]).lerp(fogColors[segIdx + 1], segFrac);
      fog.color.copy(blendedFogColor);

      // Sample CatmullRomCurve3 camera path
      const clampedT = Math.min(1, Math.max(0, smoothScroll));
      posCurve.getPoint(clampedT, camPos);
      lookCurve.getPoint(clampedT, lookTarget);

      // On narrow viewports, recenter X framing slightly so sculptures sit cleanly behind mobile cards
      if (window.innerWidth < 768) {
        camPos.x *= 0.35;
        lookTarget.x *= 0.25;
      }

      // Dramatic wide orbital drift on Chapter 06 (Contact)
      const contactBlend = Math.max(0, Math.min(1, (clampedT - 0.84) / 0.16));
      if (contactBlend > 0.001 && !reducedMotion) {
        const orbitEase = contactBlend * contactBlend * (3 - 2 * contactBlend);
        const angle = elapsed * 0.22;
        camPos.x += Math.sin(angle) * 4.2 * orbitEase;
        camPos.y += Math.cos(angle * 0.7) * 1.4 * orbitEase;
        camPos.z += (Math.cos(angle) - 1) * 2.6 * orbitEase;
      }

      // Apply subtle pointer parallax + ±12° drag look-around around lookTarget
      const parallaxYaw = reducedMotion ? 0 : -smoothPointer.x * 0.035;
      const parallaxPitch = reducedMotion ? 0 : smoothPointer.y * 0.022;
      const totalYaw = Math.max(
        -MAX_DRAG_RAD * 1.15,
        Math.min(MAX_DRAG_RAD * 1.15, currentDragYaw + parallaxYaw)
      );
      const totalPitch = Math.max(
        -MAX_DRAG_RAD * 1.15,
        Math.min(MAX_DRAG_RAD * 1.15, currentDragPitch + parallaxPitch)
      );

      viewOffset.subVectors(camPos, lookTarget);
      viewOffset.applyAxisAngle(upAxis, totalYaw);
      rightAxis.crossVectors(upAxis, viewOffset).normalize();
      if (rightAxis.lengthSq() > 0.0001) {
        viewOffset.applyAxisAngle(rightAxis, totalPitch);
      }
      camera.position.copy(lookTarget).add(viewOffset);
      camera.lookAt(lookTarget);

      // Update each of the 5 3D worlds with its smooth proximity activeWeight
      for (let i = 0; i < worldList.length; i += 1) {
        const entry = worldList[i];
        const dist = Math.abs(clampedT - entry.stopT);
        const proximity = Math.max(0, 1 - dist / 0.24);
        const activeWeight = Math.min(1, Math.max(proximity, contactBlend * 0.25));
        entry.handle.update(
          elapsed,
          reducedMotion ? 0 : clampedDt,
          smoothPointer,
          activeWeight
        );
      }

      renderer.render(scene, camera);
    };

    forceRenderRef.current = () => {
      if (reducedMotion) {
        renderFrame(0, true);
      }
    };

    const tick = (now: number) => {
      if (document.hidden || reducedMotion) {
        rafId = null;
        return;
      }
      const dt = (now - lastNow) / 1000;
      lastNow = now;
      renderFrame(dt, false);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (reducedMotion) {
        renderFrame(0, true);
        return;
      }
      if (rafId === null && !document.hidden) {
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(w, h);
      if (reducedMotion) {
        renderFrame(0, true);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      pointer.x = (e.clientX / w) * 2 - 1;
      pointer.y = -((e.clientY / h) * 2 - 1);

      if (dragging) {
        const dx = (e.clientX - dragStartX) / w;
        const dy = (e.clientY - dragStartY) / h;
        targetDragYaw = Math.max(
          -MAX_DRAG_RAD,
          Math.min(MAX_DRAG_RAD, dragBaseYaw - dx * MAX_DRAG_RAD * 2.4)
        );
        targetDragPitch = Math.max(
          -MAX_DRAG_RAD,
          Math.min(MAX_DRAG_RAD, dragBasePitch + dy * MAX_DRAG_RAD * 2.4)
        );
        if (reducedMotion) {
          currentDragYaw = targetDragYaw;
          currentDragPitch = targetDragPitch;
          renderFrame(0, true);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) return;

      dragging = true;
      setIsDraggingStage(true);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragBaseYaw = targetDragYaw;
      dragBasePitch = targetDragPitch;
    };

    const handlePointerUp = () => {
      if (!dragging) return;
      dragging = false;
      setIsDraggingStage(false);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        stopLoop();
        renderFrame(0, true);
      } else {
        startLoop();
      }
    };

    window.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Initial frame + start loop
    renderFrame(0, true);
    startLoop();

    return () => {
      stopLoop();
      forceRenderRef.current = null;
      worldsRef.current = null;

      window.removeEventListener('scroll', syncScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotionQuery.removeEventListener(
        'change',
        handleReducedMotionChange
      );

      studioWorld.dispose();
      ujaanWorld.dispose();
      ottoWorld.dispose();
      vellumWorld.dispose();
      messWorld.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // Initial world states are synced via dedicated effects above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeUjaan = UJAAN_DATA[ujaanScenario];
  const hamilton = useMemo(
    () => computeHamiltonPaisa(messPoolBdt),
    [messPoolBdt]
  );

  const glassCardClass =
    'pointer-events-auto w-full max-w-[448px] rounded-2xl border border-[#EDE7DA]/14 bg-[#0B0E0F]/72 p-6 sm:p-7 text-[#EDE7DA] backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.55)]';

  return (
    <div
      className={cn(
        'relative w-full text-[#EDE7DA]',
        isDraggingStage ? 'cursor-grabbing select-none' : 'cursor-grab'
      )}
    >
      {/* Fixed Full-Viewport 3D WebGL Stage */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 overflow-hidden bg-[#090C0E]"
      >
        {webglFailed && (
          <div className="relative h-full w-full">
            {/* Graceful fallback when WebGL is unavailable */}
            <Image
              src="/media/hero-sylhet-studio.jpg"
              alt="Rafsan Jani Living Sylhet Studio archival still"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, rgba(9,12,14,0.92) 0%, rgba(9,12,14,0.62) 48%, rgba(9,12,14,0.78) 100%)',
              }}
            />
            <div className="fixed right-6 top-20 z-20 rounded-full border border-[#EDE7DA]/15 bg-[#0B0E0F]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A9891] backdrop-blur-md">
              WebGL unavailable · Archival still
            </div>
          </div>
        )}
      </div>

      {/* Subtle Ambient Vignette for Edge Legibility Without Obscuring Centerpiece */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(85% 75% at 62% 48%, rgba(9,12,14,0) 35%, rgba(7,9,10,0.48) 100%)',
        }}
      />

      {/* Quiet Stage Orbit Hint (Desktop Bottom-Right) */}
      {!webglFailed && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-6 right-6 z-20 hidden lg:flex items-center gap-2 rounded-full border border-[#EDE7DA]/12 bg-[#0B0E0F]/60 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#EDE7DA]/60 backdrop-blur-md"
        >
          <Compass className="h-3.5 w-3.5 text-[#D99B52]" />
          <span>Drag stage to orbit ±12°</span>
        </div>
      )}

      {/* 6-Chapter Scroll-Choreographed Editorial HUD Track */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 min-h-[600vh] pointer-events-none"
      >
        {/* ================================================================ */}
        {/* CHAPTER 01 · LIVING SYLHET STUDIO                                */}
        {/* ================================================================ */}
        <section
          id="studio"
          aria-labelledby="chapter-studio-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div
            data-hud-interactive="true"
            className={cn(glassCardClass, 'max-w-[470px]')}
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#D99B52]">01 · Living Sylhet Studio</span>
              <span className="inline-flex items-center gap-2 text-[#EDE7DA]/75 tnum">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D99B52]" />
                SYLHET {sylhetTime || '21:00:00'} BST
              </span>
            </div>

            <h1
              id="chapter-studio-heading"
              className="mt-5 font-serif font-light text-[46px] sm:text-[58px] leading-[0.92] tracking-[-0.02em] text-[#EDE7DA]"
            >
              RAFSAN JANI
            </h1>

            <p className="mt-4 text-[14.5px] leading-[1.68] text-[#EDE7DA]/78">
              Computer Science &amp; Engineering at{' '}
              <span className="text-[#EDE7DA] font-medium">SUST</span>. Building
              offline-first native Android engines, civic AI systems, and
              procedural Three.js software from a rainy desk in Sylhet.
            </p>

            {/* 3D Mood Switch */}
            <div className="mt-5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9891] mb-2">
                3D Studio Atmosphere
              </span>
              <div
                role="group"
                aria-label="3D Studio lighting mood"
                className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#EDE7DA]/12 bg-[#07090A]/70 p-1"
              >
                {STUDIO_MOODS.map((m) => {
                  const active = studioMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setStudioMood(m.id)}
                      aria-pressed={active}
                      className={cn(
                        'tactile-press rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                        active
                          ? 'bg-[#D99B52] text-[#0E100F] font-medium'
                          : 'text-[#EDE7DA]/70 hover:text-[#EDE7DA] hover:bg-white/5'
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="tactile-press inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#EDE7DA] px-5 py-2.5 text-sm font-medium text-[#0E100F] transition-colors hover:bg-[#D99B52]"
              >
                <span>Enter Full Free-Roam 3D Desk</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAPTER 02 · UJAAN (উজান)                                       */}
        {/* ================================================================ */}
        <section
          id="ujaan"
          aria-labelledby="chapter-ujaan-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div data-hud-interactive="true" className={glassCardClass}>
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#56B6C2]">02 · Civic AI · Haor Basin</span>
              <span className="text-[#EDE7DA]/65 tnum">
                CP-SAT {activeUjaan.solverMs} ms
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <h2
                id="chapter-ujaan-heading"
                className="font-serif font-light text-[40px] sm:text-[46px] leading-[0.98] tracking-[-0.02em] text-[#EDE7DA]"
              >
                Ujaan
              </h2>
              <span className="font-serif text-xl text-[#D99B52]/90">উজান</span>
            </div>

            <p className="mt-2.5 text-[14px] leading-[1.64] text-[#EDE7DA]/75">
              {activeUjaan.summary}
            </p>

            {/* 3-State Floodwater Scenario Switch */}
            <div className="mt-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9891] mb-2">
                3D Floodwater Scenario
              </span>
              <div
                role="group"
                aria-label="Ujaan floodwater scenario"
                className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#EDE7DA]/12 bg-[#070E12]/75 p-1"
              >
                {(
                  [
                    { id: 'normal', label: 'Monsoon Normal' },
                    { id: 'surge', label: 'Flash Surge' },
                    { id: 'override', label: '6h Override' },
                  ] as const
                ).map((item) => {
                  const active = ujaanScenario === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUjaanScenario(item.id)}
                      aria-pressed={active}
                      className={cn(
                        'tactile-press rounded-lg px-2 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors leading-tight',
                        active
                          ? 'bg-[#D99B52] text-[#0E100F] font-medium'
                          : 'text-[#EDE7DA]/70 hover:text-[#EDE7DA] hover:bg-white/5'
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Sub-Basin Urgency Readout */}
            <div className="mt-4 space-y-2 rounded-xl border border-[#EDE7DA]/10 bg-[#070D11]/70 p-3.5">
              {activeUjaan.basins.map((basin) => (
                <div
                  key={basin.id}
                  className="flex items-center justify-between gap-2 text-xs font-mono tnum"
                >
                  <div className="min-w-0">
                    <span className="text-[#EDE7DA]">{basin.name}</span>
                    <span className="ml-2 text-[10px] text-[#9A9891]">
                      {basin.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[#EDE7DA]/65">{basin.deltaCm}</span>
                    <span
                      className={cn(
                        'min-w-[36px] text-right font-medium',
                        basin.urgency >= 85
                          ? 'text-[#E69D45]'
                          : 'text-[#6EC6CE]'
                      )}
                    >
                      {basin.urgency}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A9891]">
                Sentinel-1 SAR · FFWC
              </span>
              <Link
                href="/work/ujaan"
                className="tactile-press inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#EDE7DA]/22 bg-white/5 px-4 py-2 text-xs font-medium text-[#EDE7DA] transition-colors hover:bg-[#EDE7DA] hover:text-[#0E100F]"
              >
                <span>Read Case Study</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAPTER 03 · OTTOBUDGET                                          */}
        {/* ================================================================ */}
        <section
          id="ottobudget"
          aria-labelledby="chapter-ottobudget-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div data-hud-interactive="true" className={glassCardClass}>
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#D99B52]">
                03 · Native Android · Vault
              </span>
              <span className="text-[#EDE7DA]/65">Zero-SMS · Room DB</span>
            </div>

            <h2
              id="chapter-ottobudget-heading"
              className="mt-4 font-serif font-light text-[40px] sm:text-[46px] leading-[0.98] tracking-[-0.02em] text-[#EDE7DA]"
            >
              OttoBudget
            </h2>

            <p className="mt-2.5 text-[14px] leading-[1.64] text-[#EDE7DA]/75">
              Offline-first personal finance engine for Kotlin &amp; Jetpack
              Compose with an isolated Savings Vault and zero-permission
              privacy architecture.
            </p>

            {/* Live Masked / Revealed BDT Balance Plate */}
            <div className="mt-4 rounded-xl border border-[#EDE7DA]/12 bg-[#090C0D]/80 p-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A9891]">
                <span>Savings Vault Balance</span>
                <span className="inline-flex items-center gap-1.5 text-[#D99B52]">
                  {stealthLocked ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Stealth Shielded</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Vault Unlocked</span>
                    </>
                  )}
                </span>
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-[28px] tracking-[-0.02em] text-[#EDE7DA] tnum">
                {stealthLocked ? '৳••,•••.••' : '৳42,850.00'}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#9A9891]">
                {stealthLocked
                  ? 'Lattice shield engaged · Balances masked across UI'
                  : 'Emergency reserve + BDT monthly envelope active'}
              </p>
            </div>

            {/* Interactive 3D Stealth Vault Toggle */}
            <button
              type="button"
              onPointerDown={handleVaultPointerDown}
              onPointerUp={handleVaultPointerUp}
              onPointerLeave={cancelVaultHold}
              onPointerCancel={cancelVaultHold}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStealthLocked((prev) => !prev);
                }
              }}
              aria-pressed={!stealthLocked}
              className="tactile-press relative mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#D99B52]/40 bg-[#D99B52]/12 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-[#EDE7DA] transition-colors hover:bg-[#D99B52]/20"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 bg-[#D99B52]/30 transition-[width] duration-75"
                style={{ width: `${Math.round(holdProgress * 100)}%` }}
              />
              <span className="relative z-10 inline-flex items-center gap-2">
                {stealthLocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#D99B52]" />
                    <span>Hold or Click to Unlock Vault</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5 text-[#D99B52]" />
                    <span>Re-Engage Stealth Shield</span>
                  </>
                )}
              </span>
            </button>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A9891]">
                Kotlin · Compose · SQLite
              </span>
              <Link
                href="/work/ottobudget"
                className="tactile-press inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#EDE7DA]/22 bg-white/5 px-4 py-2 text-xs font-medium text-[#EDE7DA] transition-colors hover:bg-[#EDE7DA] hover:text-[#0E100F]"
              >
                <span>Read Case Study</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAPTER 04 · VELLUM                                              */}
        {/* ================================================================ */}
        <section
          id="vellum"
          aria-labelledby="chapter-vellum-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div data-hud-interactive="true" className={glassCardClass}>
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#C9A46C]">
                04 · Procedural Cinema · Remotion
              </span>
              <span className="text-[#EDE7DA]/65">VLM-2026-001</span>
            </div>

            <h2
              id="chapter-vellum-heading"
              className="mt-4 font-serif font-light text-[40px] sm:text-[46px] leading-[0.98] tracking-[-0.02em] text-[#EDE7DA]"
            >
              Vellum
            </h2>

            <p className="mt-1.5 font-serif italic text-lg text-[#C9A46C]">
              Qurrat al-Ayn · VLM-2026-001
            </p>

            <p className="mt-2.5 text-[14px] leading-[1.64] text-[#EDE7DA]/75">
              Independent vocal-nasheed visual house pairing deterministic
              Remotion v3.0 shaders with restrained 21:9 warm-charcoal &amp;
              raw-brass typography.
            </p>

            {/* 3D Silk Ribbon Motion Toggle */}
            <div className="mt-5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9891] mb-2">
                3D Silk Ribbon Motion
              </span>
              <div
                role="group"
                aria-label="Vellum 3D silk ribbon motion"
                className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#EDE7DA]/12 bg-[#0D0F0E]/75 p-1"
              >
                <button
                  type="button"
                  onClick={() => setVellumPlaying(true)}
                  aria-pressed={vellumPlaying}
                  className={cn(
                    'tactile-press inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                    vellumPlaying
                      ? 'bg-[#D99B52] text-[#0E100F] font-medium'
                      : 'text-[#EDE7DA]/70 hover:text-[#EDE7DA] hover:bg-white/5'
                  )}
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Flowing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVellumPlaying(false)}
                  aria-pressed={!vellumPlaying}
                  className={cn(
                    'tactile-press inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                    !vellumPlaying
                      ? 'bg-[#D99B52] text-[#0E100F] font-medium'
                      : 'text-[#EDE7DA]/70 hover:text-[#EDE7DA] hover:bg-white/5'
                  )}
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Suspended</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A9891]">
                60 FPS · 21:9 Cinema
              </span>
              <Link
                href="/work/vellum"
                className="tactile-press inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#EDE7DA]/22 bg-white/5 px-4 py-2 text-xs font-medium text-[#EDE7DA] transition-colors hover:bg-[#EDE7DA] hover:text-[#0E100F]"
              >
                <span>Read Case Study</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAPTER 05 · MESS MANAGER                                        */}
        {/* ================================================================ */}
        <section
          id="mess-manager"
          aria-labelledby="chapter-mess-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div data-hud-interactive="true" className={glassCardClass}>
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#D99B52]">
                05 · Hamilton Ledger · Paisa
              </span>
              <span className="text-[#7E9AA6] tnum">
                Σ = {formatPaisa(hamilton.sumPaisa)}
              </span>
            </div>

            <h2
              id="chapter-mess-heading"
              className="mt-4 font-serif font-light text-[40px] sm:text-[46px] leading-[0.98] tracking-[-0.02em] text-[#EDE7DA]"
            >
              Mess Manager
            </h2>

            <p className="mt-2 text-[14px] leading-[1.62] text-[#EDE7DA]/75">
              Zero-drift integer-paisa Hamilton largest-remainder accounting for
              student dormitories — scrubbed live onto the 3D brass pillars.
            </p>

            {/* Machined TactileScrubber */}
            <div className="mt-4">
              <TactileScrubber
                tone="dark"
                label="Monthly Meal Pool"
                value={messPoolBdt}
                min={6000}
                max={28000}
                step={250}
                onChange={setMessPoolBdt}
                formattedValue={formatWholeBdt(messPoolBdt)}
                minLabel="৳6,000"
                maxLabel="৳28,000"
                majorIntervals={8}
              />
            </div>

            {/* Real-Time Integer-Paisa Hamilton Shares */}
            <div className="mt-4 space-y-1.5 rounded-xl border border-[#EDE7DA]/10 bg-[#0A0C0B]/75 p-3.5">
              <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#EDE7DA]/10 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A9891] tnum">
                <span>{hamilton.totalMeals} Meals Total</span>
                <span>৳{hamilton.mealRateBdt.toFixed(2)} / meal</span>
              </div>
              {hamilton.rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-2 font-mono text-xs tnum"
                >
                  <span className="text-[#EDE7DA]/88 truncate">
                    {row.name}{' '}
                    <span className="text-[10px] text-[#9A9891]">
                      ({row.meals}m)
                    </span>
                  </span>
                  <span className="shrink-0 text-[#EDE7DA]">
                    {formatPaisa(row.sharePaisa)}
                    {row.receivedRemainder && (
                      <span className="ml-1.5 text-[10px] text-[#D99B52]">
                        +1p
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A9891]">
                0.00 Paisa Drift
              </span>
              <Link
                href="/work/mess-manager"
                className="tactile-press inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#EDE7DA]/22 bg-white/5 px-4 py-2 text-xs font-medium text-[#EDE7DA] transition-colors hover:bg-[#EDE7DA] hover:text-[#0E100F]"
              >
                <span>Read Case Study</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAPTER 06 · CORRESPONDENCE & INDEX                              */}
        {/* ================================================================ */}
        <section
          id="contact"
          aria-labelledby="chapter-contact-heading"
          className="min-h-screen flex items-end md:items-center px-5 sm:px-8 lg:px-12 pt-24 pb-28 md:pb-24"
        >
          <div
            data-hud-interactive="true"
            className={cn(glassCardClass, 'max-w-[540px]')}
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EDE7DA]/12 font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-[#D99B52]">
                06 · Correspondence &amp; Index
              </span>
              <span className="text-[#EDE7DA]/65">Sylhet · UTC+6</span>
            </div>

            <h2
              id="chapter-contact-heading"
              className="mt-5 font-serif font-light text-[42px] sm:text-[54px] leading-[0.95] tracking-[-0.025em] text-[#EDE7DA]"
            >
              Let&apos;s build something{' '}
              <em className="italic font-normal text-[#D99B52]">
                worth keeping.
              </em>
            </h2>

            <p className="mt-4 text-[14.5px] leading-[1.68] text-[#EDE7DA]/75">
              {PROFILE.contact.availability}
            </p>

            {/* Direct Clickable Email + Copy Button */}
            <div className="mt-6 rounded-xl border border-[#EDE7DA]/12 bg-[#080A0B]/75 p-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A9891]">
                Direct Electronic Mail
              </span>
              <a
                href={`mailto:${PROFILE.email}`}
                className="mt-1.5 inline-block font-serif text-[26px] sm:text-[32px] leading-tight text-[#EDE7DA] underline decoration-[#EDE7DA]/25 underline-offset-[6px] transition-colors hover:text-[#D99B52] hover:decoration-[#D99B52] break-all"
              >
                {PROFILE.email}
              </a>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CopyEmailButton
                  email={PROFILE.email}
                  className="!rounded-full !border-[#EDE7DA]/18 !bg-[#151817]/90 !text-[#EDE7DA] hover:!border-[#D99B52]/60"
                />
                <Link
                  href="/contact"
                  className="tactile-press inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-[#EDE7DA] px-5 py-2 text-sm font-medium text-[#0E100F] transition-colors hover:bg-[#D99B52]"
                >
                  <span>Contact Page</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Quick Index Links */}
            <nav
              aria-label="Portfolio directory"
              className="mt-5 pt-4 border-t border-[#EDE7DA]/12 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-[#EDE7DA]/75"
            >
              {[
                { href: '/work', label: 'Work' },
                { href: '/writing', label: 'Writing' },
                { href: '/about', label: 'About' },
                { href: '/studio', label: '3D Studio' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#D99B52]"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>

      {/* Floating Bottom-Center 3D Chapter Teleport Bar */}
      <nav
        aria-label="3D World Chapter Teleport"
        data-hud-interactive="true"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1 rounded-full border border-[#EDE7DA]/14 bg-[#0B0E0F]/80 px-2 py-1.5 backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
      >
        {CHAPTERS.map((chapter, idx) => {
          const isActive = activeChapter === idx;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => teleportToChapter(idx)}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'tactile-press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-[#D99B52] text-[#0E100F] font-medium'
                  : 'text-[#EDE7DA]/72 hover:text-[#EDE7DA] hover:bg-white/5'
              )}
            >
              <span
                className={cn(
                  'tnum text-[10px]',
                  isActive ? 'text-[#0E100F]/80' : 'text-[#D99B52]/80'
                )}
              >
                {chapter.index}
              </span>
              <span>{chapter.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default SpatialPortfolioExperience;
