import type { Metadata } from 'next';
import { StudioViewport } from '@/components/StudioViewport';

export const metadata: Metadata = {
  title: 'Living Sylhet 3D Studio',
  description:
    'Interactive procedural PBR Three.js workspace recreating a rainy Sylhet desk with a GLSL rain shader, instanced 78-keycap keyboard, 64-district Bangladesh map, and 60 FPS canvas arcade.',
};

export default function StudioPage() {
  return <StudioViewport />;
}
