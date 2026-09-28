import type { MetadataRoute } from 'next';
import { allTools } from '@/utils/toolsData';

const BASE_URL = 'https://one-toys.com';

// The project uses trailingSlash: true, so every URL in the sitemap must carry a
// trailing slash to match the canonical tag served on the page.
const withSlash = (path: string) => `${BASE_URL}${path.endsWith('/') ? path : `${path}/`}`;

// Category landing pages
const CATEGORY_PATHS = ['/code', '/text', '/info', '/datetime'];

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: withSlash('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...CATEGORY_PATHS.map((path) => ({
      url: withSlash(path),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...allTools.map((tool) => ({
      url: withSlash(tool.path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
