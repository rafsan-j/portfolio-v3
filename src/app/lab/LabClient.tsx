'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/lib/supabase';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';

export function LabClient({ projects }: { projects: Project[] }) {
  const { mode } = useVisitorMode();
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const allTags = ['all', ...Array.from(new Set(projects.flatMap(p => p.tech_stack ?? [])))];
  const shown   = filter === 'all' ? projects : projects.filter(p => p.tech_stack?.includes(filter));

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.slice(0, 16).map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`tag transition-all ${filter === tag ? 'tag-neon' : 'tag-ghost'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {shown.map((p, i) => {
            const isGenericProfile = p.github_url === 'https://github.com/rafsan-j';
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  onClick={() => setSelected(p)}
                  className="panel panel-accent h-full cursor-pointer group hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Visual Schematic Banner */}
                  {p.cover_image_url && (
                    <div className="w-full h-32 overflow-hidden border-b relative" style={{ borderColor: 'var(--c-border)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>
                        {mode === 'recruiter' || mode === 'friend' ? `Project 0${i + 1}` : `SYS-0${i + 1}`}
                      </span>
                      {p.is_featured && <span className="tag tag-amber">Featured</span>}
                    </div>
                    <h3
                      className="font-display text-sm font-bold mb-2 transition-colors"
                      style={{ color: 'var(--c-text)' }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed mb-4 line-clamp-3 flex-1"
                      style={{ color: 'var(--c-muted)' }}
                    >
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {p.tech_stack?.map(t => (
                        <span key={t} className="tag tag-cyan text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-xs mt-auto pt-2.5 border-t" style={{ borderColor: 'var(--c-border)' }}>
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="link-underline transition-colors"
                          style={{ color: 'var(--c-muted)' }}
                        >
                          {isGenericProfile ? 'GitHub Profile ↗' : 'Source Repo ↗'}
                        </a>
                      )}
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="link-underline transition-colors"
                          style={{ color: 'var(--c-accent-2)' }}
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {p.case_study && (
                        <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--c-accent)' }}>
                          Case Study →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {shown.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: 'var(--c-muted)' }}>
          No projects tagged: {filter}
        </p>
      )}

      {/* Case study modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="panel w-full max-w-2xl max-h-[84vh] overflow-y-auto overflow-hidden"
            >
              {selected.cover_image_url && (
                <div className="w-full h-40 border-b" style={{ borderColor: 'var(--c-border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.cover_image_url}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="font-display text-xl font-bold" style={{ color: 'var(--c-text)' }}>
                    {selected.title}
                  </h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xl leading-none"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selected.tech_stack?.map(t => (
                    <span key={t} className="tag tag-cyan">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--c-text)' }}>
                  {selected.description}
                </p>
                {selected.case_study && (
                  <div className="border-t pt-4" style={{ borderColor: 'var(--c-border)' }}>
                    <p className="text-xs tracking-widest mb-3 font-mono" style={{ color: 'var(--c-accent)' }}>
                      // ARCHITECTURE &amp; ENGINEERING CASE STUDY
                    </p>
                    <p
                      className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-4 rounded border"
                      style={{
                        color: 'var(--c-muted)',
                        background: 'var(--c-surface)',
                        borderColor: 'var(--c-border)',
                      }}
                    >
                      {selected.case_study}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 mt-6 flex-wrap">
                  {selected.github_url && (
                    <a href={selected.github_url} target="_blank" rel="noreferrer" className="btn-neon text-xs">
                      <span>
                        {selected.github_url === 'https://github.com/rafsan-j'
                          ? 'View GitHub Profile ↗'
                          : 'View Source Repository ↗'}
                      </span>
                    </a>
                  )}
                  {selected.live_url && (
                    <a
                      href={selected.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-neon text-xs"
                      style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
                    >
                      <span>Live Demo ↗</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
