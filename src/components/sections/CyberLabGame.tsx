'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  FALLBACK_PROJECTS,
  FALLBACK_ARCHIVE,
  FALLBACK_MAP_LOCATIONS,
} from '@/lib/fallbackData';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';

type StationId = 'overview' | 'firewall' | 'lab' | 'cern' | 'globe' | 'ai';

interface StationMeta {
  id: StationId;
  code: string;
  title: string;
  subtitle: string;
  color: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

const STATIONS: StationMeta[] = [
  {
    id: 'overview',
    code: 'SOC-00',
    title: 'Command Deck Overview',
    subtitle: '3D Engineering & Cyber-Defense Operations Center',
    color: '#00ff88',
    camPos: [0, 2.2, 6.2],
    lookAt: [0, 0.2, 0],
  },
  {
    id: 'firewall',
    code: 'SEC-01',
    title: 'Firewall Core & OSINT Defense',
    subtitle: 'Active Packet Interception & Cryptographic Forensics Game',
    color: '#00d4ff',
    camPos: [0, 1.1, 3.1],
    lookAt: [0, 0.65, 0],
  },
  {
    id: 'lab',
    code: 'LAB-02',
    title: 'Dual Holo-Monitors // The Lab',
    subtitle: 'Kairyn v5.1 · S_Track · ParallaxMascot3D · AgriBase',
    color: '#00ff88',
    camPos: [-2.3, 1.0, 2.7],
    lookAt: [-2.4, 0.45, -0.6],
  },
  {
    id: 'cern',
    code: 'PHY-03',
    title: 'CERN Muon & IoT Hardware Rig',
    subtitle: 'T9 Beamline Scintillators · ClearRiver · HAYTHAM X ONE',
    color: '#ffb400',
    camPos: [2.3, 1.0, 2.7],
    lookAt: [2.4, 0.45, -0.6],
  },
  {
    id: 'globe',
    code: 'GEO-04',
    title: 'Tactical Radar // Coordinates',
    subtitle: 'Sylhet (SUST) · Dinajpur · Rajshahi (RCC) · Dhaka',
    color: '#a78bfa',
    camPos: [-1.6, 0.3, 3.4],
    lookAt: [-1.7, -0.55, 0.6],
  },
  {
    id: 'ai',
    code: 'AI-05',
    title: 'Neural Core // RJ.AI',
    subtitle: 'Dual-Engine Groq & Gemini Streaming Intelligence',
    color: '#f472b6',
    camPos: [1.6, 0.3, 3.4],
    lookAt: [1.7, -0.55, 0.6],
  },
];

interface ThreatNode {
  id: string;
  label: string;
  type: 'malicious' | 'benign';
  angle: number;
  distance: number;
  speed: number;
  points: number;
}

const MALICIOUS_SIGNATURES = [
  'SQLi: OR 1=1--',
  'XSS: <script>alert(1)',
  'DDoS SYN_FLOOD',
  'EXIF_GPS_SPOOF',
  'CVE-ZeroDay_Probe',
  'BruteForce_SSH',
  'JWT_None_Alg_Bypass',
  'MITM_ARP_Poison',
];

const BENIGN_SIGNATURES = [
  'SUST_CSE_Sync_OK',
  'Kairyn_60FPS_Pulse',
  'AgriBase_ML_Query',
  'WaffleUp_SOP_Hook',
];

interface OsintChallenge {
  id: string;
  title: string;
  category: string;
  prompt: string;
  artifact: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  rewardXp: number;
}

const OSINT_CHALLENGES: OsintChallenge[] = [
  {
    id: 'c1',
    title: 'EXIF Metadata Forensics',
    category: 'Digital Forensics',
    prompt:
      'An uploaded image claims to be an original photo taken in 2026 on an iPhone, but running `exiftool -a -G1` reveals the following tags. Which detail proves manipulation?',
    artifact: `[IFD0] Make: Apple | Model: iPhone 15 Pro\n[ExifIFD] DateTimeOriginal: 2026:10:22 14:12:09\n[XMP-xmp] CreatorTool: Adobe Photoshop 25.4 (Windows)\n[GPS] GPSLatitude: 24 deg 53' 41.64" N (Sylhet)`,
    options: [
      'The GPS coordinates point to Sylhet',
      'XMP CreatorTool shows Adobe Photoshop post-processing',
      'DateTimeOriginal uses colons between date segments',
      'IFD0 Make is set to Apple',
    ],
    correctIdx: 1,
    explanation:
      'Authentic camera originals do not contain XMP CreatorTool headers from Adobe Photoshop unless re-saved through an editing pipeline.',
    rewardXp: 400,
  },
  {
    id: 'c2',
    title: 'Row-Level Security (RLS) Audit',
    category: 'Database Security',
    prompt:
      'You are auditing a Supabase PostgreSQL table `pf_inbox_messages` containing private contact emails. Which RLS policy prevents public visitors from reading others’ messages while still allowing contact form submissions?',
    artifact: `ALTER TABLE pf_inbox_messages ENABLE ROW LEVEL SECURITY;\n-- Select the secure policy configuration:`,
    options: [
      'FOR ALL USING (true) WITH CHECK (true)',
      'FOR SELECT USING (true)',
      'FOR INSERT WITH CHECK (true) (with no public SELECT policy)',
      'Disable RLS on the table',
    ],
    correctIdx: 2,
    explanation:
      'Granting public INSERT WITH CHECK (true) while restricting SELECT to authenticated service-role/admin prevents data leaks.',
    rewardXp: 450,
  },
  {
    id: 'c3',
    title: 'Android Widget Broadcast Hardening',
    category: 'Mobile Security (Kairyn OS)',
    prompt:
      'In Kairyn v5.1, quick-check-in home screen widgets send habit increment intents to an AppWidgetProvider. How do we prevent unauthorized third-party apps from spoofing habit increments?',
    artifact: `intent.action = "com.kairyn.ACTION_QUICK_STEP"\nintent.putExtra("tracker_id", trackerId)\nintent.putExtra("token", secretToken)`,
    options: [
      'Keep receiver non-exported + verify a per-install secret token with PendingIntent.FLAG_IMMUTABLE',
      'Store the token in a public plain-text file on SD card',
      'Use an implicit broadcast with no token check',
      'Disable widget buttons completely',
    ],
    correctIdx: 0,
    explanation:
      'Combining a non-exported receiver, PendingIntent.FLAG_IMMUTABLE, and a synchronized local secret token stops external intent spoofing.',
    rewardXp: 500,
  },
  {
    id: 'c4',
    title: 'Hex / Base64 Payload Triage',
    category: 'Reverse Engineering',
    prompt:
      'The SOC firewall intercepted an encoded beacon string from a suspicious packet header: `U1VTVF9DU0VfMjU=`. What does this Base64 string decode to?',
    artifact: `HEADER: X-Beacon-Token: U1VTVF9DU0VfMjU=\nLENGTH: 16 bytes (Base64)`,
    options: ['RAFSAN_PREFECT', 'SUST_CSE_25', 'CERN_MUON_T9', 'KAIRYN_OS_V5'],
    correctIdx: 1,
    explanation:
      '`U1VTVF9DU0VfMjU=` decodes in ASCII Base64 directly to `SUST_CSE_25` (Rafsan’s batch at Shahjalal University of Science & Technology!).',
    rewardXp: 500,
  },
];

function CameraRig({ activeStation }: { activeStation: StationId }) {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.2, 0));

  const targetMeta = useMemo(
    () => STATIONS.find(s => s.id === activeStation) ?? STATIONS[0],
    [activeStation]
  );

  useFrame(({ mouse }) => {
    const [tx, ty, tz] = targetMeta.camPos;
    const [lx, ly, lz] = targetMeta.lookAt;

    const desiredPos = new THREE.Vector3(
      tx + mouse.x * 0.35,
      ty + mouse.y * 0.22,
      tz
    );
    camera.position.lerp(desiredPos, 0.06);

    const desiredLook = new THREE.Vector3(lx + mouse.x * 0.15, ly + mouse.y * 0.1, lz);
    lookAtTarget.current.lerp(desiredLook, 0.08);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}

function CommandLab3DScene({
  activeStation,
  onSelectStation,
  firewallHealth,
  gameRunning,
  beamPulse,
}: {
  activeStation: StationId;
  onSelectStation: (id: StationId) => void;
  firewallHealth: number;
  gameRunning: boolean;
  beamPulse: number;
}) {
  const firewallCoreRef = useRef<THREE.Mesh>(null!);
  const firewallRing1Ref = useRef<THREE.Mesh>(null!);
  const firewallRing2Ref = useRef<THREE.Mesh>(null!);
  const globeRef = useRef<THREE.Mesh>(null!);
  const aiCrystalRef = useRef<THREE.Mesh>(null!);
  const muonRef = useRef<THREE.Mesh>(null!);

  const coreColor =
    firewallHealth > 60 ? '#00d4ff' : firewallHealth > 30 ? '#ffb400' : '#ff0055';

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const speedMult = gameRunning ? 2.2 : 1.0;

    if (firewallCoreRef.current) {
      firewallCoreRef.current.rotation.y = t * 0.6 * speedMult;
      firewallCoreRef.current.rotation.x = t * 0.35 * speedMult;
      const s = 1 + Math.sin(t * 3) * 0.06;
      firewallCoreRef.current.scale.set(s, s, s);
    }
    if (firewallRing1Ref.current) {
      firewallRing1Ref.current.rotation.z = t * 0.8 * speedMult;
      firewallRing1Ref.current.rotation.x = Math.PI / 2.6 + Math.sin(t) * 0.15;
    }
    if (firewallRing2Ref.current) {
      firewallRing2Ref.current.rotation.y = -t * 0.65 * speedMult;
      firewallRing2Ref.current.rotation.z = Math.PI / 4;
    }
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.45;
    }
    if (aiCrystalRef.current) {
      aiCrystalRef.current.rotation.y = -t * 0.7;
      aiCrystalRef.current.position.y = -0.45 + Math.sin(t * 2.2) * 0.08;
    }
    if (muonRef.current) {
      const progress = ((t * 2.4 + beamPulse) % 1.6) - 0.8;
      muonRef.current.position.x = progress;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 3, 2]} intensity={1.5} color={coreColor} />
      <pointLight position={[-3, 2, 1]} intensity={1.0} color="#00ff88" />
      <pointLight position={[3, 2, 1]} intensity={1.0} color="#ffb400" />

      <gridHelper args={[24, 36, '#00d4ff', '#0c1b2e']} position={[0, -1.35, 0]} />
      <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial color="#030710" transparent opacity={0.92} />
      </mesh>

      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[6.8, 0.12, 3.2]} />
        <meshBasicMaterial color="#0b1528" wireframe={false} />
      </mesh>
      <mesh position={[0, -0.94, 0]}>
        <boxGeometry args={[6.82, 0.13, 3.22]} />
        <meshBasicMaterial color="#1d3557" wireframe />
      </mesh>

      {/* STATION 1: CENTRAL FIREWALL HOLOGRAM CORE */}
      <group
        position={[0, 0.65, 0]}
        onClick={e => {
          e.stopPropagation();
          onSelectStation('firewall');
        }}
      >
        <mesh ref={firewallCoreRef}>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshBasicMaterial
            color={coreColor}
            wireframe
            transparent
            opacity={activeStation === 'firewall' ? 0.95 : 0.65}
          />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.38, 0]} />
          <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.8} />
        </mesh>
        <mesh ref={firewallRing1Ref}>
          <torusGeometry args={[1.05, 0.018, 12, 64]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.75} />
        </mesh>
        <mesh ref={firewallRing2Ref}>
          <torusGeometry args={[1.28, 0.012, 12, 64]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.55, 0.75, 0.35, 24]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* STATION 2: DUAL HOLO-MONITORS */}
      <group
        position={[-2.4, 0.35, -0.6]}
        rotation={[0, 0.38, 0]}
        onClick={e => {
          e.stopPropagation();
          onSelectStation('lab');
        }}
      >
        <mesh position={[-0.45, 0.15, 0]}>
          <boxGeometry args={[1.35, 0.85, 0.05]} />
          <meshBasicMaterial color="#071a14" />
        </mesh>
        <mesh position={[-0.45, 0.15, 0.01]}>
          <boxGeometry args={[1.38, 0.88, 0.06]} />
          <meshBasicMaterial
            color="#00ff88"
            wireframe
            transparent
            opacity={activeStation === 'lab' ? 0.95 : 0.55}
          />
        </mesh>
        <mesh position={[0.65, 0.15, -0.15]} rotation={[0, -0.22, 0]}>
          <boxGeometry args={[1.1, 0.75, 0.05]} />
          <meshBasicMaterial color="#071624" />
        </mesh>
        <mesh position={[0.65, 0.15, -0.14]} rotation={[0, -0.22, 0]}>
          <boxGeometry args={[1.13, 0.78, 0.06]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.6} />
        </mesh>
      </group>

      {/* STATION 3: CERN SCINTILLATOR & ESP32 RIG */}
      <group
        position={[2.4, 0.35, -0.6]}
        rotation={[0, -0.38, 0]}
        onClick={e => {
          e.stopPropagation();
          onSelectStation('cern');
        }}
      >
        {[-0.55, 0, 0.55].map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.82, 0.65]} />
            <meshBasicMaterial
              color={idx === 1 ? '#ffb400' : '#00d4ff'}
              wireframe
              transparent
              opacity={activeStation === 'cern' ? 0.9 : 0.55}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 12]} />
          <meshBasicMaterial color="#ffb400" transparent opacity={0.45} />
        </mesh>
        <mesh ref={muonRef} position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>

      {/* STATION 4: SYLHET / BANGLADESH HOLO-GLOBE */}
      <group
        position={[-1.7, -0.45, 0.65]}
        onClick={e => {
          e.stopPropagation();
          onSelectStation('globe');
        }}
      >
        <mesh ref={globeRef}>
          <sphereGeometry args={[0.42, 18, 18]} />
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={activeStation === 'globe' ? 0.95 : 0.55}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.54, 32]} />
          <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* STATION 5: NEURAL AI CRYSTAL */}
      <group
        position={[1.7, -0.45, 0.65]}
        onClick={e => {
          e.stopPropagation();
          onSelectStation('ai');
        }}
      >
        <mesh ref={aiCrystalRef}>
          <octahedronGeometry args={[0.42, 1]} />
          <meshBasicMaterial
            color="#f472b6"
            wireframe
            transparent
            opacity={activeStation === 'ai' ? 0.95 : 0.65}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function CyberLabGame({ onOpenAI }: { onOpenAI: () => void }) {
  const { setMode } = useVisitorMode();
  const [activeStation, setActiveStation] = useState<StationId>('firewall');
  const [beamPulse, setBeamPulse] = useState(0);

  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [firewallHealth, setFirewallHealth] = useState(100);
  const [empCharge, setEmpCharge] = useState(100);
  const [threats, setThreats] = useState<ThreatNode[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([
    '[SYS] SUST-CSE Cyber-Defense SOC initialized.',
    '[SYS] Click "START DEFENSE WAVE" or solve OSINT Forensics challenges to earn Clearance XP.',
  ]);

  const [activeTab, setActiveTab] = useState<'intercept' | 'osint'>('intercept');
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [selectedProjectIdx, setSelectedProjectIdx] = useState(0);

  const coreColor =
    firewallHealth > 60 ? '#00d4ff' : firewallHealth > 30 ? '#ffb400' : '#ff0055';

  useEffect(() => {
    const saved = localStorage.getItem('pf_cyber_highscore');
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  const updateScore = useCallback((delta: number) => {
    setScore(prev => {
      const next = Math.max(0, prev + delta);
      setHighScore(hs => {
        const best = Math.max(hs, next);
        localStorage.setItem('pf_cyber_highscore', String(best));
        return best;
      });
      return next;
    });
  }, []);

  const clearance = useMemo(() => {
    if (score >= 2000) return { level: 4, title: 'ROOT ARCHITECT // PREFECT', color: '#ffb400' };
    if (score >= 1000) return { level: 3, title: 'AI & SOC COMMANDER', color: '#00ff88' };
    if (score >= 400)  return { level: 2, title: 'SUST CYBER ANALYST', color: '#00d4ff' };
    return { level: 1, title: 'CADET OPERATOR', color: '#a78bfa' };
  }, [score]);

  useEffect(() => {
    if (!gameRunning) return;

    const spawnInterval = setInterval(() => {
      const isMalicious = Math.random() < 0.76;
      const sigList = isMalicious ? MALICIOUS_SIGNATURES : BENIGN_SIGNATURES;
      const label = sigList[Math.floor(Math.random() * sigList.length)];
      const newThreat: ThreatNode = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        type: isMalicious ? 'malicious' : 'benign',
        angle: Math.random() * Math.PI * 2,
        distance: 92,
        speed: isMalicious ? 4.2 + Math.random() * 3.0 : 5.0,
        points: isMalicious ? 100 : 50,
      };
      setThreats(prev => [...prev.slice(-9), newThreat]);
    }, 1150);

    const tickInterval = setInterval(() => {
      setThreats(prev => {
        const remaining: ThreatNode[] = [];
        let damage = 0;
        let healed = 0;

        for (const node of prev) {
          const nextDist = node.distance - node.speed;
          if (nextDist <= 8) {
            if (node.type === 'malicious') {
              damage += 12;
            } else {
              healed += 4;
            }
          } else {
            remaining.push({ ...node, distance: nextDist });
          }
        }

        if (damage > 0) {
          setFirewallHealth(h => {
            const nh = Math.max(0, h - damage);
            if (nh === 0) setGameRunning(false);
            return nh;
          });
          setCombo(1);
          setCombatLog(l => [
            `[ALERT] Malicious packet breached core (-${damage}% integrity)!`,
            ...l.slice(0, 5),
          ]);
        } else if (healed > 0) {
          setFirewallHealth(h => Math.min(100, h + healed));
          updateScore(25);
        }

        return remaining;
      });
      setEmpCharge(c => Math.min(100, c + 4));
    }, 220);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(tickInterval);
    };
  }, [gameRunning, updateScore]);

  const handleInterceptNode = (node: ThreatNode) => {
    setThreats(prev => prev.filter(t => t.id !== node.id));
    if (node.type === 'malicious') {
      const gained = node.points * combo;
      updateScore(gained);
      setCombo(c => Math.min(8, c + 1));
      setCombatLog(l => [
        `[INTERCEPT] Neutralized ${node.label} (+${gained} XP · ${combo}x)!`,
        ...l.slice(0, 5),
      ]);
    } else {
      setCombo(1);
      updateScore(-40);
      setCombatLog(l => [
        `[WARN] Dropped verified telemetry packet ${node.label} (-40 XP).`,
        ...l.slice(0, 5),
      ]);
    }
  };

  const triggerEmpBurst = () => {
    if (empCharge < 100) return;
    const malCount = threats.filter(t => t.type === 'malicious').length;
    setThreats(prev => prev.filter(t => t.type === 'benign'));
    setEmpCharge(0);
    const bonus = Math.max(150, malCount * 120);
    updateScore(bonus);
    setFirewallHealth(h => Math.min(100, h + 15));
    setCombatLog(l => [
      `[EMP BURST] Purged ${malCount} hostile threats (+${bonus} XP, +15% Shield)!`,
      ...l.slice(0, 5),
    ]);
  };

  const currentChallenge = OSINT_CHALLENGES[challengeIdx];

  const handleAnswerOsint = (idx: number) => {
    setSelectedOption(idx);
    if (idx === currentChallenge.correctIdx && !solvedIds.includes(currentChallenge.id)) {
      setSolvedIds(prev => [...prev, currentChallenge.id]);
      updateScore(currentChallenge.rewardXp);
      setFirewallHealth(h => Math.min(100, h + 20));
      setCombatLog(l => [
        `[OSINT SOLVED] ${currentChallenge.title} (+${currentChallenge.rewardXp} XP)!`,
        ...l.slice(0, 5),
      ]);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pt-14" style={{ background: '#03060c', color: '#e8f4ff' }}>
      <div className="fixed inset-0 top-14 z-0">
        <Canvas camera={{ position: [0, 2.2, 6.2], fov: 55 }} dpr={[1, 1.5]}>
          <CameraRig activeStation={activeStation} />
          <CommandLab3DScene
            activeStation={activeStation}
            onSelectStation={setActiveStation}
            firewallHealth={firewallHealth}
            gameRunning={gameRunning}
            beamPulse={beamPulse}
          />
        </Canvas>
      </div>

      {/* Top Tactical HUD Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-[#07101e]/90 border border-[#162a45] backdrop-blur-md px-3.5 py-2 rounded-lg">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: clearance.color, boxShadow: `0 0 8px ${clearance.color}` }} />
          <div>
            <p className="text-[10px] font-mono tracking-widest text-[#7fa2c4]">
              CLEARANCE LEVEL 0{clearance.level}
            </p>
            <p className="text-xs font-display font-bold tracking-wider" style={{ color: clearance.color }}>
              {clearance.title}
            </p>
          </div>
          <div className="h-6 w-px bg-[#162a45] mx-1" />
          <div className="font-mono text-xs">
            <span className="text-[#7fa2c4] text-[10px] block">XP SCORE</span>
            <span className="text-[#00ff88] font-bold">{score}</span>
            <span className="text-[#7fa2c4] text-[10px] ml-2">(BEST: {highScore})</span>
          </div>
          <div className="h-6 w-px bg-[#162a45] mx-1" />
          <div className="font-mono text-xs">
            <span className="text-[#7fa2c4] text-[10px] block">FIREWALL</span>
            <span className="font-bold" style={{ color: coreColor }}>
              {firewallHealth}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap bg-[#07101e]/90 border border-[#162a45] backdrop-blur-md p-1.5 rounded-lg">
          {STATIONS.map(st => {
            const active = activeStation === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStation(st.id)}
                className="px-2.5 py-1.5 rounded text-[11px] font-mono tracking-wider uppercase transition-all"
                style={{
                  background: active ? `${st.color}20` : 'transparent',
                  color: active ? st.color : '#7fa2c4',
                  border: active ? `1px solid ${st.color}66` : '1px solid transparent',
                }}
              >
                {st.code}
              </button>
            );
          })}
          <button
            onClick={() => setMode('developer')}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono tracking-wider uppercase border border-[#ff0055]/40 text-[#ff6b9d] hover:bg-[#ff0055]/15 ml-1"
          >
            Exit 3D ✕
          </button>
        </div>
      </div>

      {/* Interactive Station HUD Panels */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pointer-events-none">
        <div className="lg:col-span-4 space-y-3 pointer-events-auto">
          <div className="bg-[#07101e]/90 border border-[#162a45] backdrop-blur-md rounded-xl p-4">
            <p className="text-[10px] font-mono tracking-widest text-[#00d4ff] uppercase mb-1">
              // CONCEPT B: 3D COMMAND &amp; CYBER LAB
            </p>
            <h2 className="font-display text-lg font-bold text-white mb-1">
              {STATIONS.find(s => s.id === activeStation)?.title}
            </h2>
            <p className="text-xs text-[#7fa2c4] leading-relaxed mb-3">
              {STATIONS.find(s => s.id === activeStation)?.subtitle}. Click any 3D object in the room or select a station below to fly the camera.
            </p>

            <div className="space-y-1.5">
              {STATIONS.map(st => (
                <button
                  key={st.id}
                  onClick={() => setActiveStation(st.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono text-xs transition-all border"
                  style={{
                    background: activeStation === st.id ? `${st.color}15` : '#0a1526',
                    borderColor: activeStation === st.id ? `${st.color}66` : '#162a45',
                    color: activeStation === st.id ? '#ffffff' : '#7fa2c4',
                  }}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                    <span style={{ color: st.color }}>[{st.code}]</span>
                    <span className="truncate">{st.title.split('//')[0]}</span>
                  </span>
                  <span className="text-[10px] opacity-60">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#07101e]/90 border border-[#162a45] backdrop-blur-md rounded-xl p-4 font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest text-[#00ff88] uppercase">// LIVE SOC TELEMETRY</span>
              <span className="text-[10px] text-[#7fa2c4]">COMBO: {combo}x</span>
            </div>
            <div className="space-y-1 text-[11px] max-h-28 overflow-y-auto">
              {combatLog.map((entry, idx) => (
                <p
                  key={idx}
                  className="truncate"
                  style={{
                    color: entry.includes('[ALERT]')
                      ? '#ff6b9d'
                      : entry.includes('[INTERCEPT]') || entry.includes('[OSINT')
                      ? '#00ff88'
                      : '#7fa2c4',
                  }}
                >
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 pointer-events-auto">
          <AnimatePresence mode="wait">
            {(activeStation === 'firewall' || activeStation === 'overview') && (
              <motion.div
                key="station-firewall"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#07101e]/92 border border-[#162a45] backdrop-blur-md rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#162a45]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('intercept')}
                      className="px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-all"
                      style={{
                        borderColor: activeTab === 'intercept' ? '#00d4ff' : '#162a45',
                        background: activeTab === 'intercept' ? 'rgba(0,212,255,0.14)' : 'transparent',
                        color: activeTab === 'intercept' ? '#00d4ff' : '#7fa2c4',
                      }}
                    >
                      🛡 Active Packet Intercept
                    </button>
                    <button
                      onClick={() => setActiveTab('osint')}
                      className="px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-all"
                      style={{
                        borderColor: activeTab === 'osint' ? '#00ff88' : '#162a45',
                        background: activeTab === 'osint' ? 'rgba(0,255,136,0.14)' : 'transparent',
                        color: activeTab === 'osint' ? '#00ff88' : '#7fa2c4',
                      }}
                    >
                      🔍 OSINT &amp; Crypto Challenges ({solvedIds.length}/{OSINT_CHALLENGES.length})
                    </button>
                  </div>

                  {activeTab === 'intercept' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerEmpBurst}
                        disabled={empCharge < 100}
                        className="px-3 py-1.5 rounded text-xs font-mono uppercase border transition-all disabled:opacity-40"
                        style={{
                          borderColor: '#ffb400',
                          color: empCharge >= 100 ? '#000' : '#ffb400',
                          background: empCharge >= 100 ? '#ffb400' : 'transparent',
                        }}
                      >
                        ⚡ EMP Burst ({empCharge}%)
                      </button>
                      <button
                        onClick={() => {
                          if (!gameRunning && firewallHealth === 0) setFirewallHealth(100);
                          setGameRunning(r => !r);
                        }}
                        className="px-4 py-1.5 rounded text-xs font-mono uppercase font-bold border transition-all"
                        style={{
                          borderColor: gameRunning ? '#ff0055' : '#00ff88',
                          background: gameRunning ? 'rgba(255,0,85,0.2)' : '#00ff88',
                          color: gameRunning ? '#ff6b9d' : '#03060c',
                        }}
                      >
                        {gameRunning ? '⏸ Pause Wave' : '▶ Start Defense Wave'}
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === 'intercept' ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#7fa2c4] mb-2">
                      <span>
                        Click <span className="text-[#ff6b9d] font-bold">RED MALICIOUS PACKETS</span> to neutralize before they hit the central core. Let <span className="text-[#00ff88] font-bold">GREEN TELEMETRY</span> pass!
                      </span>
                    </div>

                    <div
                      className="relative w-full h-72 rounded-xl border border-[#162a45] overflow-hidden"
                      style={{
                        background:
                          'radial-gradient(circle at center, rgba(0,212,255,0.12) 0%, rgba(7,16,30,0.95) 70%)',
                      }}
                    >
                      {[25, 50, 75].map(pct => (
                        <div
                          key={pct}
                          className="absolute rounded-full border border-[#00d4ff]/15 pointer-events-none"
                          style={{
                            width: `${pct}%`,
                            height: `${pct}%`,
                            left: `${(100 - pct) / 2}%`,
                            top: `${(100 - pct) / 2}%`,
                          }}
                        />
                      ))}

                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 font-mono text-[10px] font-bold pointer-events-none"
                        style={{
                          borderColor: coreColor,
                          background: 'rgba(3,6,12,0.9)',
                          boxShadow: `0 0 20px ${coreColor}66`,
                          color: coreColor,
                        }}
                      >
                        <span>CORE</span>
                        <span>{firewallHealth}%</span>
                      </div>

                      {threats.map(node => {
                        const rad = (node.distance / 100) * 44;
                        const x = 50 + Math.cos(node.angle) * rad;
                        const y = 50 + Math.sin(node.angle) * rad;
                        const isMal = node.type === 'malicious';
                        const col = isMal ? '#ff0055' : '#00ff88';

                        return (
                          <button
                            key={node.id}
                            onClick={() => handleInterceptNode(node)}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              borderColor: `${col}66`,
                              background: 'rgba(7,16,30,0.92)',
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap border transition-transform hover:scale-110 cursor-crosshair"
                          >
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5"
                              style={{ background: col, boxShadow: `0 0 6px ${col}` }}
                            />
                            <span style={{ color: isMal ? '#ffb3c6' : '#a7f3d0' }}>{node.label}</span>
                          </button>
                        );
                      })}

                      {!gameRunning && (
                        <div className="absolute inset-0 bg-[#03060c]/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                          <p className="font-display text-sm text-[#00d4ff] tracking-widest uppercase mb-1">
                            {firewallHealth === 0 ? '// FIREWALL BREACHED' : '// SOC DEFENSE STANDBY'}
                          </p>
                          <p className="text-xs text-[#7fa2c4] max-w-md mb-4">
                            Defend Rafsan&apos;s SUST-CSE &amp; Kairyn infrastructure from incoming SQLi, XSS, and zero-day packets, or switch to the OSINT Forensics tab to solve cybersecurity puzzles.
                          </p>
                          <button
                            onClick={() => {
                              if (firewallHealth === 0) setFirewallHealth(100);
                              setGameRunning(true);
                            }}
                            className="px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest font-bold bg-[#00ff88] text-[#03060c] hover:opacity-90 transition-all shadow-lg"
                          >
                            {firewallHealth === 0 ? '↻ Reboot & Play Again' : '▶ Launch Defense Wave'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 font-mono">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-1.5">
                        {OSINT_CHALLENGES.map((ch, i) => {
                          const solved = solvedIds.includes(ch.id);
                          return (
                            <button
                              key={ch.id}
                              onClick={() => {
                                setChallengeIdx(i);
                                setSelectedOption(null);
                              }}
                              className="px-2.5 py-1 rounded text-xs border transition-all"
                              style={{
                                borderColor: challengeIdx === i ? '#00ff88' : '#162a45',
                                background: solved ? 'rgba(0,255,136,0.15)' : '#0a1526',
                                color: solved ? '#00ff88' : '#e8f4ff',
                              }}
                            >
                              #{i + 1} {solved ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs text-[#ffb400]">
                        Reward: +{currentChallenge.rewardXp} XP
                      </span>
                    </div>

                    <div className="bg-[#0a1526] border border-[#162a45] rounded-lg p-4">
                      <p className="text-[10px] text-[#00d4ff] uppercase tracking-widest mb-1">
                        {currentChallenge.category}
                      </p>
                      <h3 className="text-sm font-bold text-white mb-2">{currentChallenge.title}</h3>
                      <p className="text-xs text-[#7fa2c4] leading-relaxed mb-3">
                        {currentChallenge.prompt}
                      </p>
                      <pre className="bg-[#03060c] border border-[#162a45] rounded p-3 text-[11px] text-[#00ff88] overflow-x-auto mb-4">
                        {currentChallenge.artifact}
                      </pre>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentChallenge.options.map((opt, idx) => {
                          const isChosen = selectedOption === idx;
                          const isCorrect = idx === currentChallenge.correctIdx;
                          let bdr = '#162a45';
                          let bg = '#07101e';
                          if (selectedOption !== null) {
                            if (isCorrect) {
                              bdr = '#00ff88';
                              bg = 'rgba(0,255,136,0.12)';
                            } else if (isChosen) {
                              bdr = '#ff0055';
                              bg = 'rgba(255,0,85,0.12)';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerOsint(idx)}
                              className="p-3 rounded text-left text-xs border transition-all hover:border-[#00d4ff]"
                              style={{ borderColor: bdr, background: bg }}
                            >
                              <span className="text-[#00d4ff] mr-2">[{String.fromCharCode(65 + idx)}]</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {selectedOption !== null && (
                        <div className="mt-3 p-3 rounded border border-[#00ff88]/30 bg-[#00ff88]/5 text-xs text-[#e8f4ff]">
                          <strong className="text-[#00ff88]">
                            {selectedOption === currentChallenge.correctIdx ? '✓ Correct! ' : '✕ Not quite: '}
                          </strong>
                          {currentChallenge.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeStation === 'lab' && (
              <motion.div
                key="station-lab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#07101e]/92 border border-[#00ff88]/40 backdrop-blur-md rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#162a45]">
                  <div>
                    <p className="text-[10px] font-mono text-[#00ff88] tracking-widest uppercase">
                      // STATION 02: DUAL HOLO-MONITORS
                    </p>
                    <h3 className="font-display text-lg font-bold text-white">
                      Engineering Builds ({FALLBACK_PROJECTS.length} Systems)
                    </h3>
                  </div>
                  <a href="/lab" className="btn-neon text-xs py-1.5 px-3">
                    <span>Full Lab Page ↗</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {FALLBACK_PROJECTS.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProjectIdx(i)}
                        className="w-full text-left px-3 py-2 rounded border font-mono text-xs transition-all"
                        style={{
                          borderColor: selectedProjectIdx === i ? '#00ff88' : '#162a45',
                          background: selectedProjectIdx === i ? 'rgba(0,255,136,0.12)' : '#0a1526',
                          color: selectedProjectIdx === i ? '#00ff88' : '#e8f4ff',
                        }}
                      >
                        <p className="truncate font-bold">{p.title.split('—')[0]}</p>
                        <p className="text-[10px] text-[#7fa2c4] truncate">{p.tech_stack.slice(0, 3).join(' · ')}</p>
                      </button>
                    ))}
                  </div>

                  <div className="md:col-span-2 bg-[#0a1526] border border-[#162a45] rounded-lg p-4 flex flex-col">
                    {(() => {
                      const proj = FALLBACK_PROJECTS[selectedProjectIdx] ?? FALLBACK_PROJECTS[0];
                      return (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-display text-base font-bold text-white">{proj.title}</h4>
                            {proj.is_featured && (
                              <span className="tag tag-amber text-[10px] flex-shrink-0">Featured</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {proj.tech_stack.map(t => (
                              <span key={t} className="tag tag-cyan text-[10px]">
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-[#e8f4ff] leading-relaxed mb-3">{proj.description}</p>
                          {proj.case_study && (
                            <pre className="text-[11px] font-mono text-[#7fa2c4] whitespace-pre-wrap bg-[#03060c] border border-[#162a45] rounded p-3 max-h-40 overflow-y-auto">
                              {proj.case_study}
                            </pre>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeStation === 'cern' && (
              <motion.div
                key="station-cern"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#07101e]/92 border border-[#ffb400]/40 backdrop-blur-md rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#162a45] flex-wrap gap-2">
                  <div>
                    <p className="text-[10px] font-mono text-[#ffb400] tracking-widest uppercase">
                      // STATION 03: PARTICLE PHYSICS &amp; EMBEDDED HARDWARE
                    </p>
                    <h3 className="font-display text-lg font-bold text-white">
                      CERN T9 Beamline &amp; Research Archive
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBeamPulse(p => p + 0.5);
                        updateScore(50);
                        setCombatLog(l => [
                          '[CERN T9] Fired relativistic muon test pulse through BC-408 scintillators (+50 XP)!',
                          ...l.slice(0, 5),
                        ]);
                      }}
                      className="px-3 py-1.5 rounded text-xs font-mono uppercase bg-[#ffb400] text-black font-bold"
                    >
                      ⚡ Fire Muon Pulse (+50 XP)
                    </button>
                    <a href="/archive" className="btn-neon text-xs py-1.5 px-3">
                      <span>Open Archive ↗</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {FALLBACK_ARCHIVE.map(entry => (
                    <div key={entry.id} className="bg-[#0a1526] border border-[#162a45] rounded-lg p-3.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-display text-xs font-bold text-[#ffb400]">{entry.title}</h4>
                        <span className="text-[10px] font-mono text-[#7fa2c4]">{entry.date_completed}</span>
                      </div>
                      <p className="text-xs text-[#e8f4ff] leading-relaxed mb-2">{entry.abstract_content}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.map(t => (
                          <span key={t} className="tag tag-ghost text-[9px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStation === 'globe' && (
              <motion.div
                key="station-globe"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#07101e]/92 border border-[#a78bfa]/40 backdrop-blur-md rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#162a45]">
                  <div>
                    <p className="text-[10px] font-mono text-[#a78bfa] tracking-widest uppercase">
                      // STATION 04: BANGLADESH TACTICAL COORDINATES
                    </p>
                    <h3 className="font-display text-lg font-bold text-white">
                      Sylhet (SUST) · Dinajpur · Rajshahi · Dhaka
                    </h3>
                  </div>
                  <a href="/map" className="btn-neon text-xs py-1.5 px-3">
                    <span>Interactive District Map ↗</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FALLBACK_MAP_LOCATIONS.map(loc => (
                    <div
                      key={loc.id}
                      className="bg-[#0a1526] border border-[#162a45] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display text-xs font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: loc.is_wishlist ? '#00d4ff' : '#00ff88' }}
                          />
                          {loc.location_name}
                        </span>
                        <span className="text-[10px] font-mono text-[#7fa2c4]">
                          {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                        </span>
                      </div>
                      <p className="text-xs text-[#7fa2c4] leading-relaxed">{loc.story}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStation === 'ai' && (
              <motion.div
                key="station-ai"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#07101e]/92 border border-[#f472b6]/40 backdrop-blur-md rounded-xl p-6 text-center"
              >
                <p className="text-[10px] font-mono text-[#f472b6] tracking-widest uppercase mb-2">
                  // STATION 05: DUAL-PROVIDER AI NEURAL CORE
                </p>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  RJ.AI — Powered by Groq (Llama 3.3) &amp; Google Gemini
                </h3>
                <p className="text-xs text-[#7fa2c4] max-w-lg mx-auto leading-relaxed mb-5">
                  Query Rafsan&apos;s neural knowledge base about his B.Sc. in CSE at SUST, his role as AI &amp; Automation Executive at Waffle Up, teaching at Tworon, Kairyn v5.1, or open the interactive UNIX terminal.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={onOpenAI}
                    className="px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest font-bold bg-[#f472b6] text-black hover:opacity-90 transition-all"
                  >
                    ✦ Launch RJ.AI Chat
                  </button>
                  <button
                    onClick={() =>
                      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', bubbles: true }))
                    }
                    className="px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/10 transition-all"
                  >
                    &gt;_ Toggle Terminal (`)
                  </button>
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
                  >
                    ↓ Download Resume PDF
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
