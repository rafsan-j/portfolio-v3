import * as THREE from 'three';
import type { UjaanScenario, WorldHandle } from './types';

interface ScenarioConfig {
  waterY: number;
  waveAmp: number;
  waveSpeed: number;
  pulseSpeed: number;
  warningIntensity: number;
  waterTint: THREE.Color;
}

const SCENARIO_CONFIGS: Record<UjaanScenario, ScenarioConfig> = {
  normal: {
    waterY: -0.32,
    waveAmp: 0.045,
    waveSpeed: 0.9,
    pulseSpeed: 0.55,
    warningIntensity: 0.15,
    waterTint: new THREE.Color('#14474a'),
  },
  surge: {
    waterY: 0.16,
    waveAmp: 0.095,
    waveSpeed: 1.75,
    pulseSpeed: 1.15,
    warningIntensity: 0.65,
    waterTint: new THREE.Color('#195354'),
  },
  override: {
    waterY: 0.52,
    waveAmp: 0.145,
    waveSpeed: 2.5,
    pulseSpeed: 2.1,
    warningIntensity: 1.35,
    waterTint: new THREE.Color('#2a4d4c'),
  },
};

interface SubBasinSpec {
  name: string;
  x: number;
  z: number;
}

const SUB_BASINS: SubBasinSpec[] = [
  { name: 'Tahirpur', x: -3.2, z: -2.9 },
  { name: 'Sunamganj', x: -0.35, z: -1.1 },
  { name: 'Derai', x: -1.5, z: 2.1 },
  { name: 'Itna', x: -3.9, z: 3.1 },
  { name: 'Hakaluki', x: 3.6, z: 1.7 },
];

const DISPATCH_LINKS: [number, number][] = [
  [1, 0], // Sunamganj -> Tahirpur
  [1, 2], // Sunamganj -> Derai
  [2, 3], // Derai -> Itna
  [1, 4], // Sunamganj -> Hakaluki
  [0, 4], // Tahirpur -> Hakaluki
];

function sampleHaorElevation(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);
  // Central Haor bowl depression with rising northern Meghalaya-foothill rim
  const bowl = Math.pow(Math.min(distFromCenter / 6.8, 1.25), 2.1) * 1.65 - 0.68;
  const northRidge = Math.max(0, -z - 2.6) * 0.32;
  const riverChannel = -0.38 * Math.exp(-Math.pow((x + Math.sin(z * 0.45) * 1.4) * 0.72, 2));
  const detail =
    Math.sin(x * 0.55) * Math.cos(z * 0.48) * 0.28 +
    Math.sin(x * 1.18 + z * 0.82) * 0.14 +
    Math.cos(x * 1.9 - z * 1.65) * 0.07;

  return bowl + northRidge + riverChannel + detail;
}

