import { Metadata } from 'next';
import { getArchiveEntries } from '@/lib/supabase';
import { NavBar }            from '@/components/layout/NavBar';
import { ArchiveClient }     from './ArchiveClient';

export const metadata: Metadata = { title: 'The Archive — Research & Systems' };
export const revalidate = 60;

export default async function ArchivePage() {
  const entries = await getArchiveEntries();
  return (
    <div className="theme-page">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <p className="text-xs tracking-widest mb-2 font-mono" style={{ color: 'var(--c-accent-2)' }}>
            // THE ARCHIVE
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--c-text)' }}>
            Research, Proofs &amp; Blueprints
          </h1>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            Computational geometry proofs, OSINT digital forensics workflows, CERN particle physics proposals, and franchise operational blueprints.
          </p>
        </div>
        <ArchiveClient entries={entries} />
      </main>
    </div>
  );
}
