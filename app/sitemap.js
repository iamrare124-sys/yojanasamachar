import { getPosts } from '@/lib/supabase';

const siteConfig = require('@/config/site.config');

export default async function sitemap() {
  const baseUrl = siteConfig.siteUrl;

  let posts = [];
  try {
    posts = await getPosts({ limit: 100 });
  } catch {}

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages = siteConfig.categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const postPages = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...postPages];
}
