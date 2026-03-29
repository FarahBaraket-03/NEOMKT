import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'http://localhost:3000';
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/brands`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/auth/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/register`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
