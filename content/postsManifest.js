// Build-time post manifest.
//
// Markdown files in content/posts/*.md are the single source of truth.
// Each file carries its metadata in YAML frontmatter; this module reads the
// directory with fs + gray-matter and exposes the same API the components
// already relied on (`posts`, `getPostsByTag`, `getRelatedPosts`) plus a few
// helpers for the App Router pages.
//
// This runs only on the server / at build time.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const DEFAULT_OG_IMAGE = '/og-image.svg';

function toIsoDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === 'string' ? value : '';
}

function readPost(fileName) {
  const slugFromFile = fileName.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8');
  const { data, content } = matter(raw);

  const title = data.title || slugFromFile;
  const excerpt = data.excerpt || '';

  return {
    slug: data.slug || slugFromFile,
    title,
    date: toIsoDate(data.date),
    excerpt,
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: data.readingTime || '',
    // SEO fields fall back to their display equivalents.
    seoTitle: data.seoTitle || title,
    seoDescription: data.seoDescription || excerpt,
    ogImage: data.ogImage || DEFAULT_OG_IMAGE,
    // Markdown body, frontmatter stripped.
    content,
  };
}

function loadPosts() {
  let files = [];
  try {
    files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'));
  } catch {
    return [];
  }
  const all = files.map(readPost);
  // Newest first.
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return all;
}

// Post metadata + body, newest first.
export const posts = loadPosts();

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByTag(tag) {
  if (!tag) return [];
  const needle = tag.toLowerCase();
  return posts.filter((p) =>
    (p.tags || []).some((t) => t.toLowerCase() === needle),
  );
}

export function getRelatedPosts(slug, max = 3) {
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  const others = posts.filter((p) => p.slug !== slug);
  const currentTags = new Set(current.tags || []);
  const scored = others.map((p) => ({
    post: p,
    score: (p.tags || []).reduce(
      (acc, t) => (currentTags.has(t) ? acc + 1 : acc),
      0,
    ),
    time: new Date(p.date).getTime() || 0,
  }));
  scored.sort((a, b) => b.score - a.score || b.time - a.time);
  return scored.slice(0, max).map((s) => s.post);
}

export function getAllTags() {
  return [...new Set(posts.flatMap((p) => p.tags || []))];
}
