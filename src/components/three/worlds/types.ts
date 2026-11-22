import type * as THREE from 'three';

export interface WorldHandle {
  group: THREE.Group;
  update: (
    elapsed: number,
    dt: number,
    pointer: { x: number; y: number },
    activeWeight: number
  ) => void;
  dispose: () => void;
}

export type StudioMood = 'midnight' | 'monsoon' | 'dawn';
export type UjaanScenario = 'normal' | 'surge' | 'override';
