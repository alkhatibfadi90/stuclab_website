import { SITE_URL, staticRoutes } from '../content/seoConfig';
import { posts } from '../content/postsManifest';

export default function sitemap() {
  const staticUrls = Object.keys(staticRoutes).map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1.0 : 0.7,
  }));

  const postUrls = posts.map((p) => ({
    url: `${SITE_URL}/insights/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const tags = [...new Set(posts.flatMap((p) => p.tags || []))];
  const tagUrls = tags.map((t) => ({
    url: `${SITE_URL}/insights/tag/${t}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  return [...staticUrls, ...postUrls, ...tagUrls];
}
