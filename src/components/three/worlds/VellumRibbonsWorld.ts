import * as THREE from 'three';
import type { WorldHandle } from './types';

const RIBBON_VERT = /* glsl */ `
  uniform float uSimTime;
  uniform float uPhase;
  uniform float uAmp;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float along = pos.x * 0.42;
    float wave1 = sin(along + uSimTime * 1.15 + uPhase) * uAmp;
    float wave2 = cos(along * 1.85 - uSimTime * 0.75 + uPhase * 1.4) * (uAmp * 0.42);
    float twist = sin(along * 0.65 + uSimTime * 0.55 + uPhase) * 0.55;

    // Rotate cross-section slightly for graceful silk torsion
    float cy = cos(twist);
    float sy = sin(twist);
    float ny = pos.y * cy - pos.z * sy;
    float nz = pos.y * sy + pos.z * cy;
    pos.y = ny + wave1 + wave2;
    pos.z = nz + cos(along * 0.9 + uSimTime * 0.85 + uPhase) * (uAmp * 0.75);

    // Subtle pointer magnetic bend across ribbon span
    float centerInfluence = exp(-pow(pos.x * 0.16, 2.0));
    pos.y += uPointer.y * 0.75 * centerInfluence;
    pos.z += uPointer.x * 0.65 * centerInfluence;

    // Approximate perturbed normal for silk Fresnel sheen
    float dWaveDx = cos(along + uSimTime * 1.15 + uPhase) * uAmp * 0.42;
    vec3 approxNormal = normalize(vec3(-dWaveDx, 0.35, 1.0));

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    vNormalWorld = normalize(mat3(modelMatrix) * approxNormal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const RIBBON_FRAG = /* glsl */ `
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uSheenColor;
  uniform float uSimTime;
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vWorldPos;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vNormalWorld);
    float ndotv = abs(dot(n, viewDir));
    float fresnel = pow(1.0 - ndotv, 2.8);
    float grazingRim = pow(1.0 - ndotv, 4.2);

    // Iridescent silk weave gradient along the ribbon (kept rich & below bloom threshold)
    float flowMix = 0.5 + 0.5 * sin(vUv.x * 6.2831 - uSimTime * 0.65);
    vec3 baseCol = mix(uPrimaryColor, uSecondaryColor, flowMix * 0.65) * 0.68;

    // Fine silk fiber shimmer + selective bloom-calibrated Fresnel rim (~1.15–1.35 luminance on grazing angles)
    float threads = 0.92 + 0.08 * sin(vUv.y * 95.0);
    vec3 col = baseCol * threads + uSheenColor * (fresnel * 0.58 + grazingRim * 0.72);
    col = min(col, vec3(1.36));

    // Soft cathedral edge fade at ribbon ends & borders
    float endFade = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
    float edgeFade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float alpha = (0.48 + fresnel * 0.44) * endFade * edgeFade;

    gl_FragColor = vec4(col, alpha);
  }