const TERRAIN_VERT = /* glsl */ `
  varying float vElev;
  varying vec3 vNormalWorld;
  varying vec3 vWorldPos;
  void main() {
    vElev = position.y;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  uniform float uWaterLevel;
  varying float vElev;
  varying vec3 vNormalWorld;
  varying vec3 vWorldPos;

  void main() {
    vec3 lowCol = vec3(0.038, 0.095, 0.098);
    vec3 midCol = vec3(0.075, 0.172, 0.158);
    vec3 highCol = vec3(0.155, 0.265, 0.228);

    float hNorm = clamp((vElev + 0.85) / 2.6, 0.0, 1.0);
    vec3 baseCol = mix(lowCol, midCol, smoothstep(0.0, 0.55, hNorm));
    baseCol = mix(baseCol, highCol, smoothstep(0.55, 1.0, hNorm));

    // Directional hillshade with crisp ridge definition
    vec3 n = normalize(vNormalWorld);
    vec3 lightDir = normalize(vec3(0.55, 0.85, 0.45));
    float diff = 0.42 + 0.58 * max(dot(n, lightDir), 0.0);
    baseCol *= diff;

    // Anti-aliased topographic contour lines
    float interval = 0.22;
    float scaled = vElev / interval;
    float distToLine = abs(fract(scaled - 0.5) - 0.5) / max(fwidth(scaled), 0.0001);
    float minorLine = 1.0 - smoothstep(0.6, 1.35, distToLine);

    float majorScaled = vElev / (interval * 4.0);
    float distToMajor = abs(fract(majorScaled - 0.5) - 0.5) / max(fwidth(majorScaled), 0.0001);
    float majorLine = 1.0 - smoothstep(0.65, 1.5, distToMajor);

    vec3 contourColor = vec3(0.28, 0.56, 0.49);
    baseCol = mix(baseCol, contourColor, minorLine * 0.28);
    baseCol = mix(baseCol, vec3(0.68, 0.59, 0.38), majorLine * 0.36);

    // Wet shoreline darkening & subtle foam band near water level
    float shoreDist = vElev - uWaterLevel;
    float wetBand = smoothstep(0.28, 0.0, abs(shoreDist));
    baseCol *= 1.0 - 0.28 * wetBand;
    float foamLine = smoothstep(0.055, 0.0, abs(shoreDist));
    baseCol += vec3(0.32, 0.58, 0.56) * foamLine * 0.32;

    // Keep terrain cleanly below bloom threshold (0.82)
    baseCol = min(baseCol, vec3(0.72));
    gl_FragColor = vec4(baseCol, 1.0);
  }
`;

const WATER_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vRipple;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float t = uTime * uWaveSpeed;
    float w1 = sin(pos.x * 1.15 + t * 1.35) * cos(pos.z * 0.95 + t * 0.9);
    float w2 = sin(pos.x * 2.3 - pos.z * 1.85 + t * 2.1) * 0.45;
    float w3 = cos(pos.x * 3.7 + pos.z * 3.1 - t * 2.8) * 0.16;
    float disp = (w1 + w2 + w3) * uWaveAmp;
    pos.y += disp;
    vRipple = disp;
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const WATER_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform vec3 uWaterTint;
  uniform float uWarningIntensity;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vRipple;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float t = uTime * uWaveSpeed;

    // Multi-octave micro-ripple normal for crisp Fresnel-specular reflections
    float nx =
      cos(vWorldPos.x * 1.9 + t * 1.2) * 0.11 +
      cos(vWorldPos.x * 4.4 - vWorldPos.z * 3.2 + t * 2.3) * 0.055;
    float nz =
      sin(vWorldPos.z * 1.8 + t * 1.0) * 0.11 +
      sin(vWorldPos.z * 4.1 + vWorldPos.x * 2.9 - t * 2.0) * 0.055;
    vec3 n = normalize(vec3(nx, 1.0, nz));

    // Schlick Fresnel reflection against dark monsoon sky gradient
    float ndotv = clamp(dot(n, viewDir), 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - ndotv, 4.2);

    vec3 reflDir = reflect(-viewDir, n);
    float skyGrad = clamp(reflDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 monsoonZenith = vec3(0.03, 0.07, 0.10);
    vec3 monsoonHorizon = vec3(0.16, 0.34, 0.38);
    vec3 skyReflect = mix(monsoonHorizon, monsoonZenith, smoothstep(0.08, 0.72, skyGrad));

    // Dual-lobe crisp specular highlights (moonlight + amber warning bounce)
    vec3 keyLightDir = normalize(vec3(0.42, 0.86, 0.34));
    vec3 halfKey = normalize(keyLightDir + viewDir);
    float specSharp = pow(max(dot(n, halfKey), 0.0), 160.0);
    float specBroad = pow(max(dot(n, halfKey), 0.0), 34.0);

    vec3 col = mix(uWaterTint * 0.78, skyReflect, fresnel * 0.85);
    col += vec3(0.76, 0.92, 0.95) * specSharp * 0.95;
    col += vec3(0.32, 0.58, 0.60) * specBroad * 0.32;
    col += vec3(0.92, 0.62, 0.26) * smoothstep(0.45, 1.35, uWarningIntensity) * fresnel * 0.42;
    col += vec3(0.16, 0.34, 0.38) * clamp(vRipple * 3.8, 0.0, 1.0) * 0.24;

    float edgeFade = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x)
                   * smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.96, vUv.y);
    gl_FragColor = vec4(col, (0.66 + fresnel * 0.26) * edgeFade);
  }
