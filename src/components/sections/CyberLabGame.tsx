'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useVisitorMode } from '@/components/ui/VisitorModeProvider'
import { FALLBACK_ARCHIVE, FALLBACK_PROJECTS } from '@/lib/fallbackData'

type StationId = 'overview' | 'pc_tower' | 'main_monitor' | 'vertical_monitor' | 'tablet_dock' | 'cern_scope'

interface StationConfig {
  id: StationId
  code: string
  title: string
  subtitle: string
  color: string
  camPos: [number, number, number]
  lookAt: [number, number, number]
  badgePos: [number, number, number]
}

const STATIONS: Record<StationId, StationConfig> = {
  overview: {
    id: 'overview',
    code: 'ROOM-00',
    title: '3D Engineering Battlestation',
    subtitle: 'Click any 3D monitor, the tempered-glass PC rig, tablet dock, or oscilloscope to zoom in',
    color: '#00ff88',
    camPos: [0, 2.55, 4.35],
    lookAt: [0, 1.05, -0.4],
    badgePos: [0, 0, 0],
  },
  main_monitor: {
    id: 'main_monitor',
    code: 'MON-01',
    title: '34" Curved Ultrawide · TryHackMe CTF & OS',
    subtitle: 'Interactive Penetration Testing Terminal, Port Scanner & Flag Decryption',
    color: '#00ff88',
    camPos: [0, 1.38, 1.45],
    lookAt: [0, 1.32, -0.55],
    badgePos: [0, 2.05, -0.5],
  },
  vertical_monitor: {
    id: 'vertical_monitor',
    code: 'MON-02',
    title: '27" Vertical IDE · The Lab (Projects)',
    subtitle: 'Full-Stack, Android 60FPS Shaders, AI Automation & IoT Systems',
    color: '#00d4ff',
    camPos: [-1.45, 1.42, 1.55],
    lookAt: [-1.62, 1.36, -0.35],
    badgePos: [-1.62, 2.25, -0.35],
  },
  pc_tower: {
    id: 'pc_tower',
    code: 'RIG-01',
    title: 'Custom Tempered-Glass PC Rig Builder',
    subtitle: 'Inspect internal GPU/CPU/RAM architecture, thermal telemetry & Overclock Mode',
    color: '#ff3366',
    camPos: [1.55, 1.48, 1.55],
    lookAt: [1.75, 1.32, -0.32],
    badgePos: [1.75, 2.18, -0.32],
  },
  tablet_dock: {
    id: 'tablet_dock',
    code: 'TAB-03',
    title: 'Secondary Tablet & 75% Red-Switch Deck',
    subtitle: 'Kairyn v5.1 Android OS, SUST CSE Academic Roadmap & Career Metrics',
    color: '#a855f7',
    camPos: [-0.55, 1.12, 1.25],
    lookAt: [-0.68, 0.86, 0.12],
    badgePos: [-0.72, 1.18, 0.12],
  },
  cern_scope: {
    id: 'cern_scope',
    code: 'LAB-04',
    title: 'CERN Muon Oscilloscope & Research Bench',
    subtitle: 'Relativistic Time-Dilation Waveform Analyzer & Published Research Archive',
    color: '#f59e0b',
    camPos: [1.05, 1.18, 1.42],
    lookAt: [1.08, 0.95, 0.15],
    badgePos: [1.08, 1.32, 0.15],
  },
}

interface PcPart {
  id: string
  name: string
  model: string
  tempBase: number
  loadBase: number
  skillMapping: string
  details: string
  color: string
}

const PC_PARTS: PcPart[] = [
  {
    id: 'gpu',
    name: 'Discrete Graphics Accelerator',
    model: 'RTX / GTX Shader Compute Core (WebGL2 & Android 3D Canvas)',
    tempBase: 58,
    loadBase: 74,
    skillMapping: 'Three.js · React Three Fiber · Custom 60FPS Android Live Wallpaper Shaders (Kairyn v5.1)',
    details: 'Powers zero-allocation 60 FPS geodesic sphere, Lorenz strange attractor, and curl-noise flow fields with WCAG 2.1 luminance adaptation.',
    color: '#00ff88',
  },
  {
    id: 'cpu',
    name: 'Multi-Core Processor + AIO Liquid Cooler',
    model: '12th/14th Gen High-Frequency Compute Engine',
    tempBase: 51,
    loadBase: 62,
    skillMapping: 'C · C++ · Kotlin · Python · Competitive Programming (Codeforces) · SUST CSE',
    details: 'Executes low-level algorithmic problem solving, Bayesian regression pipelines (50,000+ AgriBase records), and Manim 60 FPS mathematical proofs.',
    color: '#00d4ff',
  },
  {
    id: 'ram',
    name: 'Dual-Channel High-Speed Memory',
    model: '32GB DDR5-6400 Low-Latency ARGB',
    tempBase: 42,
    loadBase: 48,
    skillMapping: 'Next.js 14 · React 18 · TypeScript · Jetpack Compose · State & Room DB Sync',
    details: 'Maintains real-time multi-persona state across Developer, Recruiter, Friend, and 3D Battlestation modes with zero layout thrashing.',
    color: '#a855f7',
  },
  {
    id: 'nvme',
    name: 'PCIe Gen4 NVMe Storage Array',
    model: '2TB Supabase PostgreSQL + Edge Cache',
    tempBase: 45,
    loadBase: 35,
    skillMapping: 'Supabase · PostgreSQL · Row-Level Security · Offline Clinical JSON DB',
    details: 'Stores project case studies, research archives, Inkwell MDX essays, and zero-latency clinical drug index records.',
    color: '#f59e0b',
  },
  {
    id: 'npu',
    name: 'Neural AI Co-Processor Bridge',
    model: 'Dual-LLM Inference Router (Groq Llama 3.3 70B + Gemini 2.5)',
    tempBase: 49,
    loadBase: 68,
    skillMapping: 'Agentic AI Workflows · Waffle Up Automation SOPs · Selenium Ticketing Bots',
    details: 'Streams dual-provider AI responses with automatic failover and runs automated enterprise inventory and transit-monitoring pipelines.',
    color: '#ff3366',
  },
]

