'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface VolumetricMorphStageProps {
  progressRef: React.MutableRefObject<number>; // continuous 0..1 across 5 acts
  activeAct: number; // 0..4
  stillMode?: boolean;
}

const PARTICLE_COUNT = 6000;
const SPARKLE_COUNT = 400;
const ACT_COUNT = 5;

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

function createSeededRng(initialSeed: number): () => number {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

interface ActOpticalProfile {
  primaryHex: string;
  secondaryHex: string;
  haloTint: THREE.Color;
  nebulaTint: THREE.Color;
  coreTint: THREE.Color;
  coreScale: number;
  coreOpacity: number;
  haloOpacity: number;
  nebulaOpacity: number;
  sonarOpacity: number;
  orbitOpacity: number;
}

const ACT_PROFILES: ActOpticalProfile[] = [
  // Act 0 — Sylhet Aperture
  {
    primaryHex: '#F2D29B',
    secondaryHex: '#FFF4DF',
    haloTint: new THREE.Color('#F2D29B'),
    nebulaTint: new THREE.Color('#D9AF6B'),
    coreTint: new THREE.Color('#FFF4DF'),
    coreScale: 0.96,
    coreOpacity: 0.92,
    haloOpacity: 0.68,
    nebulaOpacity: 0.34,
    sonarOpacity: 0.34,
    orbitOpacity: 0.28,
  },
  // Act 1 — Ujaan (Haor Basin)
  {
    primaryHex: '#E8A652',
    secondaryHex: '#4C7A78',
    haloTint: new THREE.Color('#6FA3A0'),
    nebulaTint: new THREE.Color('#3C6664'),
    coreTint: new THREE.Color('#E8A652'),
    coreScale: 0.48,
    coreOpacity: 0.32,
    haloOpacity: 0.36,
    nebulaOpacity: 0.32,
    sonarOpacity: 0.22,
    orbitOpacity: 0.16,
  },
  // Act 2 — OttoBudget (Cryptographic Vault)
  {
    primaryHex: '#6AD1A6',
    secondaryHex: '#D8F7E8',
    haloTint: new THREE.Color('#6AD1A6'),
    nebulaTint: new THREE.Color('#3EA67E'),
    coreTint: new THREE.Color('#D8F7E8'),
    coreScale: 1.04,
    coreOpacity: 0.96,
    haloOpacity: 0.62,
    nebulaOpacity: 0.34,
    sonarOpacity: 0.36,
    orbitOpacity: 0.32,
  },
  // Act 3 — Vellum (Harmonic Ribbon)
  {
    primaryHex: '#E8DFC9',
    secondaryHex: '#C97E5C',
    haloTint: new THREE.Color('#D99B78'),
    nebulaTint: new THREE.Color('#A8684A'),
    coreTint: new THREE.Color('#E8DFC9'),
    coreScale: 0.56,
    coreOpacity: 0.4,
    haloOpacity: 0.44,
    nebulaOpacity: 0.3,
    sonarOpacity: 0.24,
    orbitOpacity: 0.22,
  },
  // Act 4 — Mess Manager (Architectural Lattice)
  {
    primaryHex: '#E2B478',
    secondaryHex: '#B8C8D4',
    haloTint: new THREE.Color('#C8D4DE'),
    nebulaTint: new THREE.Color('#8BA0B2'),
    coreTint: new THREE.Color('#E2B478'),
    coreScale: 0.62,
    coreOpacity: 0.46,
    haloOpacity: 0.48,
    nebulaOpacity: 0.28,
    sonarOpacity: 0.26,
    orbitOpacity: 0.3,
  },
];

function createSoftGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size * 0.5;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.86)');
    grad.addColorStop(0.52, 'rgba(255, 255, 255, 0.24)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createSparkleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size * 0.5;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.14, 'rgba(255, 255, 255, 0.92)');
    grad.addColorStop(0.36, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle 4-point optical glint
    ctx.save();
    ctx.translate(half, half);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.fillRect(-half * 0.72, -0.75, half * 1.44, 1.5);
    ctx.fillRect(-0.75, -half * 0.72, 1.5, half * 1.44);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createPortalHaloTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size * 0.5;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(0.28, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(0.56, 'rgba(255, 255, 255, 0.04)');
    grad.addColorStop(0.68, 'rgba(255, 255, 255, 0.42)');
    grad.addColorStop(0.73, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.78, 'rgba(255, 255, 255, 0.34)');
    grad.addColorStop(0.89, 'rgba(255, 255, 255, 0.07)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createNebulaGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size * 0.5;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.62)');
    grad.addColorStop(0.32, 'rgba(255, 255, 255, 0.32)');
    grad.addColorStop(0.66, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

interface FormationDataset {
  positions: Float32Array[];
  colors: Float32Array[];
  stagger: Float32Array;
  scatter: Float32Array;
}

function writeColorLerp(
  out: Float32Array,
  idx3: number,
  a: THREE.Color,
  b: THREE.Color,
  t: number,
  brightness = 1.0
): void {
  const k = clamp(t, 0, 1);
  out[idx3] = (a.r + (b.r - a.r) * k) * brightness;
  out[idx3 + 1] = (a.g + (b.g - a.g) * k) * brightness;
  out[idx3 + 2] = (a.b + (b.b - a.b) * k) * brightness;
}

function buildFormationDataset(n: number): FormationDataset {
  const rng = createSeededRng(20261122);
  const positions: Float32Array[] = [];
  const colors: Float32Array[] = [];

  for (let act = 0; act < ACT_COUNT; act++) {
    positions.push(new Float32Array(n * 3));
    colors.push(new Float32Array(n * 3));
  }

  const stagger = new Float32Array(n);
  const scatter = new Float32Array(n * 3);

  for (let i = 0; i < n; i++) {
    stagger[i] = rng();
    // Uniform point on unit sphere scaled slightly for natural stardust dispersion
    const u = rng() * 2 - 1;
    const phi = rng() * Math.PI * 2;
    const rad = Math.sqrt(Math.max(0, 1 - u * u));
    const amp = 0.65 + rng() * 0.7;
    const i3 = i * 3;
    scatter[i3] = rad * Math.cos(phi) * amp;
    scatter[i3 + 1] = u * amp;
    scatter[i3 + 2] = rad * Math.sin(phi) * amp;
  }

  // Palette anchors
  const c0a = new THREE.Color('#F2D29B'); // Warm Vellum Gold
  const c0b = new THREE.Color('#FFF4DF'); // Champagne Ivory
  const c1a = new THREE.Color('#4C7A78'); // Deep Teal-Slate (valleys)
  const c1b = new THREE.Color('#E8A652'); // Burnished Amber (crests)
  const c2a = new THREE.Color('#6AD1A6'); // Luminous Cypress Emerald
  const c2b = new THREE.Color('#D8F7E8'); // Pale Mint
  const c3a = new THREE.Color('#E8DFC9'); // Vellum Parchment
  const c3b = new THREE.Color('#C97E5C'); // Warm Oxide
  const c4a = new THREE.Color('#E2B478'); // Warm Tungsten
  const c4b = new THREE.Color('#B8C8D4'); // Silver Mist

  // -------------------------------------------------------------------------
  // Act 0 — Sylhet Aperture: Moon-gate torus (R=2.55, r=0.22) + dual-helix
  // monsoon vortex spirals + dense golden dust halo
  // -------------------------------------------------------------------------
  {
    const pos = positions[0];
    const col = colors[0];
    const torusCount = Math.floor(n * 0.54);
    const vortexCount = Math.floor(n * 0.28);

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      if (i < torusCount) {
        // Quantized architectural moon-gate segments along torus R=2.55, r=0.22
        const seg = Math.floor(rng() * 72);
        const u = ((seg + (rng() - 0.5) * 0.68) / 72) * Math.PI * 2;
        const rib = Math.floor(rng() * 10);
        const v = ((rib + (rng() - 0.5) * 0.52) / 10) * Math.PI * 2;
        const R = 2.55;
        const r = 0.22 * (0.86 + rng() * 0.28);
        const ringR = R + r * Math.cos(v);
        pos[i3] = ringR * Math.cos(u);
        pos[i3 + 1] = ringR * Math.sin(u);
        pos[i3 + 2] = r * Math.sin(v);

        const mix = 0.5 + 0.5 * Math.cos(v);
        writeColorLerp(col, i3, c0a, c0b, mix * 0.85, 0.96 + rng() * 0.14);
      } else if (i < torusCount + vortexCount) {
        // Sweeping monsoon dual-helix vortex spirals
        const arm = i % 2 === 0 ? 0 : Math.PI;
        const t = rng();
        const theta = arm + t * Math.PI * 4.4;
        const radius = 0.95 + (1 - t) * 2.45 + (rng() - 0.5) * 0.18;
        const zDepth = (t - 0.5) * 2.4 + Math.sin(theta * 2.0) * 0.24;
        pos[i3] = radius * Math.cos(theta);
        pos[i3 + 1] = radius * Math.sin(theta);
        pos[i3 + 2] = zDepth + (rng() - 0.5) * 0.14;

        writeColorLerp(col, i3, c0a, c0b, t, 0.85 + t * 0.25);
      } else {
        // Dense golden dust halo surrounding the moon-gate
        const ang = rng() * Math.PI * 2;
        const r = 2.45 + Math.pow(rng(), 0.72) * 1.45;
        const z = (rng() - 0.5) * 1.35;
        pos[i3] = r * Math.cos(ang);
        pos[i3 + 1] = r * Math.sin(ang);
        pos[i3 + 2] = z;

        writeColorLerp(col, i3, c0a, c0b, rng() * 0.55, 0.68 + rng() * 0.34);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Act 1 — Ujaan (Haor Basin): 7.6 x 5.2 topographic elevation wavefield
  // with twin flood-crest ridges + elevated SAR river channel
  // -------------------------------------------------------------------------
  {
    const pos = positions[1];
    const col = colors[1];
    const terrainCount = Math.floor(n * 0.84);
    const cols = 100;
    const rows = Math.ceil(terrainCount / cols);
    const tiltX = 0.68; // Tilt basin toward camera for unmistakable 3D relief
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      let gx = 0;
      let gz = 0;
      let gy = 0;
      let isRiver = false;

      if (i < terrainCount) {
        const row = Math.floor(i / cols);
        const colIdx = i % cols;
        const u = (colIdx + (rng() - 0.5) * 0.35) / Math.max(1, cols - 1);
        const v = (row + (rng() - 0.5) * 0.35) / Math.max(1, rows - 1);
        gx = (u - 0.5) * 7.6;
        gz = (v - 0.5) * 5.2;

        // Twin flood-crest ridges flanking the basin
        const ridgeNorth = Math.exp(-Math.pow((gz - 1.35) / 0.85, 2)) * (0.95 + 0.35 * Math.cos(gx * 0.95));
        const ridgeSouth = Math.exp(-Math.pow((gz + 1.35) / 0.9, 2)) * (0.88 + 0.32 * Math.sin(gx * 0.85 + 0.7));
        // Undulating haor basin ripples
        const wave =
          0.26 * Math.sin(gx * 1.25 + gz * 0.75) +
          0.16 * Math.cos(gx * 0.7 - gz * 1.4);
        // Meandering central river depression
        const riverCenterZ = 0.42 * Math.sin(gx * 0.88) + 0.16 * Math.cos(gx * 1.7);
        const distRiver = Math.abs(gz - riverCenterZ);
        const basinCarve = -0.58 * Math.exp(-Math.pow(distRiver / 0.62, 2));

        gy = ridgeNorth + ridgeSouth + wave + basinCarve - 0.42;
      } else {
        // Elevated SAR river channel ribbon hovering above the carved channel
        isRiver = true;
        const t = (i - terrainCount) / Math.max(1, n - terrainCount);
        gx = (t - 0.5) * 7.4;
        const riverCenterZ = 0.42 * Math.sin(gx * 0.88) + 0.16 * Math.cos(gx * 1.7);
        const widthOffset = (rng() - 0.5) * 0.42;
        gz = riverCenterZ + widthOffset;
        gy = 0.36 + 0.12 * Math.sin(gx * 2.4) + (rng() - 0.5) * 0.08;
      }

      // Apply presentation tilt around X so ridges & river sweep across the viewport
      const ry = gy * cosT - gz * sinT;
      const rz = gy * sinT + gz * cosT;
      pos[i3] = gx * 0.82;
      pos[i3 + 1] = ry * 0.88 + 0.08;
      pos[i3 + 2] = rz * 0.72;

      if (isRiver) {
        writeColorLerp(col, i3, c1b, c0b, 0.35 + rng() * 0.25, 1.12);
      } else {
        const hNorm = clamp((gy + 0.85) / 1.95, 0, 1);
        writeColorLerp(col, i3, c1a, c1b, Math.pow(hNorm, 1.15), 0.78 + hNorm * 0.36);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Act 2 — OttoBudget (Cryptographic Vault): 3 nested quantized torus rings
  // + torus-knot filigree + dense encrypted core sphere
  // -------------------------------------------------------------------------
  {
    const pos = positions[2];
    const col = colors[2];
    const ringsCount = Math.floor(n * 0.48);
    const knotCount = Math.floor(n * 0.22);

    const ringConfigs = [
      { R: 2.52, r: 0.13, rx: 0.35, ry: 0.2, rz: 0.0, ticks: 64 },
      { R: 1.94, r: 0.12, rx: -0.78, ry: 0.52, rz: 0.3, ticks: 48 },
      { R: 1.42, r: 0.1, rx: 1.12, ry: -0.64, rz: 0.45, ticks: 36 },
    ];
    const euler = new THREE.Euler();
    const vec = new THREE.Vector3();

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      if (i < ringsCount) {
        const ringIdx = i % 3;
        const cfg = ringConfigs[ringIdx];
        const seg = Math.floor(rng() * cfg.ticks);
        // Quantized cipher blocks with subtle gaps
        const u = ((seg + (rng() - 0.5) * 0.62) / cfg.ticks) * Math.PI * 2;
        const v = rng() * Math.PI * 2;
        const rr = cfg.r * (0.75 + rng() * 0.4);
        vec.set(
          (cfg.R + rr * Math.cos(v)) * Math.cos(u),
          (cfg.R + rr * Math.cos(v)) * Math.sin(u),
          rr * Math.sin(v)
        );
        euler.set(cfg.rx, cfg.ry, cfg.rz);
        vec.applyEuler(euler);
        pos[i3] = vec.x;
        pos[i3 + 1] = vec.y;
        pos[i3 + 2] = vec.z;

        const mintBias = ringIdx === 2 ? 0.65 : ringIdx === 1 ? 0.38 : 0.18;
        writeColorLerp(col, i3, c2a, c2b, mintBias + rng() * 0.22, 0.92 + rng() * 0.18);
      } else if (i < ringsCount + knotCount) {
        // Crystalline (3, 2) torus knot filigree
        const pKnot = 3;
        const qKnot = 2;
        const t = rng() * Math.PI * 2;
        const rTube = 0.11 * (0.6 + rng() * 0.6);
        const phi = rng() * Math.PI * 2;
        const coreR = 1.18 + 0.48 * Math.cos(qKnot * t);
        const cx = coreR * Math.cos(pKnot * t);
        const cy = coreR * Math.sin(pKnot * t);
        const cz = 0.52 * Math.sin(qKnot * t);
        pos[i3] = cx + rTube * Math.cos(phi);
        pos[i3 + 1] = cy + rTube * Math.sin(phi);
        pos[i3 + 2] = cz + (rng() - 0.5) * 0.14;

        writeColorLerp(col, i3, c2a, c2b, 0.42 + rng() * 0.35, 0.95);
      } else {
        // Dense encrypted core sphere on Fibonacci lattice
        const coreIdx = i - (ringsCount + knotCount);
        const coreTotal = Math.max(1, n - (ringsCount + knotCount));
        const y = 1 - (coreIdx / (coreTotal - 1 || 1)) * 2;
        const radAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const theta = goldenAngle * coreIdx;
        const shellR = 0.88 + (rng() - 0.5) * 0.12;
        pos[i3] = Math.cos(theta) * radAtY * shellR;
        pos[i3 + 1] = y * shellR;
        pos[i3 + 2] = Math.sin(theta) * radAtY * shellR;

        writeColorLerp(col, i3, c2a, c2b, 0.65 + rng() * 0.35, 1.06);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Act 3 — Vellum (Harmonic Ribbon): Sculptural 3D Möbius silk ribbon +
  // twin acoustic resonance wave strands sweeping diagonally
  // -------------------------------------------------------------------------
  {
    const pos = positions[3];
    const col = colors[3];
    const mobiusCount = Math.floor(n * 0.62);
    const diagTilt = new THREE.Euler(0.38, -0.26, -0.42);
    const vec = new THREE.Vector3();

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      if (i < mobiusCount) {
        // Woven silk filaments along a sweeping Möbius strip
        const strand = Math.floor(rng() * 14);
        const vNorm = ((strand / 13) * 2 - 1) + (rng() - 0.5) * 0.07;
        const u = rng() * Math.PI * 2;
        const halfU = u * 0.5;
        const width = 0.82 * vNorm;
        const R = 2.05;
        const mx = (R + width * Math.cos(halfU)) * Math.cos(u);
        const my = (R + width * Math.cos(halfU)) * Math.sin(u) * 0.78;
        const mz = width * Math.sin(halfU) * 1.25;

        vec.set(mx, my, mz).applyEuler(diagTilt);
        pos[i3] = vec.x;
        pos[i3 + 1] = vec.y;
        pos[i3 + 2] = vec.z;

        const edgeFactor = Math.abs(vNorm);
        writeColorLerp(col, i3, c3a, c3b, edgeFactor * 0.52, 0.94 + (1 - edgeFactor) * 0.16);
      } else {
        // Twin acoustic resonance wave strands sweeping diagonally across frame
        const strandSign = i % 2 === 0 ? 1 : -1;
        const t = rng();
        const x = (t - 0.5) * 6.8;
        const env = Math.sin(t * Math.PI);
        const carrier = Math.sin(t * Math.PI * 6.0 + (strandSign > 0 ? 0 : Math.PI * 0.65));
        const harmonic = 0.35 * Math.sin(t * Math.PI * 12.0);
        const y = strandSign * (0.48 + 0.72 * env * carrier + 0.25 * env * harmonic) + (rng() - 0.5) * 0.1;
        const z = Math.cos(t * Math.PI * 4.0 + strandSign) * 0.95 * env + (rng() - 0.5) * 0.12;

        vec.set(x, y, z).applyEuler(new THREE.Euler(0.18, -0.15, -0.34));
        pos[i3] = vec.x;
        pos[i3 + 1] = vec.y;
        pos[i3 + 2] = vec.z;

        writeColorLerp(col, i3, c3b, c3a, 0.22 + Math.abs(carrier) * 0.38, 0.96 + rng() * 0.16);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Act 4 — Mess Manager (Architectural Lattice): Precision golden-ratio
  // geodesic sphere + Fibonacci orbital rings + serene outer starfield
  // -------------------------------------------------------------------------
  {
    const pos = positions[4];
    const col = colors[4];
    const geodesicCount = Math.floor(n * 0.42);
    const ringsCount = Math.floor(n * 0.28);

    // Build geodesic icosahedron edge list for crisp architectural lattice struts
    const ico = new THREE.IcosahedronGeometry(1.62, 2);
    const icoPos = ico.attributes.position;
    const edgePairs: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let t = 0; t < icoPos.count; t += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(icoPos, t);
      const b = new THREE.Vector3().fromBufferAttribute(icoPos, t + 1);
      const c = new THREE.Vector3().fromBufferAttribute(icoPos, t + 2);
      edgePairs.push([a, b], [b, c], [c, a]);
    }
    ico.dispose();

    const fibRings = [
      { R: 2.25, rx: 0.45, ry: 0.25, rz: 0.1 },
      { R: 2.78, rx: -0.62, ry: 0.58, rz: -0.22 },
      { R: 3.32, rx: 0.88, ry: -0.42, rz: 0.35 },
    ];
    const euler = new THREE.Euler();
    const vec = new THREE.Vector3();

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      if (i < geodesicCount) {
        const edge = edgePairs[i % edgePairs.length];
        const s = rng();
        vec.lerpVectors(edge[0], edge[1], s);
        vec.normalize().multiplyScalar(1.62 + (rng() - 0.5) * 0.03);
        pos[i3] = vec.x;
        pos[i3 + 1] = vec.y;
        pos[i3 + 2] = vec.z;

        writeColorLerp(col, i3, c4a, c4b, rng() * 0.28, 0.98 + rng() * 0.14);
      } else if (i < geodesicCount + ringsCount) {
        const rIdx = i % fibRings.length;
        const cfg = fibRings[rIdx];
        const ang = rng() * Math.PI * 2;
        const jitterR = cfg.R + (rng() - 0.5) * 0.09;
        vec.set(
          jitterR * Math.cos(ang),
          jitterR * Math.sin(ang),
          (rng() - 0.5) * 0.06
        );
        euler.set(cfg.rx, cfg.ry, cfg.rz);
        vec.applyEuler(euler);
        pos[i3] = vec.x;
        pos[i3 + 1] = vec.y;
        pos[i3 + 2] = vec.z;

        writeColorLerp(col, i3, c4a, c4b, 0.28 + rIdx * 0.24, 0.9 + rng() * 0.15);
      } else {
        // Serene wide starfield dissolving gracefully outward
        const u = rng() * 2 - 1;
        const phi = rng() * Math.PI * 2;
        const rad = Math.sqrt(Math.max(0, 1 - u * u));
        const dist = 3.5 + Math.pow(rng(), 0.78) * 3.8;
        pos[i3] = rad * Math.cos(phi) * dist * 1.15;
        pos[i3 + 1] = u * dist * 0.78;
        pos[i3 + 2] = rad * Math.sin(phi) * dist - 0.8;

        writeColorLerp(col, i3, c4b, c4a, rng() * 0.35, 0.58 + rng() * 0.38);
      }
    }
  }

  return { positions, colors, stagger, scatter };
}

export function VolumetricMorphStage({
  progressRef,
  activeAct,
  stillMode = false,
}: VolumetricMorphStageProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeActRef = useRef<number>(activeAct);
  const stillModeRef = useRef<boolean>(stillMode);

  activeActRef.current = activeAct;
  stillModeRef.current = stillMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.12, 8.6);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const sculptureGroup = new THREE.Group();
    stageGroup.add(sculptureGroup);

    // Textures
    const glowTex = createSoftGlowTexture();
    const sparkleTex = createSparkleTexture();
    const haloTex = createPortalHaloTexture();
    const nebulaTex = createNebulaGlowTexture();

    // -----------------------------------------------------------------------
    // 1. Primary 6,000 Volumetric Particle Morph Cloud
    // -----------------------------------------------------------------------
    const dataset = buildFormationDataset(PARTICLE_COUNT);
    const livePositions = new Float32Array(PARTICLE_COUNT * 3);
    const liveColors = new Float32Array(PARTICLE_COUNT * 3);
    livePositions.set(dataset.positions[0]);
    liveColors.set(dataset.colors[0]);

    const mainGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(livePositions, 3);
    const colAttr = new THREE.BufferAttribute(liveColors, 3);
    mainGeo.setAttribute('position', posAttr);
    mainGeo.setAttribute('color', colAttr);

    const mainMat = new THREE.PointsMaterial({
      size: 0.088,
      map: glowTex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });

    const mainPoints = new THREE.Points(mainGeo, mainMat);
    sculptureGroup.add(mainPoints);

    // -----------------------------------------------------------------------
    // 2. Fake-Bloom Optical Kit: Additive Fresnel Crystal Core + Dark Fill
    // -----------------------------------------------------------------------
    const coreGroup = new THREE.Group();
    sculptureGroup.add(coreGroup);

    const fresnelGeo = new THREE.IcosahedronGeometry(0.88, 3);
    const fresnelUniforms = {
      uColor: { value: ACT_PROFILES[0].coreTint.clone() },
      uOpacity: { value: ACT_PROFILES[0].coreOpacity },
    };
    const fresnelMat = new THREE.ShaderMaterial({
      uniforms: fresnelUniforms,
      vertexShader: `
        precision mediump float;
        varying float vF;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normal);
          vF = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.35);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vF;
        void main() {
          float alpha = (vF * 0.88 + 0.05) * uOpacity;
          gl_FragColor = vec4(uColor * (0.68 + vF * 1.15), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const fresnelMesh = new THREE.Mesh(fresnelGeo, fresnelMat);
    coreGroup.add(fresnelMesh);

    const innerDarkGeo = new THREE.IcosahedronGeometry(0.83, 2);
    const innerDarkMat = new THREE.MeshBasicMaterial({
      color: 0x07090e,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const innerDarkMesh = new THREE.Mesh(innerDarkGeo, innerDarkMat);
    coreGroup.add(innerDarkMesh);

    // -----------------------------------------------------------------------
    // 3. Baked 512px Concentric Portal Halo Plane + Wide Soft Nebula Glow
    // -----------------------------------------------------------------------
    const haloGeo = new THREE.PlaneGeometry(6.8, 6.8);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      color: ACT_PROFILES[0].haloTint.clone(),
      transparent: true,
      opacity: ACT_PROFILES[0].haloOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0, -1.2);
    stageGroup.add(haloMesh);

    const nebulaGeo = new THREE.PlaneGeometry(11.5, 11.5);
    const nebulaMat = new THREE.MeshBasicMaterial({
      map: nebulaTex,
      color: ACT_PROFILES[0].nebulaTint.clone(),
      transparent: true,
      opacity: ACT_PROFILES[0].nebulaOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebulaMesh.position.set(0, 0, -2.4);
    stageGroup.add(nebulaMesh);

    // -----------------------------------------------------------------------
    // 4. 3 Thin Expanding Sonar Pulse Rings
    // -----------------------------------------------------------------------
    const sonarGeo = new THREE.RingGeometry(2.1, 2.14, 96);
    const sonarRings: Array<{ mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phaseOffset: number }> = [];
    for (let s = 0; s < 3; s++) {
      const mat = new THREE.MeshBasicMaterial({
        color: ACT_PROFILES[0].haloTint.clone(),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(sonarGeo, mat);
      mesh.position.set(0, 0, -0.55);
      stageGroup.add(mesh);
      sonarRings.push({ mesh, mat, phaseOffset: s / 3 });
    }

    // -----------------------------------------------------------------------
    // 5. 2 Delicate Tilted Orbital Ellipses with Traveling Glowing Dots
    // -----------------------------------------------------------------------
    const orbitSpecs = [
      { rx: 3.15, ry: 2.35, rot: new THREE.Euler(0.62, 0.34, 0.22), speed: 0.085, phase: 0.15 },
      { rx: 2.75, ry: 3.3, rot: new THREE.Euler(-0.54, -0.46, 0.68), speed: -0.068, phase: 0.62 },
    ];
    const orbits: Array<{
      curve: THREE.EllipseCurve;
      lineGeo: THREE.BufferGeometry;
      lineMat: THREE.LineBasicMaterial;
      dotSprite: THREE.Sprite;
      dotMat: THREE.SpriteMaterial;
      speed: number;
      phase: number;
    }> = [];

    for (const spec of orbitSpecs) {
      const curve = new THREE.EllipseCurve(0, 0, spec.rx, spec.ry, 0, Math.PI * 2, false, 0);
      const pts2d = curve.getPoints(128);
      const pts3d = pts2d.map((pt) => new THREE.Vector3(pt.x, pt.y, 0));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts3d);
      const lineMat = new THREE.LineBasicMaterial({
        color: ACT_PROFILES[0].haloTint.clone(),
        transparent: true,
        opacity: ACT_PROFILES[0].orbitOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.copy(spec.rot);
      const line = new THREE.Line(lineGeo, lineMat);
      orbitGroup.add(line);

      const dotMat = new THREE.SpriteMaterial({
        map: sparkleTex,
        color: ACT_PROFILES[0].coreTint.clone(),
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const dotSprite = new THREE.Sprite(dotMat);
      dotSprite.scale.set(0.28, 0.28, 1);
      orbitGroup.add(dotSprite);

      stageGroup.add(orbitGroup);
      orbits.push({
        curve,
        lineGeo,
        lineMat,
        dotSprite,
        dotMat,
        speed: spec.speed,
        phase: spec.phase,
      });
    }

    // -----------------------------------------------------------------------
    // 6. 400 Sparkle Sub-Cloud Particles across wide 3D depth
    // -----------------------------------------------------------------------
    const sparkleRng = createSeededRng(918273645);
    const sparkleBase = new Float32Array(SPARKLE_COUNT * 3);
    const sparkleLive = new Float32Array(SPARKLE_COUNT * 3);
    const sparkleColors = new Float32Array(SPARKLE_COUNT * 3);
    const sparklePhase = new Float32Array(SPARKLE_COUNT);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const i3 = i * 3;
      sparkleBase[i3] = (sparkleRng() - 0.5) * 14.5;
      sparkleBase[i3 + 1] = (sparkleRng() - 0.5) * 9.2;
      sparkleBase[i3 + 2] = -5.5 + sparkleRng() * 8.5;
      sparkleLive[i3] = sparkleBase[i3];
      sparkleLive[i3 + 1] = sparkleBase[i3 + 1];
      sparkleLive[i3 + 2] = sparkleBase[i3 + 2];
      sparklePhase[i] = sparkleRng() * Math.PI * 2;

      const warm = 0.78 + sparkleRng() * 0.22;
      sparkleColors[i3] = warm;
      sparkleColors[i3 + 1] = warm * (0.94 + sparkleRng() * 0.06);
      sparkleColors[i3 + 2] = warm * (0.86 + sparkleRng() * 0.14);
    }

    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePosAttr = new THREE.BufferAttribute(sparkleLive, 3);
    sparkleGeo.setAttribute('position', sparklePosAttr);
    sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));

    const sparkleMat = new THREE.PointsMaterial({
      size: 0.135,
      map: sparkleTex,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparklePoints);

    // -----------------------------------------------------------------------
    // Responsive Asymmetric Framing + Reduced Motion + Pointer Tracking
    // -----------------------------------------------------------------------
    let isDesktop = window.innerWidth >= 960;
    const lookTarget = new THREE.Vector3(isDesktop ? 0.75 : 0, isDesktop ? 0.05 : 0, 0);

    const updateLayout = () => {
      const parent = canvas.parentElement;
      const width = Math.max(1, parent?.clientWidth || window.innerWidth);
      const height = Math.max(1, parent?.clientHeight || window.innerHeight);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);

      isDesktop = window.innerWidth >= 960;
      if (isDesktop) {
        stageGroup.position.set(1.85, 0, 0);
        stageGroup.scale.setScalar(1.0);
        camera.position.z = 8.6;
        lookTarget.set(0.75, 0.05, 0);
      } else {
        stageGroup.position.set(0, 0, 0);
        const narrowScale = width < 520 ? 0.72 : 0.86;
        stageGroup.scale.setScalar(narrowScale);
        camera.position.z = width < 520 ? 9.6 : 9.0;
        lookTarget.set(0, 0, 0);
      }
      camera.lookAt(lookTarget);
    };

    updateLayout();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && canvas.parentElement
        ? new ResizeObserver(() => updateLayout())
        : null;
    if (resizeObserver && canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener('resize', updateLayout);

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerSmooth = new THREE.Vector2(0, 0);
    let pointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      pointerTarget.set(nx, ny);
      pointerActive = true;
    };
    const onPointerLeave = () => {
      pointerActive = false;
      pointerTarget.set(0, 0);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Reusable math temporaries (zero per-frame allocations)
    const tmpHaloColor = new THREE.Color();
    const tmpNebulaColor = new THREE.Color();
    const tmpCoreColor = new THREE.Color();
    const raycaster = new THREE.Raycaster();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointerWorld = new THREE.Vector3();
    const pointerLocal = new THREE.Vector3();
    const orbitPt = new THREE.Vector2();

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const renderFrame = (now: number) => {
      rafId = window.requestAnimationFrame(renderFrame);

      const rawDt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;

      const isStill = stillModeRef.current;
      const freezeMotion = isStill || prefersReducedMotion;
      if (!freezeMotion) {
        elapsed += rawDt;
      }
      const t = isStill ? 0 : elapsed;

      const damp = freezeMotion ? 1 : 1 - Math.pow(1 - 0.065, rawDt * 60);

      // Camera pointer parallax (gentle idle drift before first mouse move)
      if (!freezeMotion) {
        const targetPx = pointerActive ? pointerTarget.x : Math.sin(t * 0.24) * 0.22;
        const targetPy = pointerActive ? pointerTarget.y : Math.cos(t * 0.19) * 0.14;
        pointerSmooth.x += (targetPx - pointerSmooth.x) * damp;
        pointerSmooth.y += (targetPy - pointerSmooth.y) * damp;
      } else {
        pointerSmooth.set(0, 0);
      }

      const camBaseX = isDesktop ? 0.12 : 0;
      const camBaseY = 0.12;
      camera.position.x = camBaseX + pointerSmooth.x * 0.52;
      camera.position.y = camBaseY + pointerSmooth.y * 0.34;
      camera.lookAt(lookTarget);

      // Continuous scroll-driven morph coordinates
      const rawProgress = Number.isFinite(progressRef.current)
        ? progressRef.current
        : activeActRef.current / 4;
      const p = clamp(rawProgress, 0, 1) * 4;
      const idx0 = Math.floor(p);
      const idx1 = Math.min(4, idx0 + 1);
      const localT = p - idx0;
      const blendOptical = smoothstep(localT);

      // Gentle sculpture rotation (pinned cleanly in stillMode)
      if (!freezeMotion) {
        sculptureGroup.rotation.y = t * 0.11 + pointerSmooth.x * 0.14;
        sculptureGroup.rotation.x = Math.sin(t * 0.17) * 0.08 - pointerSmooth.y * 0.09;
      } else {
        sculptureGroup.rotation.set(0.06, -0.14, 0);
      }

      // Project pointer into sculptureGroup local space for magnetic repel
      let useRepel = false;
      if (!freezeMotion && pointerActive) {
        raycaster.setFromCamera(pointerSmooth, camera);
        if (raycaster.ray.intersectPlane(interactionPlane, pointerWorld)) {
          sculptureGroup.updateMatrixWorld();
          pointerLocal.copy(pointerWorld);
          sculptureGroup.worldToLocal(pointerLocal);
          useRepel = true;
        }
      }

      // Morph 6,000 primary particles (position + color)
      const posA = dataset.positions[idx0];
      const posB = dataset.positions[idx1];
      const colA = dataset.colors[idx0];
      const colB = dataset.colors[idx1];
      const stg = dataset.stagger;
      const scat = dataset.scatter;

      const plx = pointerLocal.x;
      const ply = pointerLocal.y;
      const plz = pointerLocal.z;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const norm = clamp((localT - stg[i] * 0.42) / 0.58, 0, 1);
        const ss = smoothstep(norm);
        const loose = Math.sin(ss * Math.PI) * 1.15;

        let x = posA[i3] + (posB[i3] - posA[i3]) * ss + scat[i3] * loose;
        let y = posA[i3 + 1] + (posB[i3 + 1] - posA[i3 + 1]) * ss + scat[i3 + 1] * loose;
        let z = posA[i3 + 2] + (posB[i3 + 2] - posA[i3 + 2]) * ss + scat[i3 + 2] * loose;

        if (!freezeMotion) {
          const phase = t * 0.9 + stg[i] * 6.283185;
          y += Math.sin(phase) * 0.018;
          x += Math.cos(phase * 0.7) * 0.012;
        }

        if (useRepel) {
          const dx = x - plx;
          const dy = y - ply;
          const dz = (z - plz) * 0.45;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 1.4 && d2 > 1e-5) {
            const invD = 1 / Math.sqrt(d2);
            const push = (1 - d2 / 1.4) * 0.48;
            x += dx * invD * push;
            y += dy * invD * push;
            z += dz * invD * push * 0.5;
          }
        }

        livePositions[i3] = x;
        livePositions[i3 + 1] = y;
        livePositions[i3 + 2] = z;

        liveColors[i3] = colA[i3] + (colB[i3] - colA[i3]) * ss;
        liveColors[i3 + 1] = colA[i3 + 1] + (colB[i3 + 1] - colA[i3 + 1]) * ss;
        liveColors[i3 + 2] = colA[i3 + 2] + (colB[i3 + 2] - colA[i3 + 2]) * ss;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Interpolate optical kit palette & intensities across acts
      const prof0 = ACT_PROFILES[idx0];
      const prof1 = ACT_PROFILES[idx1];

      tmpHaloColor.copy(prof0.haloTint).lerp(prof1.haloTint, blendOptical);
      tmpNebulaColor.copy(prof0.nebulaTint).lerp(prof1.nebulaTint, blendOptical);
      tmpCoreColor.copy(prof0.coreTint).lerp(prof1.coreTint, blendOptical);

      const coreScaleBase = prof0.coreScale + (prof1.coreScale - prof0.coreScale) * blendOptical;
      const coreBreath = freezeMotion ? 1.0 : 1.0 + Math.sin(t * 1.25) * 0.045;
      coreGroup.scale.setScalar(coreScaleBase * coreBreath);
      if (!freezeMotion) {
        coreGroup.rotation.y = -t * 0.22;
        coreGroup.rotation.x = t * 0.14;
      }

      fresnelUniforms.uColor.value.copy(tmpCoreColor);
      fresnelUniforms.uOpacity.value =
        prof0.coreOpacity + (prof1.coreOpacity - prof0.coreOpacity) * blendOptical;

      haloMat.color.copy(tmpHaloColor);
      haloMat.opacity =
        (prof0.haloOpacity + (prof1.haloOpacity - prof0.haloOpacity) * blendOptical) *
        (freezeMotion ? 1.0 : 0.94 + Math.sin(t * 0.9) * 0.06);

      nebulaMat.color.copy(tmpNebulaColor);
      nebulaMat.opacity =
        prof0.nebulaOpacity + (prof1.nebulaOpacity - prof0.nebulaOpacity) * blendOptical;

      // 3 Expanding Sonar Pulse Rings
      const sonarBaseOp =
        prof0.sonarOpacity + (prof1.sonarOpacity - prof0.sonarOpacity) * blendOptical;
      for (let s = 0; s < sonarRings.length; s++) {
        const ring = sonarRings[s];
        const ph = freezeMotion
          ? (0.14 + s * 0.34) % 1
          : (t * 0.2 + ring.phaseOffset) % 1;
        const scale = 0.84 + ph * 1.18;
        ring.mesh.scale.setScalar(scale);
        ring.mat.color.copy(tmpHaloColor);
        ring.mat.opacity = (1 - ph) * (1 - ph) * sonarBaseOp;
      }

      // 2 Tilted Orbital Ellipses + Traveling Glowing Dots
      const orbitOp = prof0.orbitOpacity + (prof1.orbitOpacity - prof0.orbitOpacity) * blendOptical;
      for (let o = 0; o < orbits.length; o++) {
        const orb = orbits[o];
        orb.lineMat.color.copy(tmpHaloColor);
        orb.lineMat.opacity = orbitOp;
        orb.dotMat.color.copy(tmpCoreColor);
        const u = ((t * orb.speed + orb.phase) % 1 + 1) % 1;
        orb.curve.getPointAt(u, orbitPt);
        orb.dotSprite.position.set(orbitPt.x, orbitPt.y, 0);
      }

      // 400 Sparkle Sub-Cloud soft atmospheric parallax drift
      if (!freezeMotion) {
        for (let i = 0; i < SPARKLE_COUNT; i++) {
          const i3 = i * 3;
          const ph = sparklePhase[i];
          sparkleLive[i3] = sparkleBase[i3] + Math.sin(t * 0.22 + ph) * 0.24;
          sparkleLive[i3 + 1] =
            sparkleBase[i3 + 1] + Math.cos(t * 0.18 + ph * 1.3) * 0.18;
          sparkleLive[i3 + 2] = sparkleBase[i3 + 2];
        }
        sparklePosAttr.needsUpdate = true;
        sparkleMat.opacity = 0.56 + Math.sin(t * 0.85) * 0.08;
      }

      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateLayout);
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);

      mainGeo.dispose();
      mainMat.dispose();
      fresnelGeo.dispose();
      fresnelMat.dispose();
      innerDarkGeo.dispose();
      innerDarkMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      sonarGeo.dispose();
      for (const r of sonarRings) {
        r.mat.dispose();
      }
      for (const o of orbits) {
        o.lineGeo.dispose();
        o.lineMat.dispose();
        o.dotMat.dispose();
      }
      sparkleGeo.dispose();
      sparkleMat.dispose();

      glowTex.dispose();
      sparkleTex.dispose();
      haloTex.dispose();
      nebulaTex.dispose();

      renderer.dispose();
    };
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full pointer-events-none"
    />
  );
}

export default VolumetricMorphStage;
