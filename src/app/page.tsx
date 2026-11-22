import React from 'react';
import dynamic from 'next/dynamic';

const SpatialPortfolioExperience = dynamic(
  () =>
    import('@/components/three/SpatialPortfolioExperience').then(
      (mod) => mod.SpatialPortfolioExperience
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#090C0E] text-[#EDE7DA]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(50% 42% at 50% 50%, rgba(217, 155, 82, 0.14) 0%, rgba(9, 12, 14, 0) 72%)',
          }}
        />
        <div className="relative flex flex-col items-center gap-5 px-6 text-center">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#D99B52] animate-pulse" />
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#EDE7DA]/85">
              RAFSAN JANI · INITIALIZING 3D STUDIO
            </p>
          </div>
          <div className="h-[1px] w-56 overflow-hidden rounded-full bg-[#EDE7DA]/12">
            <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-transparent via-[#D99B52] to-transparent" />
          </div>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return <SpatialPortfolioExperience />;
}
