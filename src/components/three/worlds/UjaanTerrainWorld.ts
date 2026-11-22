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
    vec3 lowCol = vec3(0.045, 0.11, 0.11);
    vec3 midCol = vec3(0.085, 0.19, 0.175);
    vec3 highCol = vec3(0.17, 0.29, 0.25);

    float hNorm = clamp((vElev + 0.85) / 2.6, 0.0, 1.0);
    vec3 baseCol = mix(lowCol, midCol, smoothstep(0.0, 0.55, hNorm));
    baseCol = mix(baseCol, highCol, smoothstep(0.55, 1.0, hNorm));

    // Directional hillshade
    vec3 lightDir = normalize(vec3(0.55, 0.85, 0.45));
    float diff = 0.45 + 0.55 * max(dot(normalize(vNormalWorld), lightDir), 0.0);
    baseCol *= diff;

    // Anti-aliased topographic contour lines
    float interval = 0.22;
    float scaled = vElev / interval;
    float distToLine = abs(fract(scaled - 0.5) - 0.5) / max(fwidth(scaled), 0.0001);
    float minorLine = 1.0 - smoothstep(0.65, 1.45, distToLine);

    float majorScaled = vElev / (interval * 4.0);
    float distToMajor = abs(fract(majorScaled - 0.5) - 0.5) / max(fwidth(majorScaled), 0.0001);
    float majorLine = 1.0 - smoothstep(0.7, 1.6, distToMajor);

    vec3 contourColor = vec3(0.32, 0.62, 0.54);
    baseCol = mix(baseCol, contourColor, minorLine * 0.28);
    baseCol = mix(baseCol, vec3(0.75, 0.66, 0.45), majorLine * 0.36);

    // Wet shoreline darkening & subtle foam band near water level
    float shoreDist = vElev - uWaterLevel;
    float wetBand = smoothstep(0.28, 0.0, abs(shoreDist));
    baseCol *= 1.0 - 0.26 * wetBand;
    float foamLine = smoothstep(0.06, 0.0, abs(shoreDist));
    baseCol += vec3(0.38, 0.68, 0.66) * foamLine * 0.35;

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
    float disp = (w1 + w2) * uWaveAmp;
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
    vec3 n = normalize(vec3(
      cos(vWorldPos.x * 1.8 + uTime * uWaveSpeed) * 0.14,
      1.0,
      sin(vWorldPos.z * 1.8 + uTime * uWaveSpeed * 0.9) * 0.14
    ));

    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
    vec3 lightDir = normalize(vec3(0.4, 0.85, 0.35));
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfVec), 0.0), 42.0);

    vec3 col = uWaterTint;
    col += vec3(0.28, 0.62, 0.64) * fresnel * 0.65;
    col += vec3(0.95, 0.84, 0.62) * spec * (0.55 + uWarningIntensity * 0.35);
    col += vec3(0.85, 0.55, 0.22) * smoothstep(0.6, 1.3, uWarningIntensity) * fresnel * 0.35;
    col += vec3(0.18, 0.36, 0.38) * clamp(vRipple * 3.5, 0.0, 1.0) * 0.25;

    float edgeFade = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x)
                   * smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.96, vUv.y);
    gl_FragColor = vec4(col, (0.62 + fresnel * 0.22) * edgeFade);
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
    float pulse = smoothstep(0.28, 0.0, dist);
    float baseLine = 0.24;
    vec3 amber = vec3(1.0, 0.70, 0.28);
    vec3 hotCore = vec3(1.0, 0.92, 0.70);
    vec3 col = mix(amber, hotCore, pulse);
    float alpha = clamp(baseLine + pulse * (0.76 + uWarningIntensity * 0.2), 0.0, 1.0);
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
    float ring = smoothstep(0.09, 0.0, abs(r - cycle)) * (1.0 - cycle);
    float staticRing = smoothstep(0.05, 0.0, abs(r - 0.32)) * 0.45;
    float alpha = (ring * (0.4 + uWarningIntensity * 0.65) + staticRing) * step(r, 1.0);
    vec3 col = mix(vec3(0.95, 0.68, 0.26), vec3(1.0, 0.44, 0.16), smoothstep(0.5, 1.3, uWarningIntensity));
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
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

  // --- Sculpted Haor Basin Terrain ---
  const terrainGeo = trackGeo(new THREE.PlaneGeometry(14, 14, 84, 84));
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

  // Architectural Diorama Plinth Frame
  const plinthMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#0c1315',
      roughness: 0.62,
      metalness: 0.45,
    })
  );
  const plinthMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14.3, 0.7, 14.3)), plinthMat);
  plinthMesh.position.y = -1.18;
  group.add(plinthMesh);

  // --- Translucent Animated GLSL Floodwater Plane ---
  const waterGeo = trackGeo(new THREE.PlaneGeometry(13.9, 13.9, 64, 64));
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

  // --- 5 Sub-Basin Amber Beacon Pillars & Warning Rings ---
  const beaconMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#ffb94d',
      emissive: '#f59227',
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.3,
    })
  );
  const baseRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1b2729',
      roughness: 0.4,
      metalness: 0.78,
    })
  );
  const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.06, 0.11, 1.35, 16));
  const collarGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.28, 0.14, 20));
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
    pillar.position.y = 0.72;
    beaconGroup.add(pillar);

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
    sprite.position.set(0, 1.72, 0);
    sprite.scale.set(1.65, 0.42, 1);
    beaconGroup.add(sprite);

    beaconTips.push(new THREE.Vector3(basin.x, groundY + 1.35, basin.z));
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
    const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 48, 0.036, 8, false));
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

      // Beacon emissive pulse
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * (2.0 + waterUniforms.uWarningIntensity.value * 3.0));
      beaconMat.emissiveIntensity = 1.6 + pulse * (0.9 + waterUniforms.uWarningIntensity.value * 1.4);

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