interface CtfTask {
  id: string
  port: string
  service: string
  title: string
  prompt: string
  hint: string
  command: string
  flag: string
  unlockedIntel: string
}

const CTF_TASKS: CtfTask[] = [
  {
    id: 'ctf-1',
    port: '22/TCP',
    service: 'SSH · SUST-CSE-NODE',
    title: 'Mission 01: Enumerate Academic & Merit Credentials',
    prompt: 'Run the reconnaissance command to verify Rafsan Jani’s National Merit ranking and university batch.',
    hint: 'Type or click: nmap -sV --script=merit-verify sust.edu.bd',
    command: 'nmap -sV --script=merit-verify sust.edu.bd',
    flag: 'FLAG{TOP_0.01_PERCENT_17TH_NATIONAL_MERIT}',
    unlockedIntel: 'VERIFIED: 17th on National Merit List in HSC (GPA 5.00/5.00, Talentpool Scholar 2025) & 18th in SSC at Rajshahi Cadet College. Currently B.Sc. in CSE at SUST.',
  },
  {
    id: 'ctf-2',
    port: '443/TCP',
    service: 'HTTPS · KAIRYN-SHADER-CORE',
    title: 'Mission 02: Inspect 60 FPS Android Shader Memory Allocation',
    prompt: 'Analyze the Kairyn v5.1 live wallpaper rendering pipeline for garbage-collection pauses.',
    hint: 'Type or click: dumpsys gfxinfo com.rafsan.kairyn --framestats',
    command: 'dumpsys gfxinfo com.rafsan.kairyn --framestats',
    flag: 'FLAG{ZERO_ALLOC_60FPS_LORENZ_ATTRACTOR}',
    unlockedIntel: 'VERIFIED: Pre-allocated FloatArray vertex buffers & Choreographer 30/60 FPS dynamic throttling achieve 0 GC pauses across 3D Plexus & Lorenz Attractor wallpapers.',
  },
  {
    id: 'ctf-3',
    port: '5432/TCP',
    service: 'PGSQL · SUPABASE-RLS-AUDIT',
    title: 'Mission 03: Patch Row-Level Security & Verify AI Failover',
    prompt: 'Verify that private inbox tables are locked down and dual-LLM failover (Groq + Gemini) is active.',
    hint: 'Type or click: sqlmap --verify-rls --check-llm-failover',
    command: 'sqlmap --verify-rls --check-llm-failover',
    flag: 'FLAG{GROQ_GEMINI_DUAL_STREAM_SECURED}',
    unlockedIntel: 'VERIFIED: Server-side admin auth gate active; RJ.AI automatically fails over between Groq Llama-3.3-70B and Google Gemini 2.5 Flash.',
  },
  {
    id: 'ctf-4',
    port: '8080/TCP',
    service: 'CERN-T9 · MUON-DAQ',
    title: 'Mission 04: Decode Relativistic Muon Time-Dilation Telemetry',
    prompt: 'Extract coincidence timing intervals from the Silicon Photomultiplier (SiPM) + BC-408 scintillator array.',
    hint: 'Type or click: cern-daq --coincidence --gamma-factor=29.3',
    command: 'cern-daq --coincidence --gamma-factor=29.3',
    flag: 'FLAG{RELATIVISTIC_MUON_LIFETIME_2.2US_VERIFIED}',
    unlockedIntel: 'VERIFIED: CERN Beamline for Schools experiment + AgriBase (Innovation World Cup Bronze Medal, 50,000+ records) + College Prefect leading 297 cadets.',
  },
]

// ─── Procedural High-DPI Canvas Textures for 3D Screens ───────────────

