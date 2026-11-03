import { Metadata }  from 'next';
import { notFound }  from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getInkwellPostBySlug } from '@/lib/supabase';
import { NavBar }    from '@/components/layout/NavBar';
import Link          from 'next/link';

import {
  BookOpen, Code, Terminal, Zap, Star, Heart,
  ArrowRight, ExternalLink, Info, AlertCircle,
  CheckCircle, XCircle, Lightbulb, Globe,
} from 'lucide-react';

interface Props {
  params: { slug: string };
}

const mdxComponents = {
  BookOpen, Code, Terminal, Zap, Star, Heart,
  ArrowRight, ExternalLink, Info, AlertCircle,
  CheckCircle, XCircle, Lightbulb, Globe,
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1.5rem 0',
      }}
    >
      {children}
    </div>
  ),
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getInkwellPostBySlug(params.slug);
  return { title: post?.title ?? 'Post', description: post?.excerpt };
}

export default async function PostPage({ params }: Props) {
  const post = await getInkwellPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="theme-page">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <Link
          href="/inkwell"
          className="text-xs font-mono transition-colors mb-8 inline-block"
          style={{ color: 'var(--c-muted)' }}
        >
          ← Back to Inkwell
        </Link>
        <article>
          <header className="mb-10">
            <h1
              className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight"
              style={{ color: 'var(--c-text)' }}
            >
              {post.title}
            </h1>
            <div className="flex gap-4 text-xs mb-4 font-mono" style={{ color: 'var(--c-muted)' }}>
              <span>
                {new Date(post.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {post.reading_time && <span>{post.reading_time} min read</span>}
            </div>
            <div className="h-px" style={{ background: 'var(--c-border)' }} />
          </header>
          <div className="mdx-content">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>
      </main>
    </div>
  );
}
