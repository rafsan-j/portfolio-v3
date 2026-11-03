'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function CyberCoreAndParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const coreGroupRef = useRef<THREE.Group>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const icosaRef = useRef<THREE.Mesh>(null!);
  const scrollYRef = useRef(0);
  const { mouse } = useThree();

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY || 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [positions, colors] = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3.5 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const t = Math.random();
      if (t < 0.55) {
        // Neon emerald (#00ff88)
        col[i * 3]     = 0.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 0.53;
      } else if (t < 0.85) {
        // Cyber cyan (#00d4ff)
        col[i * 3]     = 0.0;
        col[i * 3 + 1] = 0.83;
        col[i * 3 + 2] = 1.0;
      } else {
        // Violet pulse (#a78bfa)
        col[i * 3]     = 0.65;
        col[i * 3 + 1] = 0.55;
        col[i * 3 + 2] = 0.98;
      }
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const scrollFactor = scrollYRef.current * 0.0015;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.035 + scrollFactor * 0.6;
      pointsRef.current.rotation.x = t * 0.015 + scrollFactor * 0.3;
      pointsRef.current.position.x += (mouse.x * 0.55 - pointsRef.current.position.x) * 0.04;
      pointsRef.current.position.y += (mouse.y * 0.45 - pointsRef.current.position.y) * 0.04;
    }

    if (coreGroupRef.current) {
      const targetX = 1.85 + mouse.x * 0.45;
      const targetY = 0.25 + mouse.y * 0.35 - scrollFactor * 1.2;
      coreGroupRef.current.position.x += (targetX - coreGroupRef.current.position.x) * 0.05;
      coreGroupRef.current.position.y += (targetY - coreGroupRef.current.position.y) * 0.05;
      coreGroupRef.current.rotation.y = t * 0.22 + scrollFactor * 1.5;
      coreGroupRef.current.rotation.x = mouse.y * 0.35 + scrollFactor * 0.8;
    }

    if (icosaRef.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.05;
      icosaRef.current.scale.set(pulse, pulse, pulse);
      icosaRef.current.rotation.z = -t * 0.15;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3 + t * 0.35;
      ring1Ref.current.rotation.y = t * 0.2;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 4 - t * 0.25;
      ring2Ref.current.rotation.z = t * 0.3;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"    args={[colors, 3]}    />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.62}
          sizeAttenuation
        />
      </points>

      {/* Interactive 3D Geodesic & Gyroscopic Cyber Core */}
      <group ref={coreGroupRef} position={[1.85, 0.25, -1.2]}>
        <mesh ref={icosaRef}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.22} />
        </mesh>

        <mesh>
          <octahedronGeometry args={[0.72, 0]} />
          <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.32} />
        </mesh>

        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.85, 0.012, 12, 90]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.28} />
        </mesh>

        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.2, 0.01, 12, 90]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
        </mesh>
      </group>
    </>
  );
}

export default function WebGLScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <CyberCoreAndParticles />
    </Canvas>
  );
}