function useUltrawideScreenTexture(overclock: boolean, solvedCount: number) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 1600
    canvas.height = 680
    const ctx = canvas.getContext('2d')!

    const grad = ctx.createLinearGradient(0, 0, 1600, 680)
    grad.addColorStop(0, '#050811')
    grad.addColorStop(0.5, '#091326')
    grad.addColorStop(1, '#050b14')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1600, 680)

    ctx.strokeStyle = overclock ? 'rgba(255, 51, 102, 0.12)' : 'rgba(0, 255, 136, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < 1600; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 680)
      ctx.stroke()
    }
    for (let y = 0; y < 680; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1600, y)
      ctx.stroke()
    }

    ctx.fillStyle = '#0b1528'
    ctx.fillRect(0, 0, 1600, 44)
    ctx.fillStyle = overclock ? '#ff3366' : '#00ff88'
    ctx.font = 'bold 20px monospace'
    ctx.fillText('● RJ_OS v5.1 // TRYHACKME CYBER-OPS WORKSTATION // SYLHET_NODE', 24, 29)
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`FLAGS CAPTURED: ${solvedCount}/4   |   GPU: ${overclock ? 'OVERCLOCK 2.85 GHz' : 'OPTIMAL 60 FPS'}`, 1040, 29)

    ctx.fillStyle = 'rgba(7, 12, 24, 0.92)'
    ctx.strokeStyle = overclock ? '#ff3366' : '#00ff88'
    ctx.lineWidth = 3
    ctx.fillRect(36, 72, 920, 560)
    ctx.strokeRect(36, 72, 920, 560)

    ctx.fillStyle = '#111c33'
    ctx.fillRect(38, 74, 916, 38)
    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('rafsan@sust-cse:~/cyber-ops$ nmap -sV --script=vuln 10.10.72.1', 56, 100)

    const lines = [
      'Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-05 BST',
      'PORT     STATE SERVICE       VERSION',
      '22/tcp   open  ssh           SUST-CSE-Merit-Verifier (Top 0.01% / 17th)',
      '443/tcp  open  ssl/kairyn    Kairyn-v5.1-3D-Wallpaper-Engine (60 FPS)',
      '5432/tcp open  postgresql    Supabase-RLS-Cluster + Groq/Gemini Router',
      '8080/tcp open  cern-daq      CERN-Beamline-T9-SiPM-Scintillator',
      '',
      '>>> CLICK MONITOR TO LAUNCH INTERACTIVE CTF TERMINAL <<<',
      `>>> SECURITY CLEARANCE: ${solvedCount === 4 ? 'ROOT ARCHITECT [UNLOCKED]' : `LEVEL ${solvedCount + 1} OPERATOR`}`,
    ]
    ctx.font = '20px monospace'
    lines.forEach((line, i) => {
      ctx.fillStyle = i >= 7 ? (overclock ? '#ff3366' : '#00ff88') : '#e2e8f0'
      ctx.fillText(line, 60, 155 + i * 44)
    })

    ctx.fillStyle = 'rgba(7, 12, 24, 0.92)'
    ctx.strokeStyle = '#00d4ff'
    ctx.fillRect(990, 72, 574, 560)
    ctx.strokeRect(990, 72, 574, 560)

    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 20px monospace'
    ctx.fillText('SYSTEM ARCHITECTURE TELEMETRY', 1018, 114)

    const metrics = [
      { label: 'B.Sc. CSE @ SUST', val: 'Batch 25 · Active', col: '#00ff88' },
      { label: 'Waffle Up', val: 'AI & Automation Exec', col: '#00d4ff' },
      { label: 'Tworon', val: 'STEM & Code Instructor', col: '#a855f7' },
      { label: 'National Merit HSC', val: '17th / 180,000+ (5.00)', col: '#f59e0b' },
      { label: 'Rajshahi Cadet College', val: 'College Prefect (297)', col: '#ff3366' },
    ]
    metrics.forEach((m, idx) => {
      const y = 165 + idx * 86
      ctx.fillStyle = '#0f1b33'
      ctx.fillRect(1018, y, 518, 68)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px monospace'
      ctx.fillText(m.label.toUpperCase(), 1036, y + 26)
      ctx.fillStyle = m.col
      ctx.font = 'bold 21px monospace'
      ctx.fillText(m.val, 1036, y + 54)
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [overclock, solvedCount])
}

function useVerticalIdeTexture() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 720
    canvas.height = 1280
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#070b14'
    ctx.fillRect(0, 0, 720, 1280)

    ctx.fillStyle = '#10192d'
    ctx.fillRect(0, 0, 720, 52)
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('EXPLORER // THE LAB (PROJECTS)', 24, 34)

    const codeLines = [
      '// KairynWallpaperEngine.kt (60 FPS 3D)',
      'class LorenzAttractorShader {',
      '  private val vertices = FloatArray(4500)',
      '  fun step(dt: Float) {',
      '    val dx = sigma * (y - x)',
      '    val dy = x * (rho - z) - y',
      '    val dz = x * y - beta * z',
      '  }',
      '}',
      '',
      '// FEATURED PORTFOLIO REPOS:',
      '01. Kairyn v5.1 (Android Habit & 3D OS)',
      '02. S_Track (SUST CSE Academic OS)',
      '03. Takonomics (Android Personal Finance)',
      '04. ParallaxMascot3D (Gyro 5-Plane UI)',
      '05. AgriBase (Bayesian ML · Bronze)',
      '06. CERN Beamline Muon Experiment',
      '07. HAYTHAM X ONE (CSP + AI Energy)',
      '08. Punorabritti (Transit Bot)',
      '09. Manim Math + Audio DSP Engine',
      '10. Clinical Prescription Suite',
      '11. Project ClearRiver (IoT Sensor)',
      '',
      '>>> CLICK TO INSPECT ALL PROJECTS <<<',
    ]

    ctx.font = '21px monospace'
    codeLines.forEach((line, idx) => {
      ctx.fillStyle =
        line.startsWith('//') ? '#00ff88' : line.startsWith('>>>') ? '#00d4ff' : line.match(/^\d\d\./) ? '#f8fafc' : '#93c5fd'
      ctx.fillText(line, 28, 104 + idx * 46)
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [])
}

