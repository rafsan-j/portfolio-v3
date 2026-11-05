'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  supabase,
  isSupabaseConfigured,
  getLabProjects,
  getArchiveEntries,
  getInkwellPosts,
  getMapLocations,
  getGalleryImages,
  type Project,
  type InboxMessage,
  type MapLocation,
  type InkwellPost,
  type ArchiveEntry,
  type GalleryImage,
} from '@/lib/supabase';
import { DEFAULT_AI_SYSTEM_PROMPT } from '@/lib/fallbackData';

type Tab = 'inbox' | 'projects' | 'archive' | 'posts' | 'map' | 'gallery' | 'knowledge';

function Field({
  label,
  value,
  onChange,
  type = 'text',
  rows = 0,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
  placeholder?: string;
}) {
  const cls =
    'w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 transition-colors placeholder:text-[#4a4a6a] font-mono';
  return (
    <div>
      <label className="block text-[10px] text-[#8888aa] tracking-widest uppercase mb-1">
        {label}
      </label>
      {rows > 0 ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function SaveBtn({
  onClick,
  saving,
  saved,
  error,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  error?: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all disabled:opacity-40"
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function InboxTab() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('pf_inbox_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMessages(data as InboxMessage[]);
      });
  }, []);
  const markRead = async (id: string) => {
    await supabase.from('pf_inbox_messages').update({ is_read: true }).eq('id', id);
    setMessages(ms => ms.map(m => (m.id === id ? { ...m, is_read: true } : m)));
  };
  const del = async (id: string) => {
    await supabase.from('pf_inbox_messages').delete().eq('id', id);
    setMessages(ms => ms.filter(m => m.id !== id));
  };
  if (messages.length === 0)
    return (
      <p className="text-[#8888aa] text-sm text-center py-12">
        No messages in inbox yet.
      </p>
    );
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <div
          key={m.id}
          className={`bg-[#111118] border rounded-lg p-5 ${
            !m.is_read ? 'border-[#00ff88]/25' : 'border-[#1a1a2e]'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div>
              <span className="text-sm text-[#e8e8f0] font-medium">{m.sender_name}</span>
              <span className="text-[#8888aa] text-xs ml-3">{m.sender_email}</span>
              {!m.is_read && (
                <span className="ml-3 text-[10px] px-2 py-0.5 border border-[#00ff88]/35 text-[#00ff88] rounded font-mono">
                  NEW
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!m.is_read && (
                <button
                  onClick={() => markRead(m.id)}
                  className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-[#00ff88] rounded"
                >
                  Mark read
                </button>
              )}
              <a
                href={`mailto:${m.sender_email}`}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded"
              >
                Reply ↗
              </a>
              <button
                onClick={() => del(m.id)}
                className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-[#8888aa] text-sm leading-relaxed">{m.message}</p>
          <p className="text-[#4a4a6a] text-[10px] mt-2">
            {new Date(m.created_at).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [editing, setEditing]     = useState<Partial<Project> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    const data = await getLabProjects();
    setProjects(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const blank = (): Partial<Project> => ({
    title: '',
    description: '',
    tech_stack: [],
    github_url: '',
    live_url: '',
    case_study: '',
    is_featured: false,
    sort_order: 0,
  });

  const save = async () => {
    if (!isSupabaseConfigured) {
      setSaveError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to persist DB changes.');
      return;
    }
    if (!editing?.title) {
      setSaveError('Title required');
      return;
    }
    setSaving(true);
    setSaveError('');
    const result =
      editing.id && !editing.id.startsWith('proj-')
        ? await supabase.from('pf_projects_lab').update(editing).eq('id', editing.id)
        : await supabase.from('pf_projects_lab').insert({ ...editing, id: undefined });
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setEditing(blank());
          setSaveError('');
        }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all"
      >
        + New Project
      </button>
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#00ff88]/20 rounded-lg p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Title *"
                value={editing.title ?? ''}
                onChange={v => setEditing(e => ({ ...e, title: v }))}
              />
              <Field
                label="Sort Order"
                value={String(editing.sort_order ?? 0)}
                onChange={v => setEditing(e => ({ ...e, sort_order: parseInt(v) || 0 }))}
                type="number"
              />
            </div>
            <Field
              label="Description"
              value={editing.description ?? ''}
              onChange={v => setEditing(e => ({ ...e, description: v }))}
              rows={3}
            />
            <Field
              label="Tech Stack (comma separated)"
              value={(editing.tech_stack ?? []).join(', ')}
              onChange={v =>
                setEditing(e => ({
                  ...e,
                  tech_stack: v
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                }))
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="GitHub URL"
                value={editing.github_url ?? ''}
                onChange={v => setEditing(e => ({ ...e, github_url: v }))}
              />
              <Field
                label="Live URL"
                value={editing.live_url ?? ''}
                onChange={v => setEditing(e => ({ ...e, live_url: v }))}
              />
            </div>
            <Field
              label="Case Study"
              value={editing.case_study ?? ''}
              onChange={v => setEditing(e => ({ ...e, case_study: v }))}
              rows={4}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editing.is_featured ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_featured: e.target.checked }))}
                className="accent-[#00ff88]"
              />
              <span className="text-xs text-[#8888aa]">Featured project</span>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[#8888aa] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {projects.map(p => (
          <div
            key={p.id}
            className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{p.title}</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.tech_stack?.slice(0, 4).map(t => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(p);
                  setSaveError('');
                }}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete?')) {
                    await supabase.from('pf_projects_lab').delete().eq('id', p.id);
                    load();
                  }
                }}
                className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveTab() {
  const [entries, setEntries]     = useState<ArchiveEntry[]>([]);
  const [editing, setEditing]     = useState<Partial<ArchiveEntry> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    const data = await getArchiveEntries();
    setEntries(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const blank = (): Partial<ArchiveEntry> => ({
    title: '',
    abstract_content: '',
    tags: [],
    date_completed: new Date().toISOString().split('T')[0],
  });

  const save = async () => {
    if (!isSupabaseConfigured) {
      setSaveError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to persist DB changes.');
      return;
    }
    if (!editing?.title) {
      setSaveError('Title required');
      return;
    }
    setSaving(true);
    setSaveError('');
    const result =
      editing.id && !editing.id.startsWith('arch-')
        ? await supabase.from('pf_projects_archive').update(editing).eq('id', editing.id)
        : await supabase.from('pf_projects_archive').insert({ ...editing, id: undefined });
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setEditing(blank());
          setSaveError('');
        }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black transition-all"
      >
        + New Archive Entry
      </button>
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#00d4ff]/20 rounded-lg p-6 space-y-4"
          >
            <Field
              label="Title *"
              value={editing.title ?? ''}
              onChange={v => setEditing(e => ({ ...e, title: v }))}
            />
            <Field
              label="Abstract"
              value={editing.abstract_content ?? ''}
              onChange={v => setEditing(e => ({ ...e, abstract_content: v }))}
              rows={4}
            />
            <Field
              label="Tags (comma separated)"
              value={(editing.tags ?? []).join(', ')}
              onChange={v =>
                setEditing(e => ({
                  ...e,
                  tags: v
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                }))
              }
            />
            <Field
              label="Date Completed"
              value={editing.date_completed ?? ''}
              onChange={v => setEditing(e => ({ ...e, date_completed: v }))}
              type="date"
            />
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[#8888aa] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {entries.map(e => (
          <div
            key={e.id}
            className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{e.title}</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {e.tags?.slice(0, 4).map(t => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] text-[#8888aa] rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(e);
                  setSaveError('');
                }}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete?')) {
                    await supabase.from('pf_projects_archive').delete().eq('id', e.id);
                    load();
                  }
                }}
                className="text-[10px] px-2 py-1 border border-[#1a1a2e] text-[#8888aa] hover:text-red-400 rounded"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsTab() {
  const router = useRouter();
  const [posts, setPosts]         = useState<InkwellPost[]>([]);
  const [editing, setEditing]     = useState<Partial<InkwellPost> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toggling, setToggling]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('pf_inkwell_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setPosts(data as InkwellPost[]);
        return;
      }
    }
    const fallback = await getInkwellPosts();
    setPosts(fallback);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const autoSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const blank = (): Partial<InkwellPost> => ({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    reading_time: 4,
    is_published: false,
  });

  const save = async () => {
    if (!isSupabaseConfigured) {
      setSaveError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to persist DB changes.');
      return;
    }
    if (!editing?.title) {
      setSaveError('Title required');
      return;
    }
    if (!editing?.slug) {
      setSaveError('Slug required');
      return;
    }
    setSaving(true);
    setSaveError('');
    const payload = { ...editing, updated_at: new Date().toISOString() };
    const result =
      editing.id && !editing.id.startsWith('post-')
        ? await supabase.from('pf_inkwell_posts').update(payload).eq('id', editing.id)
        : await supabase.from('pf_inkwell_posts').insert({ ...payload, id: undefined });
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null);
    await load();
    router.refresh();
  };

  const togglePublish = async (post: InkwellPost) => {
    if (!isSupabaseConfigured) return;
    setToggling(post.id);
    const next = !post.is_published;
    const { error } = await supabase
      .from('pf_inkwell_posts')
      .update({ is_published: next, updated_at: new Date().toISOString() })
      .eq('id', post.id);
    if (!error) {
      setPosts(ps => ps.map(p => (p.id === post.id ? { ...p, is_published: next } : p)));
      router.refresh();
    }
    setToggling(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setEditing(blank());
          setSaveError('');
        }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#a78bfa] text-[#a78bfa] hover:bg-[#a78bfa] hover:text-black transition-all"
      >
        + New Post
      </button>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#a78bfa]/20 rounded-lg p-6 space-y-4"
          >
            <Field
              label="Title *"
              value={editing.title ?? ''}
              onChange={v =>
                setEditing(e => ({
                  ...e,
                  title: v,
                  slug: e?.id ? e.slug ?? '' : autoSlug(v),
                }))
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Slug * (URL)"
                value={editing.slug ?? ''}
                onChange={v => setEditing(e => ({ ...e, slug: v }))}
              />
              <Field
                label="Reading Time (min)"
                value={String(editing.reading_time ?? 4)}
                type="number"
                onChange={v => setEditing(e => ({ ...e, reading_time: parseInt(v) || 4 }))}
              />
            </div>
            <Field
              label="Excerpt"
              value={editing.excerpt ?? ''}
              onChange={v => setEditing(e => ({ ...e, excerpt: v }))}
              rows={2}
            />
            <Field
              label="Content (MDX supported)"
              value={editing.content ?? ''}
              onChange={v => setEditing(e => ({ ...e, content: v }))}
              rows={12}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editing.is_published ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_published: e.target.checked }))}
                className="accent-[#a78bfa]"
              />
              <span className="text-xs text-[#8888aa]">Published</span>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[#8888aa] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {posts.map(p => (
          <div
            key={p.id}
            className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#e8e8f0] font-medium truncate block">{p.title}</span>
              <span className="text-[#4a4a6a] text-[10px] font-mono">/{p.slug}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublish(p)}
                disabled={toggling === p.id}
                className="text-[10px] font-mono px-2 py-1 rounded border"
                style={{
                  borderColor: p.is_published ? '#a78bfa' : '#2a2a3a',
                  color: p.is_published ? '#a78bfa' : '#8888aa',
                }}
              >
                {p.is_published ? 'Live' : 'Draft'}
              </button>
              <button
                onClick={() => {
                  setEditing(p);
                  setSaveError('');
                }}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapTab() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [editing, setEditing]     = useState<Partial<MapLocation> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    const data = await getMapLocations();
    setLocations(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!isSupabaseConfigured) {
      setSaveError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to persist DB changes.');
      return;
    }
    if (!editing?.location_name) {
      setSaveError('Name required');
      return;
    }
    setSaving(true);
    setSaveError('');
    const result =
      editing.id && !editing.id.startsWith('loc-')
        ? await supabase.from('pf_map_locations').update(editing).eq('id', editing.id)
        : await supabase.from('pf_map_locations').insert({ ...editing, id: undefined });
    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setEditing({
            location_name: '',
            latitude: 24.8949,
            longitude: 91.8687,
            story: '',
            is_wishlist: false,
          });
          setSaveError('');
        }}
        className="px-4 py-2 text-xs font-mono tracking-widest uppercase border border-[#34d399] text-[#34d399] hover:bg-[#34d399] hover:text-black transition-all"
      >
        + Add Location
      </button>
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111118] border border-[#34d399]/20 rounded-lg p-6 space-y-4"
          >
            <Field
              label="Location Name *"
              value={editing.location_name ?? ''}
              onChange={v => setEditing(e => ({ ...e, location_name: v }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Latitude"
                value={String(editing.latitude ?? '')}
                type="number"
                onChange={v => setEditing(e => ({ ...e, latitude: parseFloat(v) }))}
              />
              <Field
                label="Longitude"
                value={String(editing.longitude ?? '')}
                type="number"
                onChange={v => setEditing(e => ({ ...e, longitude: parseFloat(v) }))}
              />
            </div>
            <Field
              label="Story"
              value={editing.story ?? ''}
              onChange={v => setEditing(e => ({ ...e, story: v }))}
              rows={3}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editing.is_wishlist ?? false}
                onChange={e => setEditing(ed => ({ ...ed, is_wishlist: e.target.checked }))}
                className="accent-[#00d4ff]"
              />
              <span className="text-xs text-[#8888aa]">Wishlist (not yet visited)</span>
            </div>
            <div className="flex gap-3 items-center">
              <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[#8888aa] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: loc.is_wishlist ? '#00d4ff' : '#00ff88',
                  boxShadow: `0 0 4px ${loc.is_wishlist ? '#00d4ff' : '#00ff88'}`,
                }}
              />
              <div>
                <span className="text-sm text-[#e8e8f0] font-medium block">
                  {loc.location_name}
                </span>
                <span className="text-[#4a4a6a] text-[10px] font-mono">
                  {loc.latitude}, {loc.longitude}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(loc);
                  setSaveError('');
                }}
                className="text-[10px] px-2 py-1 border border-[#00d4ff]/40 text-[#00d4ff] rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryTab() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages]           = useState<GalleryImage[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [caption, setCaption]         = useState('');
  const [category, setCategory]       = useState('general');
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState('');

  const CATS = ['general', 'photography', 'generative', 'ui', 'events'];

  const load = useCallback(async () => {
    const data = await getGalleryImages();
    setImages(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const stageFile = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const commitUpload = async () => {
    if (!pendingFile) return;
    if (!isSupabaseConfigured) {
      setUploadError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to upload images.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target!.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(pendingFile);
      });
      const { error: dbErr } = await supabase.from('pf_gallery_images').insert({
        image_url: imageUrl,
        caption: caption.trim() || null,
        category,
      });
      if (dbErr) throw new Error(dbErr.message);
      setPendingFile(null);
      setPreviewUrl(null);
      setCaption('');
      await load();
      router.refresh();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111118] border border-[#fb923c]/20 rounded-lg p-6 space-y-4">
        <p className="font-mono text-xs text-[#fb923c] tracking-widest">{'// UPLOAD IMAGE'}</p>
        {!pendingFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2a2a3a] hover:border-[#fb923c]/50 rounded-xl p-8 text-center cursor-pointer"
          >
            <p className="text-sm text-[#8888aa]">Click to choose an image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && stageFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl!} alt="Preview" className="w-28 h-28 object-cover rounded border" />
            <Field label="Caption" value={caption} onChange={setCaption} />
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1 text-[10px] font-mono uppercase rounded border"
                  style={{
                    borderColor: category === c ? '#fb923c' : '#1a1a2e',
                    color: category === c ? '#fb923c' : '#8888aa',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={commitUpload}
              disabled={uploading}
              className="px-4 py-2 text-xs font-mono uppercase bg-[#fb923c] text-black rounded"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        )}
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map(img => (
          <div key={img.id} className="rounded-lg overflow-hidden border border-[#1a1a2e] bg-[#111118]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.image_url} alt={img.caption ?? ''} className="w-full aspect-square object-cover" />
            <div className="p-2 text-[11px] text-[#8888aa] truncate">{img.caption}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeTab() {
  const [text, setText]           = useState(DEFAULT_AI_SYSTEM_PROMPT);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('pf_ai_knowledge')
      .select('system_prompt_text')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.system_prompt_text) setText(data.system_prompt_text);
      });
  }, []);

  const save = async () => {
    if (!isSupabaseConfigured) {
      setSaveError('Connect NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in .env.local to save changes.');
      return;
    }
    setSaving(true);
    setSaveError('');
    const { error } = await supabase
      .from('pf_ai_knowledge')
      .update({ system_prompt_text: text, last_updated: new Date().toISOString() })
      .eq('id', 1);
    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-[#8888aa] text-xs leading-relaxed">
        This system prompt is fed to both Groq (Llama 3.3) and Google Gemini in `/api/ai-chat`.
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={22}
        className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-4 py-3 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 font-mono resize-none"
      />
      <SaveBtn onClick={save} saving={saving} saved={saved} error={saveError} />
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass]     = useState('');
  const [tab, setTab]       = useState<Tab>('projects');

  useEffect(() => {
    if (sessionStorage.getItem('pf_admin') === '1') setAuthed(true);
  }, []);

  const login = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      if (res.ok) {
        setAuthed(true);
        sessionStorage.setItem('pf_admin', '1');
      } else {
        alert('Invalid access code.');
      }
    } catch {
      alert('Authentication check failed.');
    }
  };

  if (!authed)
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
        <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-8 w-full max-w-sm">
          <p className="font-mono text-[#00ff88] text-xs tracking-widest mb-2 text-center">
            {'// CONTROL CENTER'}
          </p>
          <p className="text-[#8888aa] text-xs text-center mb-6">Restricted access.</p>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Access code..."
            className="w-full bg-[#0d0d12] border border-[#1a1a2e] rounded px-3 py-2.5 text-sm text-[#e8e8f0] outline-none focus:border-[#00ff88]/50 placeholder:text-[#4a4a6a] font-mono mb-4"
            autoFocus
          />
          <button
            onClick={login}
            className="w-full py-2.5 text-xs font-mono tracking-widest uppercase border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all"
          >
            Enter
          </button>
        </div>
      </div>
    );

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id: 'projects',  label: 'Projects', color: '#00ff88' },
    { id: 'archive',   label: 'Archive',  color: '#00d4ff' },
    { id: 'posts',     label: 'Inkwell',  color: '#a78bfa' },
    { id: 'map',       label: 'Map',      color: '#34d399' },
    { id: 'gallery',   label: 'Gallery',  color: '#fb923c' },
    { id: 'knowledge', label: 'AI Brain', color: '#ffb400' },
    { id: 'inbox',     label: 'Inbox',    color: '#f472b6' },
  ];

  return (
    <div
      className="min-h-screen px-4 pt-8 pb-20 max-w-4xl mx-auto"
      style={{ background: '#050505', color: '#e8e8f0' }}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[#00ff88] text-xs tracking-widest mb-1 font-mono">{'// CONTROL CENTER'}</p>
          <h1 className="text-2xl text-[#e8e8f0] font-bold font-display">Portfolio Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-mono px-2.5 py-1 rounded border"
            style={{
              borderColor: isSupabaseConfigured ? '#00ff8855' : '#ffb40055',
              color: isSupabaseConfigured ? '#00ff88' : '#ffb400',
              background: isSupabaseConfigured ? 'rgba(0,255,136,0.08)' : 'rgba(255,180,0,0.08)',
            }}
          >
            {isSupabaseConfigured ? '● Live Supabase Connected' : '○ Fallback Mode (Add Supabase Keys to Persist Edits)'}
          </span>
          <a
            href="/"
            className="text-xs px-3 py-1.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white rounded transition-colors font-mono"
          >
            ← Site
          </a>
        </div>
      </div>

      <div className="flex gap-0 mb-6 border-b border-[#1a1a2e] overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-colors border-b-2 -mb-px font-mono"
            style={
              tab === t.id
                ? { color: t.color, borderColor: t.color }
                : { color: '#8888aa', borderColor: 'transparent' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox'     && <InboxTab />}
      {tab === 'projects'  && <ProjectsTab />}
      {tab === 'archive'   && <ArchiveTab />}
      {tab === 'posts'     && <PostsTab />}
      {tab === 'map'       && <MapTab />}
      {tab === 'gallery'   && <GalleryTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
}