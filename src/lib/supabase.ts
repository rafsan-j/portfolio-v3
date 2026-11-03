import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  FALLBACK_PROJECTS,
  FALLBACK_ARCHIVE,
  FALLBACK_POSTS,
  FALLBACK_MAP_LOCATIONS,
  FALLBACK_GALLERY_IMAGES,
} from './fallbackData';

export type Project = {
  id:               string;
  title:            string;
  description:      string;
  tech_stack:       string[];
  github_url?:      string;
  live_url?:        string;
  cover_image_url?: string;
  case_study?:      string;
  is_featured?:     boolean;
  sort_order?:      number;
  created_at:       string;
};

export type ArchiveEntry = {
  id:               string;
  title:            string;
  abstract_content: string;
  tags?:            string[];
  pdf_url?:         string;
  date_completed:   string;
};

export type InkwellPost = {
  id:               string;
  title:            string;
  slug:             string;
  content:          string;
  cover_image_url?: string;
  excerpt?:         string;
  reading_time?:    number;
  is_published:     boolean;
  created_at:       string;
  updated_at:       string;
};

export type GalleryImage = {
  id:          string;
  image_url:   string;
  caption?:    string;
  category?:   string;
  uploaded_at: string;
};

export type MapLocation = {
  id:            string;
  location_name: string;
  latitude:      number;
  longitude:     number;
  visited_date?: string;
  story?:        string;
  photo_url?:    string;
  is_wishlist?:  boolean;
  created_at?:   string;
};

export type InboxMessage = {
  id:           string;
  sender_name:  string;
  sender_email: string;
  message:      string;
  is_read:      boolean;
  created_at:   string;
};

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  Boolean(rawUrl && rawKey) &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project-id.supabase.co') &&
  rawKey !== 'your_anon_key_here';

// Safe client initialization that NEVER crashes `next build` when env vars are unset
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

export async function getLabProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured) return FALLBACK_PROJECTS;
  try {
    const { data, error } = await supabase
      .from('pf_projects_lab')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_PROJECTS;
    return data as Project[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getArchiveEntries(): Promise<ArchiveEntry[]> {
  if (!isSupabaseConfigured) return FALLBACK_ARCHIVE;
  try {
    const { data, error } = await supabase
      .from('pf_projects_archive')
      .select('*')
      .order('date_completed', { ascending: false });
    if (error || !data || data.length === 0) return FALLBACK_ARCHIVE;
    return data as ArchiveEntry[];
  } catch {
    return FALLBACK_ARCHIVE;
  }
}

export async function getInkwellPosts(): Promise<InkwellPost[]> {
  if (!isSupabaseConfigured) return FALLBACK_POSTS;
  try {
    const { data, error } = await supabase
      .from('pf_inkwell_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return FALLBACK_POSTS;
    return data as InkwellPost[];
  } catch {
    return FALLBACK_POSTS;
  }
}

export async function getInkwellPostBySlug(slug: string): Promise<InkwellPost | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('pf_inkwell_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (!error && data) return data as InkwellPost;
    } catch {
      // fall through to fallback posts
    }
  }
  return FALLBACK_POSTS.find(p => p.slug === slug) ?? null;
}

export async function getMapLocations(): Promise<MapLocation[]> {
  if (!isSupabaseConfigured) return FALLBACK_MAP_LOCATIONS;
  try {
    const { data, error } = await supabase.from('pf_map_locations').select('*');
    if (error || !data || data.length === 0) return FALLBACK_MAP_LOCATIONS;
    return data as MapLocation[];
  } catch {
    return FALLBACK_MAP_LOCATIONS;
  }
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured) return FALLBACK_GALLERY_IMAGES;
  try {
    const { data, error } = await supabase
      .from('pf_gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error || !data || data.length === 0) return FALLBACK_GALLERY_IMAGES;
    return data as GalleryImage[];
  } catch {
    return FALLBACK_GALLERY_IMAGES;
  }
}
