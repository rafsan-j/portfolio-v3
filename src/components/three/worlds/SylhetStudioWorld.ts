import * as THREE from 'three';
import type { StudioMood, WorldHandle } from './types';

interface MoodPreset {
  lampColor: THREE.Color;
  lampIntensity: number;
  bulbEmissive: THREE.Color;
  keyColor: THREE.Color;
  keyIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  rainSpeed: number;
  rainDensity: number;
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  bokehIntensity: number;
  coneOpacity: number;
}

const MOOD_PRESETS: Record<StudioMood, MoodPreset> = {
  midnight: {
    lampColor: new THREE.Color('#ffae52'),
    lampIntensity: 24,
    bulbEmissive: new THREE.Color('#ffc978'),
    keyColor: new THREE.Color('#8cb4d8'),
    keyIntensity: 0.75,
    ambientColor: new THREE.Color('#182130'),
    ambientIntensity: 0.65,
    rainSpeed: 1.0,
    rainDensity: 0.75,
    skyTop: new THREE.Color('#070b14'),
    skyBottom: new THREE.Color('#131e30'),
    bokehIntensity: 0.85,
    coneOpacity: 0.14,
  },
  monsoon: {
    lampColor: new THREE.Color('#ff9d3b'),
    lampIntensity: 28,
    bulbEmissive: new THREE.Color('#ffb85c'),
    keyColor: new THREE.Color('#5fa39c'),
    keyIntensity: 0.95,
    ambientColor: new THREE.Color('#102424'),
    ambientIntensity: 0.58,
    rainSpeed: 1.85,
    rainDensity: 1.25,
    skyTop: new THREE.Color('#050d10'),
    skyBottom: new THREE.Color('#122a2d'),
    bokehIntensity: 0.65,
    coneOpacity: 0.17,
  },
  dawn: {
    lampColor: new THREE.Color('#ffd096'),
    lampIntensity: 13,
    bulbEmissive: new THREE.Color('#ffe0b5'),
    keyColor: new THREE.Color('#e8b298'),
    keyIntensity: 1.35,
    ambientColor: new THREE.Color('#2d2533'),
    ambientIntensity: 0.95,
    rainSpeed: 0.55,
    rainDensity: 0.42,
    skyTop: new THREE.Color('#1d2038'),
    skyBottom: new THREE.Color('#6b484a'),
    bokehIntensity: 0.45,
    coneOpacity: 0.08,
  },
};

