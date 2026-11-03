'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';
import { getGalleryImages, type GalleryImage } from '@/lib/supabase';

const CATS = ['all', 'ui', 'generative', 'events', 'photography', 'general'];

export default function VisualsPage() {
  const [images, setImages]     = useState<GalleryImage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  useEffect(() => {
    getGalleryImages().then(data => {
      setImages(data);
      setLoading(false);
    });
  }, []);

  const visible = filter === 'all' ? images : images.filter(i => i.category === filter);
  const cats = CATS.filter(c => c === 'all' || images.some(i => i.category === c));

  return (
    <div className="theme-page">
      <NavBar />
      <main className="min-h-screen px-4 pt-24 pb-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs tracking-widest font-mono mb-2" style={{ color: 'var(--c-accent)' }}>
            // VISUALS
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3" style={{ color: 'var(--c-text)' }}>
            Visuals &amp; 3D Schematics
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
            3D shader previews, mathematical geometry schematics, and project visuals.
          </p>
        </motion.div>

        {cats.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {cats.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`tag ${filter === c ? 'tag-neon' : 'tag-ghost'}`}
              >
                {c} ({c === 'all' ? images.length : images.filter(i => i.category === c).length})
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg animate-pulse panel" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {visible.map((img, i) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="panel group cursor-pointer overflow-hidden"
                  onClick={() => setSelected(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.caption ?? ''}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="p-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                    {img.caption && (
                      <p className="text-xs line-clamp-2 leading-relaxed mb-1" style={{ color: 'var(--c-text)' }}>
                        {img.caption}
                      </p>
                    )}
                    <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--c-accent)' }}>
                      {img.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-3xl w-full panel p-4"
                onClick={e => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.image_url}
                  alt={selected.caption ?? ''}
                  className="w-full max-h-[72vh] object-contain rounded"
                />
                {(selected.caption || selected.category) && (
                  <div className="mt-3 px-1">
                    {selected.caption && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text)' }}>
                        {selected.caption}
                      </p>
                    )}
                    {selected.category && (
                      <p className="text-xs font-mono mt-1 uppercase" style={{ color: 'var(--c-accent)' }}>
                        {selected.category}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm panel"
                  style={{ color: 'var(--c-text)' }}
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}