`;

const ARC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPulseSpeed;
  uniform float uPhaseOffset;
  uniform float uWarningIntensity;
  varying vec2 vUv;

  void main() {
    float head = fract(uTime * uPulseSpeed * 0.35 + uPhaseOffset);
    float dist = fract(head - vUv.x);
    float pulse = smoothstep(0.26, 0.0, dist);
    float coreTip = smoothstep(0.09, 0.0, dist);

    // Base filament stays subtle below bloom threshold; pulse core drives HDR bloom (> 1.4)
    vec3 baseAmber = vec3(0.62, 0.42, 0.16);
    vec3 hdrPulse = vec3(1.0, 0.82, 0.42) * (1.65 + uWarningIntensity * 0.55);
    vec3 hdrCore = vec3(1.0, 0.95, 0.78) * (2.25 + uWarningIntensity * 0.65);

    vec3 col = mix(baseAmber, hdrPulse, pulse);
    col = mix(col, hdrCore, coreTip);

    float alpha = clamp(0.22 + pulse * (0.78 + uWarningIntensity * 0.18), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const WARNING_RING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WARNING_RING_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uWarningIntensity;
  uniform float uOffset;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float cycle = fract(uTime * (0.45 + uWarningIntensity * 0.55) + uOffset);
    float ring = smoothstep(0.085, 0.0, abs(r - cycle)) * (1.0 - cycle);
    float staticRing = smoothstep(0.045, 0.0, abs(r - 0.32)) * 0.42;
    float alpha = (ring * (0.42 + uWarningIntensity * 0.6) + staticRing) * step(r, 1.0);

    vec3 baseCol = mix(vec3(0.95, 0.68, 0.26), vec3(1.0, 0.44, 0.16), smoothstep(0.5, 1.3, uWarningIntensity));
    float hdrGain = 1.0 + ring * (0.55 + uWarningIntensity * 0.45);
    gl_FragColor = vec4(baseCol * hdrGain, clamp(alpha, 0.0, 0.95));
  }
`;