function useOscilloscopeTexture(freq: number) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 480
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#04120c'
    ctx.fillRect(0, 0, 800, 480)

    ctx.strokeStyle = 'rgba(0, 255, 136, 0.18)'
    ctx.lineWidth = 1
    for (let x = 0; x < 800; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 480)
      ctx.stroke()
    }
    for (let y = 0; y < 480; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(800, y)
      ctx.stroke()
    }

    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 4
    ctx.beginPath()
    for (let x = 0; x < 800; x++) {
      const t = (x / 800) * Math.PI * 2 * freq
      const envelope = Math.exp(-Math.pow((x - 400) / 140, 2))
      const y = 180 - Math.sin(t * 3) * 95 * envelope
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let x = 0; x < 800; x++) {
      const t = (x / 800) * Math.PI * 2 * freq
      const y = 350 + Math.cos(t * 2) * 35
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 20px monospace'
    ctx.fillText(`CH1: SiPM BC-408 MUON DECAY  |  γ = ${(29.3 * (freq / 2)).toFixed(1)}  |  τ = 2.197 μs`, 24, 38)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText('CH2: COINCIDENCE TRIGGER LOGIC  >>> CLICK TO OPEN ARCHIVE <<<', 24, 452)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [freq])
}

// ─── Smooth Camera Controller with Mouse Parallax ─────────────────────

function CameraRig({ activeStation }: { activeStation: StationId }) {
  const { camera, pointer } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 2.55, 4.35))
  const currentLook = useRef(new THREE.Vector3(0, 1.05, -0.4))

  useFrame((_, delta) => {
    const cfg = STATIONS[activeStation]
    const parallaxX = activeStation === 'overview' ? pointer.x * 0.42 : pointer.x * 0.06
    const parallaxY = activeStation === 'overview' ? pointer.y * 0.22 : pointer.y * 0.04

    const targetPos = new THREE.Vector3(
      cfg.camPos[0] + parallaxX,
      cfg.camPos[1] + parallaxY,
      cfg.camPos[2]
    )
    const targetLook = new THREE.Vector3(cfg.lookAt[0], cfg.lookAt[1], cfg.lookAt[2])

    const speed = Math.min(1, delta * 4.5)
    currentPos.current.lerp(targetPos, speed)
    currentLook.current.lerp(targetLook, speed)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLook.current)
  })

  return null
}

// ─── 3D Tempered-Glass Custom PC Tower (with Spinning ARGB Fans) ──────

