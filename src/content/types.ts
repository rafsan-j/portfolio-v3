export type ProjectCategory = 'android' | 'ai-systems' | 'pipeline' | 'graphics';

export type ProjectStatus = 'active' | 'shipped' | 'hackathon';

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  subtitle?: string;
  tagline: string;
  summary: string;
  year: string;
  role: string;
  context?: string;
  team?: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  problem: string;
  architecture: string;
  craftHighlights: string[];
  stack: string[];
  specs: ProjectSpec[];
  links: {
    live?: string;
    github?: string;
  };
}

export interface SupportingProject {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  stack: string[];
}

export type EssayTag = 'android' | 'systems' | 'architecture' | 'graphics';

export interface EssayBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'list' | 'code';
  content: string | string[];
  language?: string;
}

export interface Essay {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  publishedAt: string;
  readingTimeMinutes: number;
  tags: EssayTag[];
  blocks: EssayBlock[];
}

export type TimelineKind = 'education' | 'work' | 'award' | 'leadership';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  period: string;
  title: string;
  organization: string;
  location: string;
  districtId?: 'sylhet' | 'dinajpur' | 'rajshahi';
  summary: string;
}

export type AnchorRole = 'university' | 'hometown' | 'alma-mater';

export type AnchorAccentVar =
  | '--anchor-sylhet'
  | '--anchor-dinajpur'
  | '--anchor-rajshahi';

export type DistrictDivision =
  | 'Rangpur Division'
  | 'Rajshahi Division'
  | 'Khulna Division'
  | 'Barishal Division'
  | 'Chattogram Division'
  | 'Sylhet Division'
  | 'Mymensingh Division'
  | 'Dhaka Division';

export interface DistrictPath {
  id: string;
  name: string;
  division: DistrictDivision;
  d: string;
  centroid?: { x: number; y: number };
  anchor?: {
    role: AnchorRole;
    label: string;
    note: string;
    accentVar: AnchorAccentVar;
  };
}

export interface Profile {
  readonly name: string;
  readonly shortTitle: string;
  readonly location: string;
  readonly hometown: string;
  readonly timezone: string;
  readonly email: string;
  readonly links: {
    readonly github: string;
    readonly linkedin: string;
    readonly email: string;
  };
  readonly home: {
    readonly eyebrow: string;
    readonly headline: string;
    readonly bio: string;
    readonly primaryCta: {
      readonly label: string;
      readonly href: string;
    };
    readonly secondaryCta: {
      readonly label: string;
      readonly href: string;
    };
    readonly studioCallout: {
      readonly headline: string;
      readonly body: string;
      readonly ctaLabel: string;
      readonly caption: string;
    };
  };
  readonly about: {
    readonly intro: string;
  };
  readonly contact: {
    readonly intro: string;
    readonly availability: string;
  };
}
