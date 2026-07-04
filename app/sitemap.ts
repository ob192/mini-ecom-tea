import type { MetadataRoute } from 'next';
import { products } from '@/lib/products';
import { siteUrl } from '@/lib/format';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/brewing`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