function CustomPcTower({
  overclock,
  selectedPart,
  onSelectStation,
}: {
  overclock: boolean
  selectedPart: string
  onSelectStation: () => void
}) {
  const fan1Ref = useRef<THREE.Group>(null)
  const fan2Ref = useRef<THREE.Group>(null)
  const fan3Ref = useRef<THREE.Group>(null)
  const cpuRingRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const speed = overclock ? delta * 18 : delta * 6
    if (fan1Ref.current) fan1Ref.current.rotation.z += speed
    if (fan2Ref.current) fan2Ref.current.rotation.z += speed
    if (fan3Ref.current) fan3Ref.current.rotation.z += speed
    if (cpuRingRef.current) {
      cpuRingRef.current.rotation.z -= speed * 0.5
      const s = 1 + Math.sin(state.clock.elapsedTime * (overclock ? 8 : 3)) * 0.06
      cpuRingRef.current.scale.set(s, s, 1)
    }
  })

  const accent = overclock ? '#ff3366' : '#00ff88'

  return (
    <group
      position={[1.75, 1.32, -0.32]}
      rotation={[0, -0.38, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onSelectStation()
      }}
    >
      <mesh position={[0, 0, -0.26]}>
        <boxGeometry args={[0.56, 1.12, 0.04]} />
        <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.56, 0.04, 0.56]} />
        <meshPhysicalMaterial color="#111827" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.54, 0]}>
        <boxGeometry args={[0.56, 0.06, 0.56]} />
        <meshPhysicalMaterial color="#090d16" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.52, 0.22, 0.52]} />
        <meshPhysicalMaterial color="#0b1120" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.29, 0.265]}>
        <boxGeometry args={[0.5, 0.015, 0.01]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      <mesh position={[0.08, 0.08, -0.18]}>
        <boxGeometry args={[0.36, 0.68, 0.02]} />
        <meshStandardMaterial color="#091526" metalness={0.6} roughness={0.35} />
      </mesh>

      <group position={[0.02, 0.22, -0.13]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 32]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh ref={cpuRingRef} position={[0, 0, 0.032]}>
          <ringGeometry args={[0.05, 0.075, 32]} />
          <meshBasicMaterial color={selectedPart === 'cpu' ? '#ffffff' : '#00d4ff'} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {[-0.03, -0.01, 0.01, 0.03].map((offset, idx) => (
        <mesh key={idx} position={[0.16 + offset, 0.22, -0.12]}>
          <boxGeometry args={[0.012, 0.16, 0.035]} />
          <meshBasicMaterial color={selectedPart === 'ram' ? '#ffffff' : idx % 2 === 0 ? '#a855f7' : '#00d4ff'} />
        </mesh>
      ))}

      <group position={[0.04, -0.06, -0.04]}>
        <mesh>
          <boxGeometry args={[0.42, 0.11, 0.22]} />
          <meshPhysicalMaterial
            color={selectedPart === 'gpu' ? '#1e293b' : '#0f172a'}
            metalness={0.85}
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.112]}>
          <boxGeometry args={[0.38, 0.024, 0.01]} />
          <meshBasicMaterial color={selectedPart === 'gpu' ? '#ffffff' : accent} />
        </mesh>
      </group>

      <mesh position={[0.04, 0.06, -0.15]}>
        <boxGeometry args={[0.18, 0.04, 0.02]} />
        <meshBasicMaterial color={selectedPart === 'nvme' ? '#ffffff' : '#f59e0b'} />
      </mesh>

      {[0.32, 0.04, -0.24].map((yPos, idx) => {
        const ref = idx === 0 ? fan1Ref : idx === 1 ? fan2Ref : fan3Ref
        return (
          <group key={idx} position={[-0.26, yPos, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <ringGeometry args={[0.095, 0.115, 32]} />
              <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
            </mesh>
            <group ref={ref}>
              {[0, 1, 2, 3, 4, 5].map((b) => (
                <mesh key={b} rotation={[0, 0, (b * Math.PI) / 3]}>
                  <boxGeometry args={[0.17, 0.025, 0.008]} />
                  <meshStandardMaterial color="#e2e8f0" transparent opacity={0.75} />
                </mesh>
              ))}
            </group>
          </group>
        )
      })}

      <mesh position={[0, 0.06, 0.27]}>
        <boxGeometry args={[0.54, 0.92, 0.012]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0.1}
          transmission={0.85}
          reflectivity={0.9}
        />
      </mesh>

      <pointLight position={[0, 0.1, 0.1]} intensity={overclock ? 2.6 : 1.5} distance={2.5} color={accent} />
    </group>
  )
}

// ─── Full 3D Engineering Battlestation Scene ──────────────────────────

