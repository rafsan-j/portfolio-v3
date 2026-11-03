'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ArchiveEntry } from '@/lib/supabase';

export function ArchiveClient({ entries }: { entries: ArchiveEntry[] }) {
  const [open, setOpen]     = useState<string | null>(entries[0]?.id ?? null);
  const [filter, setFilter] = useState('all');

  const allTags = ['all', ...Array.from(new Set(entries.flatMap(e => e.tags ?? [])))];
  const shown   = filter === 'all' ? entries : entries.filter(e => e.tags?.includes(filter));

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`tag transition-all ${filter === tag ? 'tag-cyan' : 'tag-ghost'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="panel group cursor-pointer transition-all duration-300"
              onClick={() => setOpen(open === entry.id ? null : entry.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-display text-sm font-bold" style={{ color: 'var(--c-text)' }}>
                        {entry.title}
                      </h3>
                      {entry.date_completed && (
                        <span className="text-[11px] font-mono" style={{ color: 'var(--c-muted)' }}>
                          {new Date(entry.date_completed).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags?.map(t => (
                        <span key={t} className="tag tag-ghost text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`transition-transform duration-300 text-sm flex-shrink-0 mt-1 ${
                      open === entry.id ? 'rotate-90' : ''
                    }`}
                    style={{ color: 'var(--c-accent)' }}
                  >
                    ▶
                  </span>
                </div>
              </div>

              {open === entry.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4"
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--c-muted)' }}>
                    {entry.abstract_content}
                  </p>
                  {entry.pdf_url && (
                    <a
                      href={entry.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="tag tag-cyan inline-flex items-center gap-1"
                    >
                      View Document PDF ↗
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
