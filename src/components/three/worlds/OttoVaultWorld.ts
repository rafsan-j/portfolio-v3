import * as THREE from 'three';
import type { WorldHandle } from './types';

const OLED_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const OLED_FRAG = /* glsl */ `
  uniform sampler2D uRevealedTex;
  uniform sampler2D uStealthTex;
  uniform float uStealthMix;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Subtle multi-tap blur on the revealed screen as stealth engages
    float blurRadius = uStealthMix * 0.014;
    vec4 rev = texture2D(uRevealedTex, vUv) * 0.4;
    rev += texture2D(uRevealedTex, vUv + vec2(blurRadius, 0.0)) * 0.15;
    rev += texture2D(uRevealedTex, vUv - vec2(blurRadius, 0.0)) * 0.15;
    rev += texture2D(uRevealedTex, vUv + vec2(0.0, blurRadius)) * 0.15;
    rev += texture2D(uRevealedTex, vUv - vec2(0.0, blurRadius)) * 0.15;

    vec4 stl = texture2D(uStealthTex, vUv);
    vec4 col = mix(rev, stl, smoothstep(0.15, 0.92, uStealthMix));

    // Subtle OLED cryptographic scan shimmer
    float scan = 0.025 * sin(vUv.y * 85.0 - uTime * 3.5) * uStealthMix;
    col.rgb += vec3(0.12, 0.36, 0.28) * max(scan, 0.0);

    gl_FragColor = vec4(col.rgb, 1.0);
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

function createOttoScreenTexture(stealth: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep matte-obsidian OLED background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    bgGrad.addColorStop(0, '#090c0e');
    bgGrad.addColorStop(0.55, '#0d1414');
    bgGrad.addColorStop(1, '#070a0b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 1024);

    // Top status bar
    ctx.fillStyle = '#738580';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('9:41', 42, 54);
    ctx.fillStyle = '#4e8a75';
    ctx.fillText('OTTO VAULT', 350, 54);

    // AES-256-GCM Badge
    ctx.fillStyle = stealth ? 'rgba(69, 138, 114, 0.28)' : 'rgba(69, 138, 114, 0.16)';
    ctx.strokeStyle = '#4e8a75';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(42, 104, 218, 44, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9ce0c7';
    ctx.font = '700 18px monospace';
    ctx.fillText('AES-256-GCM', 76, 132);

    // Balance card
    ctx.fillStyle = 'rgba(20, 29, 29, 0.92)';
    ctx.strokeStyle = 'rgba(116, 178, 154, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(36, 184, 440, 236, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8fa39d';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('AVAILABLE VAULT BALANCE', 66, 236);

    if (stealth) {
      // Frosted masked balance + lock glyph
      ctx.fillStyle = 'rgba(156, 224, 199, 0.22)';
      ctx.beginPath();
      ctx.roundRect(66, 268, 320, 62, 14);
      ctx.fill();
      ctx.fillStyle = '#c8eee0';
      ctx.font = '700 44px monospace';
      ctx.fillText('৳ •,••,•••', 80, 314);
      ctx.fillStyle = '#7cc2a8';
      ctx.font = '600 19px monospace';
      ctx.fillText('STEALTH SHIELD ENGAGED', 66, 376);
    } else {
      ctx.fillStyle = '#f2f5f3';
      ctx.font = '700 58px sans-serif';
      ctx.fillText('৳1,48,620', 64, 318);
      ctx.fillStyle = '#6cc4a2';
      ctx.font = '600 20px monospace';
      ctx.fillText('+৳12,400 THIS MONTH  •  ZERO DRIFT', 66, 376);
    }

    // 7-Day Proportional Bars Section
    ctx.fillStyle = '#8fa39d';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('7-DAY PROPORTIONAL FLOW', 42, 486);

    const days = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
    const heights = [0.58, 0.82, 0.44, 0.94, 0.66, 0.75, 0.88];
    const barAreaTop = 530;
    const maxBarH = 260;

    for (let i = 0; i < 7; i++) {
      const bx = 48 + i * 62;
      const bw = 38;
      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(bx, barAreaTop, bw, maxBarH, 12);
      ctx.fill();

      // Active bar
      const bh = stealth ? maxBarH * 0.28 : maxBarH * heights[i];
      const by = barAreaTop + (maxBarH - bh);
      const barGrad = ctx.createLinearGradient(0, by, 0, barAreaTop + maxBarH);
      barGrad.addColorStop(0, stealth ? '#365c50' : '#73cfa9');
      barGrad.addColorStop(1, stealth ? '#1d332c' : '#2d5c4c');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 12);
      ctx.fill();

      ctx.fillStyle = '#7c8f89';
      ctx.font = '600 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(days[i], bx + bw * 0.5, barAreaTop + maxBarH + 34);
    }
    ctx.textAlign = 'left';

    // Bottom capsule dock
    ctx.fillStyle = 'rgba(22, 32, 31, 0.92)';
    ctx.strokeStyle = 'rgba(116, 178, 154, 0.22)';
    ctx.beginPath();
    ctx.roundRect(76, 896, 360, 74, 37);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stealth ? '#73cfa9' : '#d8e3df';
    ctx.font = '600 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stealth ? 'LOCKED • LOCAL KEYSTORE' : 'UNLOCKED • BIOMETRIC OK', 256, 940);
    ctx.textAlign = 'left';
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface ShardOrbit {
  mesh: THREE.Mesh;
  baseTheta: number;
  basePhi: number;
  baseRadius: number;
  speed: number;
  spinAxis: THREE.Vector3;
}

export function createOttoVaultWorld(): WorldHandle & {
  setStealth: (stealth: boolean) => void;
} {
  const group = new THREE.Group();
  group.name = 'OttoVaultWorld';
  group.position.set(0, -28, -44);

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

  let isStealth = false;
  let stealthMix = 0;

  // --- Subtle Rim & Studio Lighting ---
  const ambient = new THREE.AmbientLight('#182423', 0.85);
  const rimEmerald = new THREE.PointLight('#52b895', 16, 18, 1.5);
  rimEmerald.position.set(-3.8, 2.2, -2.5);
  const rimIvory = new THREE.PointLight('#e8e2d5', 12, 16, 1.5);
  rimIvory.position.set(3.6, 2.6, 3.2);
  const underFill = new THREE.PointLight('#2b594a', 7, 14, 1.8);
  underFill.position.set(0, -3.5, 2.0);
  group.add(ambient, rimEmerald, rimIvory, underFill);

  // --- Matte-Obsidian Android Smartphone ---
  const phoneGroup = new THREE.Group();
  group.add(phoneGroup);

  const phoneW = 1.66;
  const phoneH = 3.42;
  const phoneD = 0.14;
  const bodyShape = createRoundedRectShape(phoneW, phoneH, 0.22);
  const bodyGeo = trackGeo(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: phoneD,
      bevelEnabled: true,
      bevelThickness: 0.032,
      bevelSize: 0.028,
      bevelSegments: 5,
    })
  );
  bodyGeo.center();

  const obsidianMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#111417',
      roughness: 0.42,
      metalness: 0.38,
    })
  );
  const phoneBody = new THREE.Mesh(bodyGeo, obsidianMat);
  phoneGroup.add(phoneBody);

  // Metallic camera bar on rear face
  const titaniumMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#5b6664',
      roughness: 0.24,
      metalness: 0.9,
    })
  );
  const cameraBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.52, 0.34, 0.075)),
    titaniumMat
  );
  cameraBar.position.set(0, 0.96, -phoneD * 0.5 - 0.045);
  phoneGroup.add(cameraBar);

  const lensMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#090d10',
      roughness: 0.08,
      metalness: 0.85,
    })
  );
  const lensGeo = trackGeo(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 24));
  lensGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(-0.38 + i * 0.28, 0.96, -phoneD * 0.5 - 0.086);
    phoneGroup.add(lens);
  }

  // Side volume & power buttons
  const powerBtn = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.03, 0.24, 0.05)), titaniumMat);
  powerBtn.position.set(phoneW * 0.5 + 0.03, 0.48, 0);
  const volBtn = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.03, 0.48, 0.05)), titaniumMat);
  volBtn.position.set(phoneW * 0.5 + 0.03, -0.02, 0);
  phoneGroup.add(powerBtn, volBtn);

  // OLED Screen with smooth Revealed <-> Stealth GLSL shader
  const revealedTex = trackTex(createOttoScreenTexture(false));
  const stealthTex = trackTex(createOttoScreenTexture(true));
  const oledUniforms = {
    uRevealedTex: { value: revealedTex },
    uStealthTex: { value: stealthTex },
    uStealthMix: { value: 0 },
    uTime: { value: 0 },
  };
  const oledMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: oledUniforms,
      vertexShader: OLED_VERT,
      fragmentShader: OLED_FRAG,
    })
  );
  const screenGeo = trackGeo(new THREE.PlaneGeometry(phoneW - 0.14, phoneH - 0.16));
  const screenMesh = new THREE.Mesh(screenGeo, oledMat);
  screenMesh.position.z = phoneD * 0.5 + 0.035;
  phoneGroup.add(screenMesh);

  // --- Multi-Layer Rotating 3D Cryptographic Shield ---
  const shieldGroup = new THREE.Group();
  group.add(shieldGroup);

  // 1. Outer Geodesic Icosahedron Wireframe
  const icoBaseGeo = trackGeo(new THREE.IcosahedronGeometry(3.35, 1));
  const icoEdgesGeo = trackGeo(new THREE.EdgesGeometry(icoBaseGeo));
  const icoLineMat = trackMat(
    new THREE.LineBasicMaterial({
      color: '#5fa88e',
      transparent: true,
      opacity: 0.34,
    })
  );
  const geodesicWire = new THREE.LineSegments(icoEdgesGeo, icoLineMat);
  shieldGroup.add(geodesicWire);

  // 2. Inner Brushed-Cypress-Emerald Torus Rings
  const cypressBrassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#3f6e5d',
      roughness: 0.28,
      metalness: 0.86,
      emissive: '#142921',
      emissiveIntensity: 0.55,
    })
  );

  const ring1 = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(2.55, 0.038, 16, 96)), cypressBrassMat);
  ring1.rotation.set(Math.PI * 0.38, 0.25, 0);

  const ring2 = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(2.85, 0.028, 16, 96)), cypressBrassMat);
  ring2.rotation.set(-Math.PI * 0.28, Math.PI * 0.42, 0.3);

  const ring3 = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(2.28, 0.024, 16, 84)), cypressBrassMat);
  ring3.rotation.set(Math.PI * 0.52, -0.35, 0.45);

  shieldGroup.add(ring1, ring2, ring3);

  // 3. 24 Orbiting Encrypted Shard Polyhedra
  const SHARD_COUNT = 24;
  const shardGeo = trackGeo(new THREE.OctahedronGeometry(0.145, 0));
  const shardMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#1b2b27',
      emissive: '#3e8c72',
      emissiveIntensity: 0.65,
      roughness: 0.26,
      metalness: 0.82,
    })
  );

  const shards: ShardOrbit[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const goldenAngle = i * 2.399963229728653;
    const yNorm = 1 - (i / (SHARD_COUNT - 1)) * 2;
    const phi = Math.acos(Math.max(-1, Math.min(1, yNorm)));
    const mesh = new THREE.Mesh(shardGeo, shardMat);
    shieldGroup.add(mesh);

    shards.push({
      mesh,
      baseTheta: goldenAngle,
      basePhi: phi,
      baseRadius: 3.05 + (i % 3) * 0.26,
      speed: 0.28 + (i % 4) * 0.08,
      spinAxis: new THREE.Vector3(
        Math.sin(i * 1.7),
        Math.cos(i * 2.3),
        Math.sin(i * 0.9)
      ).normalize(),
    });
  }

  return {
    group,
    setStealth(stealth: boolean) {
      isStealth = stealth;
    },
    update(elapsed, dt, pointer, activeWeight) {
      const alpha = 1 - Math.exp(-Math.min(dt, 0.1) * 4.2);
      const targetStealth = isStealth ? 1 : 0;
      stealthMix = THREE.MathUtils.lerp(stealthMix, targetStealth, alpha);

      oledUniforms.uStealthMix.value = stealthMix;
      oledUniforms.uTime.value = elapsed;

      // Zero-gravity phone float + gentle pointer tilt
      phoneGroup.position.y = Math.sin(elapsed * 1.15) * 0.12;
      const targetPhoneRotY = pointer.x * 0.35 * activeWeight + Math.sin(elapsed * 0.45) * 0.12;
      const targetPhoneRotX = -pointer.y * 0.18 * activeWeight + Math.cos(elapsed * 0.38) * 0.05;
      phoneGroup.rotation.y = THREE.MathUtils.lerp(phoneGroup.rotation.y, targetPhoneRotY, alpha * 1.5);
      phoneGroup.rotation.x = THREE.MathUtils.lerp(phoneGroup.rotation.x, targetPhoneRotX, alpha * 1.5);

      // Shield physically tightens/locks around the phone in stealth mode, expands when revealed
      const geodesicScale = THREE.MathUtils.lerp(1.12, 0.78, stealthMix);
      geodesicWire.scale.setScalar(geodesicScale);
      geodesicWire.rotation.y = elapsed * (0.14 + stealthMix * 0.18);
      geodesicWire.rotation.x = Math.sin(elapsed * 0.22) * 0.25;
      icoLineMat.opacity = THREE.MathUtils.lerp(0.24, 0.62, stealthMix);

      const ringScale = THREE.MathUtils.lerp(1.14, 0.84, stealthMix);
      ring1.scale.setScalar(ringScale);
      ring2.scale.setScalar(ringScale);
      ring3.scale.setScalar(ringScale);

      const spinBoost = 1 + stealthMix * 0.85;
      ring1.rotation.z = elapsed * 0.28 * spinBoost;
      ring2.rotation.y = elapsed * -0.22 * spinBoost;
      ring3.rotation.x = Math.PI * 0.52 + elapsed * 0.32 * spinBoost;

      cypressBrassMat.emissiveIntensity = THREE.MathUtils.lerp(0.4, 1.15, stealthMix);
      shardMat.emissiveIntensity = THREE.MathUtils.lerp(0.5, 1.35, stealthMix);

      // 24 orbiting encrypted shards tighten inward & lock formation when stealth is active
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        const radius = THREE.MathUtils.lerp(s.baseRadius * 1.16, s.baseRadius * 0.68, stealthMix);
        const theta = s.baseTheta + elapsed * s.speed * (1 - stealthMix * 0.45);
        const phi = s.basePhi + Math.sin(elapsed * 0.7 + i) * (0.14 * (1 - stealthMix * 0.65));

        s.mesh.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        s.mesh.rotateOnAxis(s.spinAxis, Math.min(dt, 0.05) * (0.9 + stealthMix * 1.1));
      }
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
