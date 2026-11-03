'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';
import { getInkwellPosts, type InkwellPost } from '@/lib/supabase';

export default function InkwellPage() {
  const [posts, setPosts]     = useState<InkwellPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInkwellPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="theme-page">
      <NavBar />
      <main className="min-h-screen max-w-3xl mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs tracking-widest font-mono mb-2" style={{ color: 'var(--c-accent)' }}>
            // THE INKWELL
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--c-text)' }}>
            Writing &amp; Engineering Notes
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
            Deep dives on 60 FPS 3D shaders, systems thinking, SUST CSE, and cognitive pacing.
          </p>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-lg animate-pulse panel" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/inkwell/${post.slug}`}
                  className="panel p-6 block group hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-lg font-bold mb-2 transition-colors"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p
                          className="text-sm leading-relaxed mb-3 line-clamp-2"
                          style={{ color: 'var(--c-muted)' }}
                        >
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--c-muted)' }}>
                        <span>
                          {new Date(post.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {post.reading_time && <span>{post.reading_time} min read</span>}
                      </div>
                    </div>
                    <span
                      className="text-lg transition-transform group-hover:translate-x-1 flex-shrink-0 mt-1"
                      style={{ color: 'var(--c-accent)' }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
