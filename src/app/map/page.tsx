import { NavBar }      from '@/components/layout/NavBar';
import { BDMapClient } from './BDMapClient';

export const metadata = { title: 'Coordinates — Bangladesh Map' };

export default function MapPage() {
  return (
    <div className="theme-page">
      <NavBar />
      <main className="min-h-screen px-4 pt-24 pb-16 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs tracking-widest font-mono mb-1" style={{ color: 'var(--c-accent)' }}>
            {'// COORDINATES'}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--c-text)' }}>
            Bangladesh Tactical Grid
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--c-muted)' }}>
            Sylhet (Current Base · SUST CSE) · Dinajpur (Hometown) · Rajshahi (RCC) · Dhaka · Rangpur
          </p>
        </div>

        <BDMapClient />
      </main>
    </div>
  );
}