function createBasinLabelTexture(name: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = 'rgba(11, 20, 22, 0.84)';
    ctx.strokeStyle = 'rgba(244, 178, 76, 0.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, 12, 228, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f6e7c8';
    ctx.font = '600 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), 128, 33);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createUjaanTerrainWorld(): WorldHandle & {
  setScenario: (scenario: UjaanScenario) => void;
} {
  const group = new THREE.Group();
  group.name = 'UjaanTerrainWorld';
  group.position.set(0, -14, -22);

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

  let currentScenario: UjaanScenario = 'normal';
  const initCfg = SCENARIO_CONFIGS.normal;

  // Lighting
  const ambient = new THREE.AmbientLight('#1f3b3a', 0.8);
  const dirLight = new THREE.DirectionalLight('#cbe6df', 1.15);
  dirLight.position.set(5, 9, 6);
  const amberFill = new THREE.PointLight('#f5a63b', 8, 16, 1.6);
  amberFill.position.set(0, 2.5, 0);
  group.add(ambient, dirLight, amberFill);

  // --- High-Resolution 112x112 Sculpted Haor Basin Terrain ---
  const terrainGeo = trackGeo(new THREE.PlaneGeometry(14, 14, 112, 112));
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setY(i, sampleHaorElevation(x, z));
  }
  terrainGeo.computeVertexNormals();

  const terrainUniforms = {
    uWaterLevel: { value: initCfg.waterY },
  };
  const terrainMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: terrainUniforms,
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
    })
  );
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrainMesh);

  // Architectural Diorama Plinth Frame (Studio PBR)
  const plinthMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#0e1518',
      roughness: 0.28,
      metalness: 0.72,
      clearcoat: 0.5,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.25,
    })
  );
  const plinthMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14.3, 0.7, 14.3)), plinthMat);
  plinthMesh.position.y = -1.18;
  group.add(plinthMesh);

  // --- Translucent Animated GLSL Floodwater Plane ---
  const waterGeo = trackGeo(new THREE.PlaneGeometry(13.9, 13.9, 80, 80));
  waterGeo.rotateX(-Math.PI / 2);
  const waterUniforms = {
    uTime: { value: 0 },
    uWaveAmp: { value: initCfg.waveAmp },
    uWaveSpeed: { value: initCfg.waveSpeed },
    uWaterTint: { value: initCfg.waterTint.clone() },
    uWarningIntensity: { value: initCfg.warningIntensity },
  };
  const waterMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      transparent: true,
      depthWrite: false,
    })
  );
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = initCfg.waterY;
  group.add(waterMesh);

  // --- 5 Sub-Basin Amber Beacon Pillars, Bloom-Calibrated Tips & Warning Rings ---
  const beaconMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#d99a3e',
      emissive: '#e88924',
      emissiveIntensity: 1.15,
      roughness: 0.22,
      metalness: 0.78,
      clearcoat: 0.5,
      envMapIntensity: 1.35,
    })
  );
  const beaconTipMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fff1cc',
      emissive: '#ffaa3b',
      emissiveIntensity: 2.4,
      roughness: 0.12,
      metalness: 0.1,
    })
  );
  const baseRingMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#1b272a',
      roughness: 0.26,
      metalness: 0.88,
      clearcoat: 0.4,
      envMapIntensity: 1.3,
    })
  );
  const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.105, 1.32, 20));
  const tipGeo = trackGeo(new THREE.SphereGeometry(0.095, 20, 20));
  const collarGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.28, 0.14, 24));
  const ringPlaneGeo = trackGeo(new THREE.PlaneGeometry(2.1, 2.1));
  ringPlaneGeo.rotateX(-Math.PI / 2);

  const beaconTips: THREE.Vector3[] = [];
  const warningRingUniformsList: {
    uTime: { value: number };
    uWarningIntensity: { value: number };
    uOffset: { value: number };
  }[] = [];

  SUB_BASINS.forEach((basin, idx) => {
    const groundY = sampleHaorElevation(basin.x, basin.z);
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(basin.x, groundY, basin.z);
    group.add(beaconGroup);

    const collar = new THREE.Mesh(collarGeo, baseRingMat);
    collar.position.y = 0.05;
    beaconGroup.add(collar);

    const pillar = new THREE.Mesh(pillarGeo, beaconMat);
    pillar.position.y = 0.7;
    beaconGroup.add(pillar);

    const tipOrb = new THREE.Mesh(tipGeo, beaconTipMat);
    tipOrb.position.y = 1.38;
    beaconGroup.add(tipOrb);

    // Pulsing amber warning ring
    const ringUniforms = {
      uTime: { value: 0 },
      uWarningIntensity: { value: initCfg.warningIntensity },
      uOffset: { value: idx * 0.21 },
    };
    warningRingUniformsList.push(ringUniforms);
    const ringMat = trackMat(
      new THREE.ShaderMaterial({
        uniforms: ringUniforms,
        vertexShader: WARNING_RING_VERT,
        fragmentShader: WARNING_RING_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const ringMesh = new THREE.Mesh(ringPlaneGeo, ringMat);
    ringMesh.position.y = Math.max(0.18, initCfg.waterY - groundY + 0.14);
    ringMesh.userData.groundY = groundY;
    ringMesh.name = `warning-ring-${idx}`;
    beaconGroup.add(ringMesh);

    // Floating sub-basin label sprite
    const labelTex = trackTex(createBasinLabelTexture(basin.name));
    const spriteMat = trackMat(
      new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        depthWrite: false,
      })
    );
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 1.75, 0);
    sprite.scale.set(1.65, 0.42, 1);
    beaconGroup.add(sprite);

    beaconTips.push(new THREE.Vector3(basin.x, groundY + 1.38, basin.z));
  });

  // --- Animated 3D Dispatch Arcs (TubeGeometry + CatmullRomCurve3) ---
  const arcUniformsList: {
    uTime: { value: number };
    uPulseSpeed: { value: number };
    uPhaseOffset: { value: number };
    uWarningIntensity: { value: number };
  }[] = [];

  DISPATCH_LINKS.forEach(([fromIdx, toIdx], idx) => {
    const start = beaconTips[fromIdx];
    const end = beaconTips[toIdx];
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 1.65 + (idx % 2) * 0.45;

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 56, 0.036, 10, false));
    const arcUniforms = {
      uTime: { value: 0 },
      uPulseSpeed: { value: initCfg.pulseSpeed },
      uPhaseOffset: { value: idx * 0.19 },
      uWarningIntensity: { value: initCfg.warningIntensity },
    };
    arcUniformsList.push(arcUniforms);

    const arcMat = trackMat(
      new THREE.ShaderMaterial({
        uniforms: arcUniforms,
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const arcMesh = new THREE.Mesh(tubeGeo, arcMat);
    group.add(arcMesh);
  });

  return {
    group,
    setScenario(scenario: UjaanScenario) {
      currentScenario = scenario;
    },
    update(elapsed, dt, pointer, activeWeight) {
      const alpha = 1 - Math.exp(-Math.min(dt, 0.1) * 3.0);
      const cfg = SCENARIO_CONFIGS[currentScenario];

      // Physically raise/lower floodwater plane
      waterMesh.position.y = THREE.MathUtils.lerp(waterMesh.position.y, cfg.waterY, alpha);
      terrainUniforms.uWaterLevel.value = waterMesh.position.y;

      waterUniforms.uTime.value = elapsed;
      waterUniforms.uWaveAmp.value = THREE.MathUtils.lerp(
        waterUniforms.uWaveAmp.value,
        cfg.waveAmp,
        alpha
      );
      waterUniforms.uWaveSpeed.value = THREE.MathUtils.lerp(
        waterUniforms.uWaveSpeed.value,
        cfg.waveSpeed,
        alpha
      );
      waterUniforms.uWarningIntensity.value = THREE.MathUtils.lerp(
        waterUniforms.uWarningIntensity.value,
        cfg.warningIntensity,
        alpha
      );
      waterUniforms.uWaterTint.value.lerp(cfg.waterTint, alpha);

      // Update warning rings and keep them floating above current water level
      for (let i = 0; i < warningRingUniformsList.length; i++) {
        const u = warningRingUniformsList[i];
        u.uTime.value = elapsed;
        u.uWarningIntensity.value = waterUniforms.uWarningIntensity.value;
        const ringObj = group.getObjectByName(`warning-ring-${i}`);
        if (ringObj) {
          const gY = (ringObj.userData.groundY as number) ?? 0;
          ringObj.position.y = Math.max(0.16, waterMesh.position.y - gY + 0.14);
        }
      }

      // Update dispatch arc pulses
      for (const u of arcUniformsList) {
        u.uTime.value = elapsed;
        u.uPulseSpeed.value = THREE.MathUtils.lerp(u.uPulseSpeed.value, cfg.pulseSpeed, alpha);
        u.uWarningIntensity.value = waterUniforms.uWarningIntensity.value;
      }

      // Bloom-calibrated beacon tip & shaft pulse
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * (2.0 + waterUniforms.uWarningIntensity.value * 3.0));
      beaconMat.emissiveIntensity = 0.9 + pulse * (0.45 + waterUniforms.uWarningIntensity.value * 0.55);
      beaconTipMat.emissiveIntensity = 1.85 + pulse * (1.15 + waterUniforms.uWarningIntensity.value * 1.45);

      // Gentle diorama orbit & pointer tilt
      const targetRotY = pointer.x * 0.22 * activeWeight + Math.sin(elapsed * 0.14) * 0.08;
      const targetRotX = 0.16 - pointer.y * 0.08 * activeWeight;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, alpha * 1.4);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, alpha * 1.4);
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
