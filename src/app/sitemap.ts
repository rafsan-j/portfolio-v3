import type { MetadataRoute } from 'next';
import { FLAGSHIP_PROJECTS } from '@/content/projects';
import { ESSAYS } from '@/content/writing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rafsanjani.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/work`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/writing`,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/studio`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = FLAGSHIP_PROJECTS.map(
    (project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      changeFrequency: 'monthly',
      priority: 0.85,
    })
  );

  const essayRoutes: MetadataRoute.Sitemap = ESSAYS.map((essay) => ({
    url: `${SITE_URL}/writing/${essay.slug}`,
    lastModified: new Date(essay.publishedAt),
    changeFrequency: 'yearly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...essayRoutes];
}
