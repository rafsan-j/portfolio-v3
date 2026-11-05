import { Metadata } from 'next';
import { getLabProjects } from '@/lib/supabase';
import { NavBar }         from '@/components/layout/NavBar';
import { LabClient }      from './LabClient';

export const metadata: Metadata = { title: 'The Lab — Projects & Builds' };
export const revalidate = 60;

export default async function LabPage() {
  const projects = await getLabProjects();
  return (
    <div className="theme-page">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-xs tracking-widest mb-2 font-mono" style={{ color: 'var(--c-accent)' }}>
            {'// THE LAB'}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--c-text)' }}>
            Projects &amp; Engineered Systems
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            From native Android apps with 60 FPS 3D perspective shaders (<strong>Kairyn v5.1</strong>, <strong>ParallaxMascot3D</strong>) and full-stack university platforms (<strong>S_Track</strong>) to predictive agriculture (<strong>AgriBase</strong>) and CERN particle physics experiments.
          </p>
        </div>
        <LabClient projects={projects} />
      </main>
    </div>
  );
}
