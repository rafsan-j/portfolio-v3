import * as THREE from 'three';
import type { WorldHandle } from './types';

interface MemberSpec {
  name: string;
  meals: number;
  x: number;
  z: number;
}

const MEMBERS: MemberSpec[] = [
  { name: 'Rafsan', meals: 42, x: -2.1, z: 0.15 },
  { name: 'Abdullah', meals: 38, x: -0.7, z: -0.15 },
  { name: 'Ahnaf', meals: 35, x: 0.7, z: 0.15 },
  { name: 'Shafkat', meals: 31, x: 2.1, z: -0.15 },
];

const TOTAL_MEALS = MEMBERS.reduce((acc, m) => acc + m.meals, 0);

/**
 * Exact integer-paisa Hamilton Largest-Remainder allocation.
 * Guarantees sum(allocatedPaisa) === totalPaisa (৳0.00 settlement drift).
 */
function allocateHamiltonPaisa(poolBdt: number): number[] {
  const safePool = Number.isFinite(poolBdt) ? Math.max(0, poolBdt) : 0;
  const totalPaisa = Math.round(safePool * 100);

  const entries = MEMBERS.map((member, index) => {
    const numerator = totalPaisa * member.meals;
    const floorPaisa = Math.floor(numerator / TOTAL_MEALS);
    const remainder = numerator % TOTAL_MEALS;
    return { index, floorPaisa, remainder };
  });

  let distributed = 0;
  for (const e of entries) {
    distributed += e.floorPaisa;
  }

  let leftover = totalPaisa - distributed;
  const sortedByRemainder = [...entries].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  });

  const result = entries.map((e) => e.floorPaisa);
  for (let i = 0; i < sortedByRemainder.length && leftover > 0; i++) {
    result[sortedByRemainder[i].index] += 1;
    leftover -= 1;
  }

  return result;
}

function formatBdtFromPaisa(paisa: number): string {
  const taka = Math.floor(paisa / 100);
  const rem = paisa % 100;
  return `৳${taka.toLocaleString('en-IN')}.${String(rem).padStart(2, '0')}`;
}

function createBrushedBrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#c8a15a');
    grad.addColorStop(0.5, '#e0bf7a');
    grad.addColorStop(1, '#a8813e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.globalAlpha = 0.14;
    for (let y = 0; y < 256; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? '#fff2d0' : '#5e4418';
      ctx.fillRect(0, y, 256, 1);
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createPlinthGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#090d11';
    ctx.fillRect(0, 0, 512, 512);

    // Fine architectural grid
    ctx.strokeStyle = 'rgba(204, 166, 94, 0.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Outer engraved border
    ctx.strokeStyle = 'rgba(224, 191, 122, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 480, 480);

    // Etched calibration stamp
    ctx.fillStyle = 'rgba(224, 191, 122, 0.65)';
    ctx.font = '600 14px monospace';
    ctx.fillText('HAMILTON PAISA LEDGER // DRIFT: ৳0.00', 30, 476);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawPillarLabel(
  ctx: CanvasRenderingContext2D,
  name: string,
  meals: number,
  paisa: number
): void {
  ctx.clearRect(0, 0, 288, 96);
  ctx.fillStyle = 'rgba(10, 14, 18, 0.86)';
  ctx.strokeStyle = 'rgba(216, 178, 102, 0.72)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(8, 8, 272, 80, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c8b99a';
  ctx.font = '600 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${name.toUpperCase()} · ${meals}M`, 144, 38);

  ctx.fillStyle = '#f5e1b5';
  ctx.font = '700 24px monospace';
  ctx.fillText(formatBdtFromPaisa(paisa), 144, 70);
}

interface PillarState {
  glassSleeve: THREE.Mesh;
  brassCore: THREE.Mesh;
  capRing: THREE.Mesh;
  labelSprite: THREE.Sprite;
  labelCtx: CanvasRenderingContext2D | null;
  labelTex: THREE.CanvasTexture;
  currentHeight: number;
  targetHeight: number;
}

export function createMessLedgerWorld(): WorldHandle & {
  setPoolBdt: (bdt: number) => void;
} {
  const group = new THREE.Group();
  group.name = 'MessLedgerWorld';
  group.position.set(0, -56, -88);

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

  // --- Studio Lighting ---
  const ambient = new THREE.AmbientLight('#1f2329', 0.9);
  const keyBrass = new THREE.DirectionalLight('#f7e4bc', 1.45);
  keyBrass.position.set(4.5, 7.2, 5.0);
  const rimCool = new THREE.PointLight('#6488a8', 11, 18, 1.5);
  rimCool.position.set(-5.0, 2.8, -3.5);
  const warmUp = new THREE.PointLight('#d9a452', 8, 14, 1.6);
  warmUp.position.set(0, -1.2, 3.2);
  group.add(ambient, keyBrass, rimCool, warmUp);

  // --- Floating Reflective Smoked-Obsidian-Glass Architectural Base Plinth ---
  const plinthGroup = new THREE.Group();
  plinthGroup.position.set(0, -1.65, 0);
  group.add(plinthGroup);

  const gridTex = trackTex(createPlinthGridTexture());
  const glassTopMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: gridTex,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      roughness: 0.12,
      metalness: 0.35,
      envMapIntensity: 1.45,
      transparent: true,
      opacity: 0.95,
    })
  );
  const darkGlassSideMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#0a0e13',
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      roughness: 0.12,
      metalness: 0.35,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: 0.9,
    })
  );

  const plinthGeo = trackGeo(new THREE.BoxGeometry(6.8, 0.26, 3.4));
  const plinthMesh = new THREE.Mesh(plinthGeo, [
    darkGlassSideMat,
    darkGlassSideMat,
    glassTopMat,
    darkGlassSideMat,
    darkGlassSideMat,
    darkGlassSideMat,
  ]);
  plinthGroup.add(plinthMesh);

  // Specular brushed-brass material for caliper rings & plinth bezel
  const brassTex = trackTex(createBrushedBrassTexture());
  const caliperBrassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: brassTex,
      color: '#e2bf76',
      metalness: 0.98,
      roughness: 0.14,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.6,
    })
  );
  const plinthTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(6.92, 0.06, 3.52)),
    caliperBrassMat
  );
  plinthTrim.position.y = -0.14;
  plinthGroup.add(plinthTrim);

  // --- 4 Optical-Glass Sleeves Encasing Machined Brushed-Brass Inner Cores ---
  const socketMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#171c22',
      roughness: 0.24,
      metalness: 0.88,
      clearcoat: 0.4,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.3,
    })
  );
  const glassSleeveMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#eef5f8',
      transmission: 0.86,
      ior: 1.48,
      thickness: 0.8,
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.4,
      attenuationColor: new THREE.Color('#c8dce6'),
      attenuationDistance: 3.2,
      transparent: true,
    })
  );
  const brassCoreMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: brassTex,
      color: '#e0bc72',
      metalness: 0.96,
      roughness: 0.15,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.6,
    })
  );
  const capGlowMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#ffe8b8',
      emissive: '#e8a845',
      emissiveIntensity: 1.85,
      roughness: 0.14,
      metalness: 0.85,
      clearcoat: 0.5,
      envMapIntensity: 1.4,
    })
  );

  // Unit-height cylinders (base sits at y = 0)
  const unitSleeveGeo = trackGeo(new THREE.CylinderGeometry(0.34, 0.36, 1.0, 32));
  unitSleeveGeo.translate(0, 0.5, 0);
  const unitCoreGeo = trackGeo(new THREE.CylinderGeometry(0.21, 0.23, 0.96, 32));
  unitCoreGeo.translate(0, 0.48, 0);
  const socketGeo = trackGeo(new THREE.CylinderGeometry(0.42, 0.46, 0.12, 28));
  const capRingGeo = trackGeo(new THREE.TorusGeometry(0.35, 0.026, 16, 40));
  capRingGeo.rotateX(Math.PI / 2);

  const pillars: PillarState[] = [];

  for (const member of MEMBERS) {
    const baseY = 0.13;
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.set(member.x, baseY + 0.05, member.z);
    plinthGroup.add(socket);

    const brassCore = new THREE.Mesh(unitCoreGeo, brassCoreMat);
    brassCore.position.set(member.x, baseY + 0.1, member.z);
    plinthGroup.add(brassCore);

    const glassSleeve = new THREE.Mesh(unitSleeveGeo, glassSleeveMat);
    glassSleeve.position.set(member.x, baseY + 0.1, member.z);
    plinthGroup.add(glassSleeve);

    const capRing = new THREE.Mesh(capRingGeo, capGlowMat);
    capRing.position.set(member.x, baseY + 0.1 + 1.0, member.z);
    plinthGroup.add(capRing);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 288;
    labelCanvas.height = 96;
    const labelCtx = labelCanvas.getContext('2d');
    const labelTex = trackTex(new THREE.CanvasTexture(labelCanvas));
    labelTex.colorSpace = THREE.SRGBColorSpace;

    const spriteMat = trackMat(
      new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        depthWrite: false,
      })
    );
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(1.55, 0.52, 1);
    labelSprite.position.set(member.x, baseY + 1.55, member.z);
    plinthGroup.add(labelSprite);

    pillars.push({
      glassSleeve,
      brassCore,
      capRing,
      labelSprite,
      labelCtx,
      labelTex,
      currentHeight: 0.4,
      targetHeight: 1.8,
    });
  }

  // --- Two Slowly Counter-Rotating Specular Brushed-Brass Caliper Rings ---
  const caliperGroup = new THREE.Group();
  caliperGroup.position.set(0, 0.15, 0);
  group.add(caliperGroup);

  const outerRingGroup = new THREE.Group();
  outerRingGroup.rotation.set(0.32, 0, 0.12);
  caliperGroup.add(outerRingGroup);

  const outerTorus = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4.35, 0.036, 20, 128)),
    caliperBrassMat
  );
  outerRingGroup.add(outerTorus);

  // Caliper degree ticks on outer ring
  const tickGeo = trackGeo(new THREE.BoxGeometry(0.025, 0.14, 0.025));
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeo, caliperBrassMat);
    tick.position.set(Math.cos(angle) * 4.24, Math.sin(angle) * 4.24, 0);
    tick.rotation.z = angle + Math.PI / 2;
    outerRingGroup.add(tick);
  }

  const innerRingGroup = new THREE.Group();
  innerRingGroup.rotation.set(-0.42, 0.25, -0.18);
  caliperGroup.add(innerRingGroup);

  const innerTorus = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(3.85, 0.026, 20, 112)),
    caliperBrassMat
  );
  innerRingGroup.add(innerTorus);

  const applyPoolBdt = (bdt: number): void => {
    const allocations = allocateHamiltonPaisa(bdt);
    // Map allocated share to architectural pillar height (0.45 to 3.45 units)
    const maxPaisa = Math.max(1, ...allocations);
    const scaleFactor = THREE.MathUtils.clamp(bdt / 24000, 0.35, 1.25);

    for (let i = 0; i < MEMBERS.length; i++) {
      const sharePaisa = allocations[i];
      const normalized = sharePaisa / maxPaisa;
      const targetH = Math.max(0.45, (0.75 + normalized * 2.15) * scaleFactor);
      pillars[i].targetHeight = Math.min(3.55, targetH);

      if (pillars[i].labelCtx) {
        drawPillarLabel(pillars[i].labelCtx!, MEMBERS[i].name, MEMBERS[i].meals, sharePaisa);
        pillars[i].labelTex.needsUpdate = true;
      }
    }
  };

  // Initialize with a realistic mess pool (৳18,500)
  applyPoolBdt(18500);
  for (const p of pillars) {
    p.currentHeight = p.targetHeight;
    p.glassSleeve.scale.y = p.currentHeight;
    p.brassCore.scale.y = p.currentHeight;
    p.capRing.position.y = 0.23 + p.currentHeight;
    p.labelSprite.position.y = 0.23 + p.currentHeight + 0.45;
  }

  return {
    group,
    setPoolBdt(bdt: number) {
      applyPoolBdt(bdt);
    },
    update(elapsed, dt, pointer, activeWeight) {
      const clampedDt = Math.min(dt, 0.1);
      const alpha = 1 - Math.exp(-clampedDt * 4.5);

      // Smoothly animate optical-glass sleeves & inner brass core heights
      for (const p of pillars) {
        p.currentHeight = THREE.MathUtils.lerp(p.currentHeight, p.targetHeight, alpha);
        p.glassSleeve.scale.y = p.currentHeight;
        p.brassCore.scale.y = p.currentHeight;
        p.capRing.position.y = 0.23 + p.currentHeight;
        p.labelSprite.position.y = 0.23 + p.currentHeight + 0.45;
      }

      // Slowly counter-rotating precision brass caliper rings
      outerRingGroup.rotation.z = 0.12 + elapsed * 0.11;
      innerRingGroup.rotation.z = -0.18 - elapsed * 0.15;

      // Subtle architectural levitation & pointer inspection angle
      plinthGroup.position.y = -1.65 + Math.sin(elapsed * 0.85) * 0.06;
      const targetRotY = pointer.x * 0.26 * activeWeight + Math.sin(elapsed * 0.18) * 0.06;
      const targetRotX = 0.12 - pointer.y * 0.08 * activeWeight;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, alpha);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, alpha);
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