const RAIN_WINDOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RAIN_WINDOW_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uRainSpeed;
  uniform float uRainDensity;
  uniform float uBokehIntensity;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyBottom;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float rainLayer(vec2 uv, float scaleX, float scaleY, float speed, float t) {
    vec2 slanted = vec2(uv.x + uv.y * 0.14, uv.y);
    vec2 grid = vec2(slanted.x * scaleX, slanted.y * scaleY + t * speed);
    vec2 id = floor(grid);
    vec2 f = fract(grid);

    float rnd = hash12(id);
    float xOff = 0.2 + 0.6 * hash12(id + 17.3);
    float dx = abs(f.x - xOff);
    float streakWidth = 0.055;
    float head = smoothstep(0.0, 0.25, f.y) * smoothstep(1.0, 0.15, f.y);
    float line = smoothstep(streakWidth, 0.0, dx) * head;
    float presence = step(1.0 - clamp(0.45 * uRainDensity, 0.15, 0.85), rnd);
    return line * presence * (0.4 + 0.6 * rnd);
  }

  void main() {
    vec2 uv = vUv;
    vec3 col = mix(uSkyBottom, uSkyTop, smoothstep(0.0, 1.0, uv.y));

    // Distant Sylhet / Dhaka skyline silhouette glow
    float horizonGlow = exp(-pow((uv.y - 0.18) * 3.8, 2.0));
    col += vec3(0.32, 0.20, 0.14) * horizonGlow * uBokehIntensity * 0.55;

    // Soft distant bokeh lights outside the rainy glass
    vec3 bokehSum = vec3(0.0);
    for (int i = 0; i < 14; i++) {
      float fi = float(i);
      vec2 seed = hash22(vec2(fi * 3.17, fi * 7.41));
      vec2 center = vec2(0.08 + 0.84 * seed.x, 0.10 + 0.42 * seed.y);
      float radius = 0.035 + 0.045 * fract(seed.x * 13.7);
      vec2 diff = (uv - center) * vec2(1.65, 1.0);
      float d = length(diff);
      float disc = smoothstep(radius, radius * 0.25, d);
      float twinkle = 0.78 + 0.22 * sin(uTime * (0.8 + seed.y * 1.4) + fi * 2.1);

      vec3 tint = (mod(fi, 3.0) < 0.5)
        ? vec3(1.0, 0.68, 0.34)
        : (mod(fi, 3.0) < 1.5)
          ? vec3(0.42, 0.78, 0.74)
          : vec3(0.95, 0.86, 0.74);

      bokehSum += tint * disc * twinkle * 0.22;
    }
    col += bokehSum * uBokehIntensity;

    // Subtle monsoon sheet lightning when rain is heavy
    float stormFactor = smoothstep(1.2, 1.8, uRainSpeed);
    float flash = pow(max(0.0, sin(uTime * 0.73) * sin(uTime * 2.91 + 1.4)), 14.0) * stormFactor;
    col += vec3(0.45, 0.65, 0.75) * flash * 0.55;

    // Multi-layered backlit rain streaks
    float t = uTime * uRainSpeed;
    float r1 = rainLayer(uv, 46.0, 4.2, 3.4, t);
    float r2 = rainLayer(uv + vec2(0.31, 0.17), 78.0, 6.5, 4.8, t);
    float r3 = rainLayer(uv + vec2(0.67, 0.53), 28.0, 2.6, 2.2, t);
    float rain = r1 * 0.55 + r2 * 0.35 + r3 * 0.45;

    vec3 rainTint = mix(vec3(0.65, 0.78, 0.90), vec3(0.98, 0.80, 0.58), horizonGlow * 0.6);
    col += rainTint * rain * 0.58;

    // Glass condensation vignette
    float vig = smoothstep(0.0, 0.16, uv.x) * smoothstep(1.0, 0.84, uv.x)
              * smoothstep(0.0, 0.14, uv.y) * smoothstep(1.0, 0.86, uv.y);
    col *= 0.62 + 0.38 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const LIGHT_CONE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const LIGHT_CONE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  void main() {
    vec3 viewDir = normalize(vViewPos);
    float edgeSoft = pow(abs(dot(normalize(vNormalView), viewDir)), 1.5);
    float verticalFade = smoothstep(0.0, 0.85, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    float alpha = edgeSoft * verticalFade * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function createWalnutTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      const wave = Math.sin(y * 0.045) * 14 + Math.cos(y * 0.017) * 8;
      const shade = Math.floor(42 + 18 * Math.sin((y + wave) * 0.11));
      ctx.fillStyle = `rgb(${shade + 18}, ${Math.floor(shade * 0.65)}, ${Math.floor(shade * 0.38)})`;
      ctx.fillRect(0, y, 512, 2);
    }

    // Subtle dark walnut grain streaks
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 65; i++) {
      const y = (i * 512) / 65;
      ctx.strokeStyle = i % 3 === 0 ? '#1b0e07' : '#573621';
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        const dy = Math.sin(x * 0.02 + i * 0.7) * 5;
        ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.2);
  return tex;
}

function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 245, 224, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 224, 178, 0.55)');
    grad.addColorStop(1, 'rgba(255, 200, 140, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const TELEMETRY_LINES = [
  'sylhet-node@v4:~$ npm run spatial:build --release',
  '[shader] monsoon_rain.glsl compiled  (0.42ms)',
  '[haor]   sunamganj_basin: 4.82m  | surge_prob: 0.18',
  '[vault]  otto_aes256_gcm: SEALED | drift: 0.00 BDT',
  '[vellum] qurrat_al_ayn :: VLM-2026-001 :: 60fps',
  '[ledger] hamilton_paisa_alloc: 4 members -> 0p drift',
  'const uTime = uniforms.uTime.value += dt * speed;',
  'vec3 fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);',
  '[gpu]    draw_calls: 34 | textures: procedural | 0ms io',
  '[sust]   sylhet_studio :: 24.9172 N, 91.8319 E',
  'export function createSpatialWorlds(): WorldHandle[]',
  '[net]    offline_ready: true | external_assets: 0',
];

function drawMonitorScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  mood: StudioMood
): void {
  ctx.fillStyle = '#0a0e13';
  ctx.fillRect(0, 0, width, height);

  // Subtle top bar
  ctx.fillStyle = '#121821';
  ctx.fillRect(0, 0, width, 28);
  const accent = mood === 'monsoon' ? '#4fb8a8' : mood === 'dawn' ? '#e6a57e' : '#e6a95c';
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(18, 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b99ab';
  ctx.font = '600 11px monospace';
  ctx.fillText('SYLHET STUDIO // SPATIAL TELEMETRY V4', 32, 18);
  ctx.fillText(`MOOD: ${mood.toUpperCase()}`, width - 135, 18);

  // Left pane: scrolling code/telemetry lines
  ctx.font = '12px monospace';
  const lineH = 19;
  const scrollOffset = (elapsed * 18) % (TELEMETRY_LINES.length * lineH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(12, 36, width * 0.64, height - 48);
  ctx.clip();

  for (let i = 0; i < TELEMETRY_LINES.length * 2; i++) {
    const y = 52 + i * lineH - scrollOffset;
    if (y < 30 || y > height) continue;
    const text = TELEMETRY_LINES[i % TELEMETRY_LINES.length];
    ctx.fillStyle = text.startsWith('[') ? accent : '#c7d2df';
    ctx.fillText(text, 18, y);
  }
  ctx.restore();

  // Right pane: live waveform & telemetry bars
  const rx = Math.floor(width * 0.68);
  const rw = width - rx - 16;
  ctx.strokeStyle = '#1e2a38';
  ctx.lineWidth = 1;
  ctx.strokeRect(rx, 40, rw, height - 56);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const px = rx + 10 + ((rw - 20) * i) / 40;
    const py =
      98 +
      Math.sin(i * 0.45 + elapsed * 3.2) * 18 +
      Math.cos(i * 0.21 - elapsed * 1.7) * 9;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Metric bars
  for (let b = 0; b < 5; b++) {
    const barY = 148 + b * 18;
    const val = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(elapsed * 1.4 + b * 1.3));
    ctx.fillStyle = '#18222e';
    ctx.fillRect(rx + 10, barY, rw - 20, 8);
    ctx.fillStyle = accent;
    ctx.fillRect(rx + 10, barY, (rw - 20) * val, 8);
  }
}

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

export function createSylhetStudioWorld(): WorldHandle & {
  setMood: (mood: StudioMood) => void;
} {
  const group = new THREE.Group();
  group.name = 'SylhetStudioWorld';
  group.position.set(0, 0, 0);

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

  let currentMood: StudioMood = 'midnight';
  const activePreset = MOOD_PRESETS.midnight;

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(
    activePreset.ambientColor.clone(),
    activePreset.ambientIntensity
  );
  group.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(
    activePreset.keyColor.clone(),
    activePreset.keyIntensity
  );
  keyLight.position.set(2.5, 4.2, 3.8);
  group.add(keyLight);

  // --- Beveled Walnut Desktop ---
  const walnutTex = trackTex(createWalnutTexture());
  const deskShape = createRoundedRectShape(7.2, 3.2, 0.16);
  const deskGeo = trackGeo(
    new THREE.ExtrudeGeometry(deskShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 4,
    })
  );
  deskGeo.rotateX(Math.PI / 2);
  const deskMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: walnutTex,
      roughness: 0.56,
      metalness: 0.08,
    })
  );
  const deskMesh = new THREE.Mesh(deskGeo, deskMat);
  deskMesh.position.set(0, -1.0, 0);
  group.add(deskMesh);

  // Matte-steel desk legs
  const legMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#171a1f',
      roughness: 0.5,
      metalness: 0.72,
    })
  );
  const legGeo = trackGeo(new THREE.BoxGeometry(0.12, 2.2, 2.4));
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-3.1, -2.25, 0);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(3.1, -2.25, 0);
  group.add(leftLeg, rightLeg);

  // --- Architectural Back Wall & Rainy Window ---
  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#11151b',
      roughness: 0.88,
      metalness: 0.08,
    })
  );
  const wallZ = -2.15;
  const topWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14, 2.4, 0.3)), wallMat);
  topWall.position.set(0, 3.4, wallZ);
  const bottomWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(14, 3.2, 0.3)), wallMat);
  bottomWall.position.set(0, -2.2, wallZ);
  const leftWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.2, 4.4, 0.3)), wallMat);
  leftWall.position.set(-5.1, 0.6, wallZ);
  const rightWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.2, 4.4, 0.3)), wallMat);
  rightWall.position.set(5.1, 0.6, wallZ);
  group.add(topWall, bottomWall, leftWall, rightWall);

  // Window frame & mullions
  const frameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#181c22',
      roughness: 0.42,
      metalness: 0.65,
    })
  );
  const mullionV = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 2.8, 0.18)), frameMat);
  mullionV.position.set(0, 0.8, wallZ + 0.04);
  const mullionH = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.0, 0.07, 0.18)), frameMat);
  mullionH.position.set(0, 0.95, wallZ + 0.04);
  const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.3, 0.1, 0.42)), frameMat);
  sill.position.set(0, -0.62, wallZ + 0.12);
  group.add(mullionV, mullionH, sill);

  // Monsoon Rain Shader Window Pane
  const rainUniforms = {
    uTime: { value: 0 },
    uRainSpeed: { value: activePreset.rainSpeed },
    uRainDensity: { value: activePreset.rainDensity },
    uBokehIntensity: { value: activePreset.bokehIntensity },
    uSkyTop: { value: activePreset.skyTop.clone() },
    uSkyBottom: { value: activePreset.skyBottom.clone() },
  };
  const rainMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: rainUniforms,
      vertexShader: RAIN_WINDOW_VERT,
      fragmentShader: RAIN_WINDOW_FRAG,
    })
  );
  const rainPane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(6.0, 2.85)), rainMat);
  rainPane.position.set(0, 0.8, wallZ - 0.06);
  group.add(rainPane);

  // --- Brushed-Brass Gooseneck Edison Desk Lamp ---
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-2.35, -0.98, -0.45);
  group.add(lampGroup);

  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#c9a259',
      roughness: 0.3,
      metalness: 0.88,
    })
  );

  const lampBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.38, 0.09, 32)),
    brassMat
  );
  lampBase.position.y = 0.045;
  lampGroup.add(lampBase);

  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.08, 0),
    new THREE.Vector3(-0.18, 0.95, -0.1),
    new THREE.Vector3(0.05, 1.82, 0.06),
    new THREE.Vector3(0.58, 1.66, 0.22),
  ]);
  const neckGeo = trackGeo(new THREE.TubeGeometry(neckCurve, 36, 0.032, 12, false));
  const neckMesh = new THREE.Mesh(neckGeo, brassMat);
  lampGroup.add(neckMesh);

  const shadeGroup = new THREE.Group();
  shadeGroup.position.set(0.62, 1.62, 0.24);
  shadeGroup.rotation.set(0.28, 0, -0.34);
  lampGroup.add(shadeGroup);

  const shadeGeo = trackGeo(new THREE.ConeGeometry(0.32, 0.36, 32, 1, true));
  const shadeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#b8914a',
      roughness: 0.28,
      metalness: 0.9,
      side: THREE.DoubleSide,
    })
  );
  const shadeMesh = new THREE.Mesh(shadeGeo, shadeMat);
  shadeGroup.add(shadeMesh);

  const bulbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fff2d6',
      emissive: activePreset.bulbEmissive.clone(),
      emissiveIntensity: 3.4,
      roughness: 0.15,
      metalness: 0.0,
    })
  );
  const bulbMesh = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.085, 18, 18)), bulbMat);
  bulbMesh.position.y = -0.14;
  shadeGroup.add(bulbMesh);

  // Volumetric additive light-cone mesh
  const coneUniforms = {
    uColor: { value: activePreset.lampColor.clone() },
    uOpacity: { value: activePreset.coneOpacity },
  };
  const coneMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: coneUniforms,
      vertexShader: LIGHT_CONE_VERT,
      fragmentShader: LIGHT_CONE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  const coneMesh = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(1.18, 1.95, 32, 1, true)),
    coneMat
  );
  coneMesh.position.y = -1.08;
  shadeGroup.add(coneMesh);

  // Real SpotLight + PointLight from Edison lamp
  const lampSpot = new THREE.SpotLight(
    activePreset.lampColor.clone(),
    activePreset.lampIntensity,
    10,
    Math.PI * 0.32,
    0.68,
    1.5
  );
  lampSpot.position.set(-1.72, 0.56, -0.2);
  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(-0.8, -1.0, 0.15);
  group.add(lampTarget);
  lampSpot.target = lampTarget;
  group.add(lampSpot);

  const bulbPoint = new THREE.PointLight(activePreset.lampColor.clone(), 4.5, 4.5, 1.8);
  bulbPoint.position.set(-1.72, 0.48, -0.2);
  group.add(bulbPoint);

  // --- Curved Ultrawide Monitor ---
  const monitorGroup = new THREE.Group();
  monitorGroup.position.set(0.18, 0.06, -0.78);
  group.add(monitorGroup);

  const monitorCanvas = document.createElement('canvas');
  monitorCanvas.width = 768;
  monitorCanvas.height = 288;
  const monitorCtx = monitorCanvas.getContext('2d');
  if (monitorCtx) {
    drawMonitorScreen(monitorCtx, monitorCanvas.width, monitorCanvas.height, 0, currentMood);
  }
  const monitorTex = trackTex(new THREE.CanvasTexture(monitorCanvas));
  monitorTex.colorSpace = THREE.SRGBColorSpace;

  const curveRadius = 5.4;
  const arcAngle = 0.58;
  const screenGeo = trackGeo(
    new THREE.CylinderGeometry(
      curveRadius,
      curveRadius,
      1.18,
      40,
      1,
      true,
      Math.PI - arcAngle * 0.5,
      arcAngle
    )
  );
  // Flip UV horizontally so inner concave face reads left-to-right
  const uvAttr = screenGeo.attributes.uv;
  for (let i = 0; i < uvAttr.count; i++) {
    uvAttr.setX(i, 1 - uvAttr.getX(i));
  }
  uvAttr.needsUpdate = true;

  const screenMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: monitorTex,
      side: THREE.BackSide,
    })
  );
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = curveRadius;
  monitorGroup.add(screenMesh);

  // Monitor backshell
  const bezelGeo = trackGeo(
    new THREE.CylinderGeometry(
      curveRadius + 0.03,
      curveRadius + 0.03,
      1.26,
      40,
      1,
      true,
      Math.PI - (arcAngle + 0.025) * 0.5,
      arcAngle + 0.025
    )
  );
  const bezelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#14171c',
      roughness: 0.38,
      metalness: 0.75,
      side: THREE.DoubleSide,
    })
  );
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = curveRadius;
  monitorGroup.add(bezelMesh);

  // Monitor stand
  const standNeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 0.92, 0.08)), bezelMat);
  standNeck.position.set(0, -0.64, -0.14);
  const standFoot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.04, 0.42)), bezelMat);
  standFoot.position.set(0, -1.03, -0.02);
  monitorGroup.add(standNeck, standFoot);

  // --- Dark Mechanical Keyboard with Warm Amber Underglow ---
  const kbGroup = new THREE.Group();
  kbGroup.position.set(0.12, -0.94, 0.42);
  kbGroup.rotation.x = 0.07;
  group.add(kbGroup);

  const kbCaseMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#171a20',
      roughness: 0.42,
      metalness: 0.62,
    })
  );
  const kbCase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.62, 0.075, 0.56)), kbCaseMat);
  kbGroup.add(kbCase);

  const keyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#232832',
      roughness: 0.55,
      metalness: 0.18,
    })
  );
  const accentKeyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#c98842',
      roughness: 0.45,
      metalness: 0.2,
    })
  );
  const keyGeo = trackGeo(new THREE.BoxGeometry(0.082, 0.036, 0.082));
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 14; col++) {
      const isAccent = (row === 0 && col === 0) || (row === 2 && col === 13);
      const key = new THREE.Mesh(keyGeo, isAccent ? accentKeyMat : keyMat);
      key.position.set(-0.68 + col * 0.105, 0.052, -0.16 + row * 0.105);
      kbGroup.add(key);
    }
  }

  const underglowMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#ff9d3b',
      transparent: true,
      opacity: 0.85,
    })
  );
  const underglowStrip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.66, 0.018, 0.59)),
    underglowMat
  );
  underglowStrip.position.y = -0.034;
  kbGroup.add(underglowStrip);

  // --- Ceramic Coffee Mug + Procedural Steam Particles ---
  const mugGroup = new THREE.Group();
  mugGroup.position.set(1.92, -0.98, 0.25);
  group.add(mugGroup);

  const mugProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.15, 0.0),
    new THREE.Vector2(0.175, 0.05),
    new THREE.Vector2(0.18, 0.34),
    new THREE.Vector2(0.16, 0.35),
    new THREE.Vector2(0.15, 0.05),
    new THREE.Vector2(0.0, 0.05),
  ];
  const mugMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#d8cfc2',
      roughness: 0.36,
      metalness: 0.06,
    })
  );
  const mugMesh = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(mugProfile, 28)), mugMat);
  mugGroup.add(mugMesh);

  const handleMesh = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.095, 0.02, 12, 24, Math.PI)),
    mugMat
  );
  handleMesh.rotation.z = -Math.PI * 0.5;
  handleMesh.position.set(0.17, 0.19, 0);
  mugGroup.add(handleMesh);

  const coffeeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1c1009',
      roughness: 0.12,
      metalness: 0.1,
    })
  );
  const coffeeDisc = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.155, 24)), coffeeMat);
  coffeeDisc.rotation.x = -Math.PI * 0.5;
  coffeeDisc.position.y = 0.29;
  mugGroup.add(coffeeDisc);

  const softTex = trackTex(createSoftParticleTexture());

  const STEAM_COUNT = 28;
  const steamPositions = new Float32Array(STEAM_COUNT * 3);
  const steamPhases = new Float32Array(STEAM_COUNT);
  for (let i = 0; i < STEAM_COUNT; i++) {
    steamPhases[i] = i / STEAM_COUNT;
    steamPositions[i * 3] = 0;
    steamPositions[i * 3 + 1] = 0.34 + steamPhases[i] * 0.8;
    steamPositions[i * 3 + 2] = 0;
  }
  const steamGeo = trackGeo(new THREE.BufferGeometry());
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
  const steamMat = trackMat(
    new THREE.PointsMaterial({
      map: softTex,
      color: '#efe7dc',
      size: 0.22,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })
  );
  const steamPoints = new THREE.Points(steamGeo, steamMat);
  mugGroup.add(steamPoints);

  // --- 300 Floating Warm Dust Motes ---
  const DUST_COUNT = 300;
  const dustBase = new Float32Array(DUST_COUNT * 3);
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    const s1 = Math.sin(i * 12.9898) * 43758.5453;
    const s2 = Math.sin(i * 78.233 + 1.7) * 43758.5453;
    const s3 = Math.sin(i * 39.425 + 4.1) * 43758.5453;
    const rx = (s1 - Math.floor(s1) - 0.5) * 6.8;
    const ry = (s2 - Math.floor(s2)) * 2.8 - 0.8;
    const rz = (s3 - Math.floor(s3) - 0.5) * 3.4;
    dustBase[i * 3] = rx;
    dustBase[i * 3 + 1] = ry;
    dustBase[i * 3 + 2] = rz;
    dustPositions[i * 3] = rx;
    dustPositions[i * 3 + 1] = ry;
    dustPositions[i * 3 + 2] = rz;
    dustSeeds[i] = (i * 0.6180339) % 1;
  }
  const dustGeo = trackGeo(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = trackMat(
    new THREE.PointsMaterial({
      map: softTex,
      color: '#ffd79a',
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  group.add(dustPoints);

  let lastMonitorRedraw = 0;

  return {
    group,
    setMood(mood: StudioMood) {
      currentMood = mood;
    },
    update(elapsed, dt, pointer, activeWeight) {
      const lerpAlpha = 1 - Math.exp(-Math.min(dt, 0.1) * 3.2);
      const target = MOOD_PRESETS[currentMood];

      // Smooth mood interpolation
      lampSpot.color.lerp(target.lampColor, lerpAlpha);
      lampSpot.intensity = THREE.MathUtils.lerp(lampSpot.intensity, target.lampIntensity, lerpAlpha);
      bulbPoint.color.lerp(target.lampColor, lerpAlpha);
      bulbPoint.intensity = THREE.MathUtils.lerp(
        bulbPoint.intensity,
        target.lampIntensity * 0.19,
        lerpAlpha
      );
      bulbMat.emissive.lerp(target.bulbEmissive, lerpAlpha);
      keyLight.color.lerp(target.keyColor, lerpAlpha);
      keyLight.intensity = THREE.MathUtils.lerp(keyLight.intensity, target.keyIntensity, lerpAlpha);
      ambientLight.color.lerp(target.ambientColor, lerpAlpha);
      ambientLight.intensity = THREE.MathUtils.lerp(
        ambientLight.intensity,
        target.ambientIntensity,
        lerpAlpha
      );
      coneUniforms.uColor.value.lerp(target.lampColor, lerpAlpha);
      coneUniforms.uOpacity.value = THREE.MathUtils.lerp(
        coneUniforms.uOpacity.value,
        target.coneOpacity,
        lerpAlpha
      );

      rainUniforms.uTime.value = elapsed;
      rainUniforms.uRainSpeed.value = THREE.MathUtils.lerp(
        rainUniforms.uRainSpeed.value,
        target.rainSpeed,
        lerpAlpha
      );
      rainUniforms.uRainDensity.value = THREE.MathUtils.lerp(
        rainUniforms.uRainDensity.value,
        target.rainDensity,
        lerpAlpha
      );
      rainUniforms.uBokehIntensity.value = THREE.MathUtils.lerp(
        rainUniforms.uBokehIntensity.value,
        target.bokehIntensity,
        lerpAlpha
      );
      rainUniforms.uSkyTop.value.lerp(target.skyTop, lerpAlpha);
      rainUniforms.uSkyBottom.value.lerp(target.skyBottom, lerpAlpha);

      // Subtle pointer parallax
      const targetRotY = pointer.x * 0.08 * activeWeight;
      const targetRotX = -pointer.y * 0.04 * activeWeight;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, lerpAlpha * 1.5);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, lerpAlpha * 1.5);

      if (activeWeight <= 0.01) return;

      // Update rising coffee steam
      const steamPos = steamGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < STEAM_COUNT; i++) {
        const life = (steamPhases[i] + elapsed * 0.24) % 1;
        const swirl = life * 4.5 + i;
        steamPos.setXYZ(
          i,
          Math.sin(swirl) * (0.03 + life * 0.09),
          0.34 + life * 0.85,
          Math.cos(swirl * 0.85) * (0.03 + life * 0.08)
        );
      }
      steamPos.needsUpdate = true;

      // Update 300 floating dust motes
      const dustPos = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST_COUNT; i++) {
        const seed = dustSeeds[i] * Math.PI * 2;
        const bx = dustBase[i * 3];
        const by = dustBase[i * 3 + 1];
        const bz = dustBase[i * 3 + 2];
        dustPos.setXYZ(
          i,
          bx + Math.sin(elapsed * 0.35 + seed) * 0.14,
          by + Math.cos(elapsed * 0.28 + seed * 1.3) * 0.12,
          bz + Math.sin(elapsed * 0.22 + seed * 0.7) * 0.1
        );
      }
      dustPos.needsUpdate = true;

      // Throttled live monitor telemetry redraw (~12 fps)
      if (monitorCtx && elapsed - lastMonitorRedraw > 0.08) {
        lastMonitorRedraw = elapsed;
        drawMonitorScreen(
          monitorCtx,
          monitorCanvas.width,
          monitorCanvas.height,
          elapsed,
          currentMood
        );
        monitorTex.needsUpdate = true;
      }
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