function BattlestationScene({
  activeStation,
  setActiveStation,
  overclock,
  selectedPart,
  solvedCount,
  scopeFreq,
  hideHud,
}: {
  activeStation: StationId
  setActiveStation: (s: StationId) => void
  overclock: boolean
  selectedPart: string
  solvedCount: number
  scopeFreq: number
  hideHud: boolean
}) {
  const ultrawideTex = useUltrawideScreenTexture(overclock, solvedCount)
  const verticalTex = useVerticalIdeTexture()
  const scopeTex = useOscilloscopeTexture(scopeFreq)

  return (
    <>
      <color attach="background" args={['#04070f']} />
      <fog attach="fog" args={['#04070f', 4.5, 13]} />

      <CameraRig activeStation={activeStation} />

      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 6, 4]} intensity={1.3} color="#e0f2fe" />
      <pointLight position={[0, 2.2, -0.8]} intensity={2.2} distance={6} color={overclock ? '#ff3366' : '#00ff88'} />
      <pointLight position={[-2.2, 2.0, -0.4]} intensity={1.8} distance={5} color="#00d4ff" />
      <pointLight position={[1.2, 1.4, 0.8]} intensity={1.2} distance={4} color="#a855f7" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshPhysicalMaterial color="#060a14" metalness={0.6} roughness={0.3} clearcoat={0.4} />
      </mesh>
      <gridHelper args={[18, 36, '#00ff88', '#0f172a']} position={[0, 0.005, 0]} />

      <mesh position={[0, 2.2, -1.25]}>
        <boxGeometry args={[7.5, 4.5, 0.08]} />
        <meshStandardMaterial color="#070d19" roughness={0.7} metalness={0.2} />
      </mesh>
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={i} position={[-3.0 + i * 0.25, 2.2, -1.19]}>
          <boxGeometry args={[0.08, 4.4, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, -1.15]}>
        <boxGeometry args={[4.8, 0.035, 0.03]} />
        <meshBasicMaterial color={overclock ? '#ff3366' : '#00ff88'} />
      </mesh>

      <group position={[0, 0.74, -0.1]}>
        <mesh>
          <boxGeometry args={[4.6, 0.07, 1.55]} />
          <meshPhysicalMaterial color="#0c1322" metalness={0.55} roughness={0.25} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.78]}>
          <boxGeometry args={[4.6, 0.018, 0.015]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
        <mesh position={[-2.1, -0.38, 0]}>
          <boxGeometry args={[0.1, 0.74, 1.3]} />
          <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[2.1, -0.38, 0]}>
          <boxGeometry args={[0.1, 0.74, 1.3]} />
          <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, 0.038, 0.18]}>
          <boxGeometry args={[2.3, 0.008, 0.82]} />
          <meshStandardMaterial color="#070b14" roughness={0.85} />
        </mesh>
      </group>

      {/* [MON-01] 34" Curved Ultrawide Primary Monitor */}
      <group
        position={[0, 1.35, -0.55]}
        onClick={(e) => {
          e.stopPropagation()
          setActiveStation('main_monitor')
        }}
      >
        <mesh position={[0, -0.32, -0.12]}>
          <cylinderGeometry args={[0.035, 0.045, 0.58, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.57, -0.08]}>
          <boxGeometry args={[0.48, 0.025, 0.32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.96, 0.86, 0.045]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.2} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[1.9, 0.8]} />
          {ultrawideTex && <meshBasicMaterial map={ultrawideTex} />}
        </mesh>
        <mesh position={[0, 0.45, 0.06]}>
          <boxGeometry args={[0.95, 0.022, 0.03]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* [MON-02] 27" Vertical Coding Monitor (Left) */}
      <group
        position={[-1.62, 1.38, -0.35]}
        rotation={[0, 0.36, 0]}
        onClick={(e) => {
          e.stopPropagation()
          setActiveStation('vertical_monitor')
        }}
      >
        <mesh>
          <boxGeometry args={[0.68, 1.22, 0.04]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.63, 1.16]} />
          {verticalTex && <meshBasicMaterial map={verticalTex} />}
        </mesh>
      </group>

      {/* [RIG-01] Tempered-Glass Custom PC Tower (Right) */}
      <CustomPcTower
        overclock={overclock}
        selectedPart={selectedPart}
        onSelectStation={() => setActiveStation('pc_tower')}
      />

      {/* [TAB-03] 75% Mechanical Keyboard, Vertical Mouse & Secondary Tablet */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          setActiveStation('tablet_dock')
        }}
      >
        <group position={[-0.05, 0.8, 0.24]} rotation={[0.08, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.68, 0.032, 0.28]} />
            <meshPhysicalMaterial color="#111827" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.018, 0]}>
            <boxGeometry args={[0.64, 0.008, 0.24]} />
            <meshBasicMaterial color="#ff3366" />
          </mesh>
          {[-0.08, -0.03, 0.02, 0.07].map((zRow, rIdx) => (
            <mesh key={rIdx} position={[-0.02, 0.028, zRow]}>
              <boxGeometry args={[0.58, 0.016, 0.036]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0.29, 0.032, -0.09]}>
            <cylinderGeometry args={[0.022, 0.022, 0.025, 20]} />
            <meshStandardMaterial color="#00ff88" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        <group position={[0.48, 0.82, 0.24]} rotation={[0, -0.15, 0.35]}>
          <mesh>
            <boxGeometry args={[0.11, 0.09, 0.17]} />
            <meshPhysicalMaterial color="#0f172a" metalness={0.6} roughness={0.3} clearcoat={0.5} />
          </mesh>
          <mesh position={[-0.056, 0.01, 0]}>
            <boxGeometry args={[0.006, 0.04, 0.12]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
        </group>

        <group position={[-0.74, 0.92, 0.08]} rotation={[-0.45, 0.28, 0]}>
          <mesh>
            <boxGeometry args={[0.48, 0.34, 0.018]} />
            <meshPhysicalMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.44, 0.3]} />
            <meshBasicMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[0.26, 0, 0.01]} rotation={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* [LAB-04] CERN Muon Oscilloscope & Hardware Bench */}
      <group
        position={[1.05, 0.96, 0.14]}
        rotation={[0, -0.28, 0]}
        onClick={(e) => {
          e.stopPropagation()
          setActiveStation('cern_scope')
        }}
      >
        <mesh>
          <boxGeometry args={[0.58, 0.36, 0.26]} />
          <meshPhysicalMaterial color="#1e293b" metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh position={[-0.06, 0.02, 0.132]}>
          <planeGeometry args={[0.38, 0.24]} />
          {scopeTex && <meshBasicMaterial map={scopeTex} />}
        </mesh>
        {[0.08, 0.0, -0.08].map((yK, k) => (
          <mesh key={k} position={[0.2, yK, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.025, 20]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Floating 3D Interactive Badges Above Every Station */}
      {!hideHud &&
        (Object.values(STATIONS).filter((s) => s.id !== 'overview') as StationConfig[]).map((st) => {
          const isCurrent = activeStation === st.id
          return (
            <Html key={st.id} position={st.badgePos} center distanceFactor={6}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveStation(isCurrent ? 'overview' : st.id)
                }}
                className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all shadow-lg flex items-center gap-2"
                style={{
                  background: isCurrent ? st.color : 'rgba(7, 11, 20, 0.88)',
                  color: isCurrent ? '#04070f' : '#f8fafc',
                  border: `1px solid ${st.color}`,
                  boxShadow: `0 0 18px ${st.color}55`,
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: isCurrent ? '#04070f' : st.color }}
                />
                [{st.code}] {st.title.split('·')[0]}
              </button>
            </Html>
          )
        })}
    </>
  )
}