`;

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = w * 0.5;
  const hh = h * 0.5;
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

function createMonolithEtchingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep velvet obsidian slab
    const bg = ctx.createLinearGradient(0, 0, 512, 768);
    bg.addColorStop(0, '#0f1113');
    bg.addColorStop(0.5, '#15181b');
    bg.addColorStop(1, '#0b0d0f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 768);

    // Hairline gold cathedral frame
    ctx.strokeStyle = 'rgba(232, 223, 201, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 448, 704);
    ctx.strokeStyle = 'rgba(139, 94, 70, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, 424, 680);

    // Top geometric finial
    ctx.strokeStyle = '#E8DFC9';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(256, 118);
    ctx.lineTo(286, 148);
    ctx.lineTo(256, 178);
    ctx.lineTo(226, 148);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#8B5E46';
    ctx.beginPath();
    ctx.arc(256, 148, 5, 0, Math.PI * 2);
    ctx.fill();

    // Small archive label
    ctx.fillStyle = '#a89d86';
    ctx.font = '600 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VELLUM VOCAL ARCHIVE', 256, 240);

    // Etched gold main title
    ctx.fillStyle = '#E8DFC9';
    ctx.font = 'italic 48px Georgia, serif';
    ctx.fillText('Qurrat al-Ayn', 256, 362);

    // Divider rule
    ctx.strokeStyle = 'rgba(232, 223, 201, 0.45)';
    ctx.beginPath();
    ctx.moveTo(146, 404);
    ctx.lineTo(366, 404);
    ctx.stroke();

    // Catalog number
    ctx.fillStyle = '#d4c39c';
    ctx.font = '600 22px monospace';
    ctx.fillText('VLM-2026-001', 256, 456);

    // Footer metadata
    ctx.fillStyle = '#7e8e83';
    ctx.font = '500 15px monospace';
    ctx.fillText('A CAPPELLA  •  SPATIAL EDITION', 256, 650);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPollenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(232, 223, 201, 1)');
    g.addColorStop(0.4, 'rgba(232, 223, 201, 0.45)');
    g.addColorStop(1, 'rgba(232, 223, 201, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface RibbonSpec {
  y: number;
  z: number;
  rotZ: number;
  rotY: number;
  phase: number;
  amp: number;
  primary: string;
  secondary: string;
  sheen: string;
}

const RIBBON_SPECS: RibbonSpec[] = [
  {
    y: 1.9,
    z: -2.6,
    rotZ: 0.08,
    rotY: 0.12,
    phase: 0.0,
    amp: 0.62,
    primary: '#E8DFC9',
    secondary: '#8B5E46',
    sheen: '#fff7e6',
  },
  {
    y: 0.85,
    z: -1.4,
    rotZ: -0.06,
    rotY: -0.08,
    phase: 1.35,
    amp: 0.54,
    primary: '#8B5E46',
    secondary: '#E8DFC9',
    sheen: '#f2d9b6',
  },
  {
    y: -0.15,
    z: -3.2,
    rotZ: 0.04,
    rotY: 0.18,
    phase: 2.6,
    amp: 0.72,
    primary: '#46564B',
    secondary: '#E8DFC9',
    sheen: '#cde0d3',
  },
  {
    y: -1.25,
    z: -1.8,
    rotZ: -0.09,
    rotY: -0.14,
    phase: 3.9,
    amp: 0.58,
    primary: '#E8DFC9',
    secondary: '#46564B',
    sheen: '#f5ebd6',
  },
  {
    y: -2.15,
    z: -2.8,
    rotZ: 0.05,
    rotY: 0.06,
    phase: 5.1,
    amp: 0.65,
    primary: '#8B5E46',
    secondary: '#46564B',
    sheen: '#e8dfc9',
  },
];

export function createVellumRibbonsWorld(): WorldHandle & {
  setPlaying: (playing: boolean) => void;
} {
  const group = new THREE.Group();
  group.name = 'VellumRibbonsWorld';
  group.position.set(0, -42, -66);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  let playing = true;
  let velocity = 1.0;
  let simTime = 0;
  const smoothPointer = new THREE.Vector2(0, 0);

  // Gallery cathedral lighting
  const ambient = new THREE.AmbientLight('#2b2824', 0.9);
  const goldLight = new THREE.PointLight('#E8DFC9', 15, 18, 1.5);
  goldLight.position.set(2.5, 3.2, 4.2);
  const oxideLight = new THREE.PointLight('#8B5E46', 10, 16, 1.6);
  oxideLight.position.set(-3.5, -1.8, 2.5);
  group.add(ambient, goldLight, oxideLight);

  // --- 5 Sweeping 3D Silk Ribbons ---
  const ribbonGeo = trackGeo(new THREE.PlaneGeometry(18, 1.35, 110, 8));
  const ribbonUniformsList: {
    uSimTime: { value: number };
    uPhase: { value: number };
    uAmp: { value: number };
    uPointer: { value: THREE.Vector2 };
    uPrimaryColor: { value: THREE.Color };
    uSecondaryColor: { value: THREE.Color };
    uSheenColor: { value: THREE.Color };
  }[] = [];

  for (const spec of RIBBON_SPECS) {
    const uniforms = {
      uSimTime: { value: 0 },
      uPhase: { value: spec.phase },
      uAmp: { value: spec.amp },
      uPointer: { value: smoothPointer },
      uPrimaryColor: { value: new THREE.Color(spec.primary) },
      uSecondaryColor: { value: new THREE.Color(spec.secondary) },
      uSheenColor: { value: new THREE.Color(spec.sheen) },
    };
    ribbonUniformsList.push(uniforms);

    const mat = trackMat(
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: RIBBON_VERT,
        fragmentShader: RIBBON_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );

    const mesh = new THREE.Mesh(ribbonGeo, mat);
    mesh.position.set(0, spec.y, spec.z);
    mesh.rotation.set(0, spec.rotY, spec.rotZ);
    group.add(mesh);
  }

  // --- Central Floating Beveled Obsidian-and-Brushed-Brass Architectural Stele ---
  const monolithGroup = new THREE.Group();
  monolithGroup.position.set(0, 0, 0.35);
  group.add(monolithGroup);

  const obsidianSteleMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#0e1013',
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      metalness: 0.25,
      roughness: 0.18,
      envMapIntensity: 1.45,
    })
  );
  const etchingTex = trackTex(createMonolithEtchingTexture());
  const monolithFrontMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: etchingTex,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      metalness: 0.25,
      roughness: 0.18,
      envMapIntensity: 1.45,
    })
  );

  // Beveled architectural obsidian stele body
  const steleShape = createRoundedRectShape(2.1, 3.16, 0.06);
  const steleGeo = trackGeo(
    new THREE.ExtrudeGeometry(steleShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.032,
      bevelSize: 0.032,
      bevelSegments: 5,
    })
  );
  steleGeo.center();
  const steleMesh = new THREE.Mesh(steleGeo, obsidianSteleMat);
  monolithGroup.add(steleMesh);

  // Etched calligraphy front face mounted cleanly on beveled stele
  const frontPlaqueGeo = trackGeo(new THREE.PlaneGeometry(2.02, 3.06));
  const frontPlaqueMesh = new THREE.Mesh(frontPlaqueGeo, monolithFrontMat);
  frontPlaqueMesh.position.z = 0.114;
  monolithGroup.add(frontPlaqueMesh);

  // Recessed brushed-gold architectural trim strips (catches studio specular highlights)
  const goldTrimMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#dfc07c',
      metalness: 0.98,
      roughness: 0.15,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.6,
    })
  );
  const verticalStripGeo = trackGeo(new THREE.BoxGeometry(0.036, 3.12, 0.042));
  const leftGoldStrip = new THREE.Mesh(verticalStripGeo, goldTrimMat);
  leftGoldStrip.position.set(-1.055, 0, 0.088);
  const rightGoldStrip = new THREE.Mesh(verticalStripGeo, goldTrimMat);
  rightGoldStrip.position.set(1.055, 0, 0.088);

  const horizontalStripGeo = trackGeo(new THREE.BoxGeometry(2.14, 0.036, 0.042));
  const topGoldStrip = new THREE.Mesh(horizontalStripGeo, goldTrimMat);
  topGoldStrip.position.set(0, 1.575, 0.088);
  const bottomGoldStrip = new THREE.Mesh(horizontalStripGeo, goldTrimMat);
  bottomGoldStrip.position.set(0, -1.575, 0.088);

  // Side recessed brass reveals running down the stele flanks
  const flankRevealGeo = trackGeo(new THREE.BoxGeometry(0.018, 2.94, 0.046));
  const leftFlank = new THREE.Mesh(flankRevealGeo, goldTrimMat);
  leftFlank.position.set(-1.084, 0, 0);
  const rightFlank = new THREE.Mesh(flankRevealGeo, goldTrimMat);
  rightFlank.position.set(1.084, 0, 0);

  monolithGroup.add(
    leftGoldStrip,
    rightGoldStrip,
    topGoldStrip,
    bottomGoldStrip,
    leftFlank,
    rightFlank
  );

  // --- Ambient Floating Gold Pollen Particles ---
  const POLLEN_COUNT = 180;
  const pollenBase = new Float32Array(POLLEN_COUNT * 3);
  const pollenPos = new Float32Array(POLLEN_COUNT * 3);
  const pollenSeeds = new Float32Array(POLLEN_COUNT);

  for (let i = 0; i < POLLEN_COUNT; i++) {
    const r1 = Math.sin(i * 19.13 + 0.5) * 43758.5453;
    const r2 = Math.sin(i * 47.71 + 1.9) * 43758.5453;
    const r3 = Math.sin(i * 83.29 + 3.1) * 43758.5453;
    const x = (r1 - Math.floor(r1) - 0.5) * 14;
    const y = (r2 - Math.floor(r2) - 0.5) * 7.5;
    const z = (r3 - Math.floor(r3) - 0.5) * 6.5 - 1.0;
    pollenBase[i * 3] = x;
    pollenBase[i * 3 + 1] = y;
    pollenBase[i * 3 + 2] = z;
    pollenPos[i * 3] = x;
    pollenPos[i * 3 + 1] = y;
    pollenPos[i * 3 + 2] = z;
    pollenSeeds[i] = (i * 0.6180339) % 1;
  }

  const pollenGeo = trackGeo(new THREE.BufferGeometry());
  pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3));
  const pollenTex = trackTex(createPollenTexture());
  const pollenMat = trackMat(
    new THREE.PointsMaterial({
      map: pollenTex,
      color: '#E8DFC9',
      size: 0.085,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const pollenPoints = new THREE.Points(pollenGeo, pollenMat);
  group.add(pollenPoints);

  return {
    group,
    setPlaying(nextPlaying: boolean) {
      playing = nextPlaying;
    },
    update(_elapsed, dt, pointer, activeWeight) {
      const clampedDt = Math.min(dt, 0.1);
      const easeAlpha = 1 - Math.exp(-clampedDt * 3.5);

      // Smoothly ease velocity to a sculptural freeze (0) or full flow (1)
      velocity = THREE.MathUtils.lerp(velocity, playing ? 1.0 : 0.0, easeAlpha);
      simTime += clampedDt * velocity;

      smoothPointer.x = THREE.MathUtils.lerp(smoothPointer.x, pointer.x * activeWeight, easeAlpha * 1.4);
      smoothPointer.y = THREE.MathUtils.lerp(smoothPointer.y, pointer.y * activeWeight, easeAlpha * 1.4);

      for (const u of ribbonUniformsList) {
        u.uSimTime.value = simTime;
      }

      // Gentle monolith levitation & pointer response
      monolithGroup.position.y = Math.sin(simTime * 0.9) * 0.14;
      monolithGroup.rotation.y = smoothPointer.x * 0.24 + Math.sin(simTime * 0.45) * 0.06;
      monolithGroup.rotation.x = -smoothPointer.y * 0.12;

      if (activeWeight <= 0.01) return;

      // Update floating gold pollen
      const posAttr = pollenGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < POLLEN_COUNT; i++) {
        const seed = pollenSeeds[i] * Math.PI * 2;
        posAttr.setXYZ(
          i,
          pollenBase[i * 3] + Math.sin(simTime * 0.45 + seed) * 0.28,
          pollenBase[i * 3 + 1] + Math.cos(simTime * 0.35 + seed * 1.3) * 0.22,
          pollenBase[i * 3 + 2] + Math.sin(simTime * 0.3 + seed * 0.8) * 0.2
        );
      }
      posAttr.needsUpdate = true;
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