export default function CyberLabGame() {
  const { setMode, setShowAI, setShowTerminal } = useVisitorMode()
  const [activeStation, setActiveStation] = useState<StationId>('overview')
  const [overclock, setOverclock] = useState(false)
  const [selectedPart, setSelectedPart] = useState<string>('gpu')
  const [solvedIds, setSolvedIds] = useState<string[]>([])
  const [activeCtfIndex, setActiveCtfIndex] = useState(0)
  const [cmdInput, setCmdInput] = useState('')
  const [terminalLog, setTerminalLog] = useState<string[]>([
    '[SYSTEM] Connected to RJ_OS v5.1 Cyber-Ops Battlestation (Sylhet Node).',
    '[INTEL] Select a target port below or run the exploit command to capture security flags.',
  ])
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>(FALLBACK_PROJECTS[0]?.slug || '')
  const [scopeFreq, setScopeFreq] = useState<number>(2.0)
  const [hideHud, setHideHud] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveStation('overview')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const currentCtf = CTF_TASKS[activeCtfIndex]
  const activeProject =
    FALLBACK_PROJECTS.find((p) => p.slug === selectedProjectSlug) || FALLBACK_PROJECTS[0]
  const currentPcPart = PC_PARTS.find((p) => p.id === selectedPart) || PC_PARTS[0]

  const runCtfCommand = (rawCmd?: string) => {
    const commandToRun = (rawCmd ?? cmdInput).trim()
    if (!commandToRun) return

    const normalized = commandToRun.toLowerCase()
    const targetCmd = currentCtf.command.toLowerCase()

    if (normalized === targetCmd || normalized.includes(currentCtf.port.split('/')[0].toLowerCase()) || normalized.includes('exploit')) {
      if (!solvedIds.includes(currentCtf.id)) {
        setSolvedIds((prev) => [...prev, currentCtf.id])
      }
      setTerminalLog((prev) => [
        ...prev,
        `$ ${commandToRun}`,
        `[+] PORT ${currentCtf.port} EXPLOITED → ${currentCtf.flag}`,
        `[✓] ${currentCtf.unlockedIntel}`,
      ])
    } else {
      setTerminalLog((prev) => [
        ...prev,
        `$ ${commandToRun}`,
        `[!] Command mismatch. Expected: ${currentCtf.command}`,
      ])
    }
    setCmdInput('')
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#04070f] text-slate-100 select-none font-mono">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2.55, 4.35], fov: 46 }}
        onPointerMissed={() => setActiveStation('overview')}
      >
        <BattlestationScene
          activeStation={activeStation}
          setActiveStation={setActiveStation}
          overclock={overclock}
          selectedPart={selectedPart}
          solvedCount={solvedIds.length}
          scopeFreq={scopeFreq}
          hideHud={hideHud}
        />
      </Canvas>

      {/* Top Command Bar */}
      <div className="fixed top-16 left-0 right-0 z-20 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-[#070c18]/90 border border-emerald-500/30 backdrop-blur-md shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              {STATIONS[activeStation].code} // {STATIONS[activeStation].title}
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {STATIONS[activeStation].subtitle}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-[#070c18]/90 border border-slate-800 px-2.5 py-1.5 rounded-xl backdrop-blur-md">
          {(Object.values(STATIONS) as StationConfig[]).map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] transition-all"
              style={{
                background: activeStation === st.id ? st.color : 'transparent',
                color: activeStation === st.id ? '#04070f' : '#cbd5e1',
                fontWeight: activeStation === st.id ? 700 : 500,
              }}
            >
              {st.id === 'overview' ? '🎥 Wide Room' : st.code}
            </button>
          ))}
          <button
            onClick={() => setHideHud((v) => !v)}
            className="px-2.5 py-1 rounded-lg text-[11px] border border-slate-700 text-slate-300 hover:border-emerald-400"
          >
            {hideHud ? '👁 Show HUD' : '👁 Clean 3D'}
          </button>
          <button
            onClick={() => setMode('developer')}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Exit 3D ✕
          </button>
        </div>
      </div>

      {/* Contextual Station Inspection Modal */}
      {!hideHud && activeStation !== 'overview' && (
        <div className="fixed bottom-5 left-4 right-4 md:left-auto md:right-8 md:w-[540px] max-h-[68vh] overflow-y-auto z-20 rounded-2xl bg-[#070c18]/92 border border-slate-700/80 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <span
                className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold"
                style={{
                  background: `${STATIONS[activeStation].color}22`,
                  color: STATIONS[activeStation].color,
                }}
              >
                {STATIONS[activeStation].code} ACTIVE
              </span>
              <h3 className="text-base font-bold text-white mt-1">{STATIONS[activeStation].title}</h3>
            </div>
            <button
              onClick={() => setActiveStation('overview')}
              className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              ← Back to Room (ESC)
            </button>
          </div>

          {activeStation === 'pc_tower' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">TRYHACKME // PC ARCHITECTURE DIAGNOSTICS</div>
                  <div className="text-[11px] text-slate-400">
                    Click any internal component below to inspect its mapped engineering stack
                  </div>
                </div>
                <button
                  onClick={() => setOverclock((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    overclock
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-emerald-400 text-slate-950'
                  }`}
                >
                  {overclock ? '⚡ OVERCLOCK: ON (5.4 GHz)' : '⚡ Enable Overclock'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PC_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part.id)}
                    className="p-2.5 rounded-xl text-left border transition-all"
                    style={{
                      background: selectedPart === part.id ? `${part.color}18` : '#0b1324',
                      borderColor: selectedPart === part.id ? part.color : '#1e293b',
                    }}
                  >
                    <div className="text-[10px] font-bold uppercase" style={{ color: part.color }}>
                      {part.id.toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-white truncate mt-0.5">{part.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {overclock ? part.tempBase + 11 : part.tempBase}°C ·{' '}
                      {overclock ? Math.min(99, part.loadBase + 18) : part.loadBase}% Load
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2">
                <div className="text-xs font-bold" style={{ color: currentPcPart.color }}>
                  {currentPcPart.model}
                </div>
                <div className="text-xs text-emerald-300 font-semibold">
                  Stack Mapping: {currentPcPart.skillMapping}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentPcPart.details}</p>
              </div>
            </div>
          )}

          {activeStation === 'main_monitor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold">
                  FLAGS CAPTURED: {solvedIds.length} / {CTF_TASKS.length}
                </span>
                <span className="text-slate-400">
                  Clearance: {solvedIds.length === 4 ? 'ROOT ARCHITECT' : `LEVEL ${solvedIds.length + 1}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {CTF_TASKS.map((task, idx) => {
                  const solved = solvedIds.includes(task.id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => setActiveCtfIndex(idx)}
                      className="p-2 rounded-lg text-left border text-[11px] transition-all"
                      style={{
                        borderColor: activeCtfIndex === idx ? '#00ff88' : '#1e293b',
                        background: solved ? 'rgba(0, 255, 136, 0.12)' : '#0b1324',
                      }}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-400">{task.port}</span>
                        <span>{solved ? '✓ PWNED' : 'LOCKED'}</span>
                      </div>
                      <div className="text-slate-300 truncate mt-0.5">{task.service}</div>
                    </button>
                  )
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white">{currentCtf.title}</div>
                <p className="text-[11px] text-slate-300">{currentCtf.prompt}</p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <code className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded truncate">
                    {currentCtf.command}
                  </code>
                  <button
                    onClick={() => runCtfCommand(currentCtf.command)}
                    className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 hover:bg-emerald-300"
                  >
                    ▶ Run Exploit
                  </button>
                </div>
              </div>

              <div className="bg-black/90 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto text-[11px] space-y-1">
                {terminalLog.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith('[✓]') || line.startsWith('[+]')
                        ? 'text-emerald-400'
                        : line.startsWith('[!]')
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  runCtfCommand()
                }}
                className="flex gap-2"
              >
                <input
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  placeholder="Type command or click '▶ Run Exploit'..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-emerald-400 border border-emerald-500/40"
                >
                  Execute
                </button>
              </form>
            </div>
          )}

          {activeStation === 'vertical_monitor' && (
            <div className="space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {FALLBACK_PROJECTS.map((proj) => (
                  <button
                    key={proj.slug}
                    onClick={() => setSelectedProjectSlug(proj.slug)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap border transition-all"
                    style={{
                      borderColor: activeProject.slug === proj.slug ? '#00d4ff' : '#1e293b',
                      background: activeProject.slug === proj.slug ? 'rgba(0, 212, 255, 0.15)' : '#0b1324',
                      color: activeProject.slug === proj.slug ? '#00d4ff' : '#cbd5e1',
                    }}
                  >
                    {proj.title.split('—')[0]}
                  </button>
                ))}
              </div>

              {activeProject && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-sm font-bold text-white">{activeProject.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeProject.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProject.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {activeProject.github_url && (
                      <a
                        href={activeProject.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-400 text-slate-950 text-xs font-bold"
                      >
                        GitHub Source ↗
                      </a>
                    )}
                    <a
                      href="/lab"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                    >
                      Open Full Lab Page →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStation === 'tablet_dock' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="text-purple-400 font-bold">HARDWARE INPUT & TABLET TELEMETRY</div>
                <p className="text-slate-300">
                  • <strong>Keyboard:</strong> 75% Compact Mechanical Layout with Linear Red Switches & Rotary Encoder
                </p>
                <p className="text-slate-300">
                  • <strong>Pointer:</strong> Ergonomic Vertical Mouse for marathon late-night coding sessions
                </p>
                <p className="text-slate-300">
                  • <strong>Secondary Display:</strong> Tablet + Stylus running S_Track Academic OS & Kairyn Widget Preview
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-purple-500 text-white font-bold"
                >
                  ↓ Download Resume PDF
                </a>
                <button
                  onClick={() => setShowAI(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold"
                >
                  ✦ Ask RJ.AI Assistant
                </button>
                <button
                  onClick={() => setShowTerminal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200"
                >
                  &gt;_ Launch UNIX Terminal
                </button>
              </div>
            </div>
          )}

          {activeStation === 'cern_scope' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-amber-400 font-bold">SiPM SCINTILLATOR FREQUENCY TUNER</span>
                  <span className="text-emerald-400">{scopeFreq.toFixed(1)} MHz</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.2}
                  value={scopeFreq}
                  onChange={(e) => setScopeFreq(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {FALLBACK_ARCHIVE.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">{item.date}</div>
                    <p className="text-[11px] text-slate-300 mt-1">{item.abstract}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
