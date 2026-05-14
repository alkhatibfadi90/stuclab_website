// Post metadata, newest first.
// Markdown bodies live in src/content/posts/{slug}.md
export const posts = [
  {
    slug: 'hello-struclab',
    title: 'Hello, StrucLab Insights',
    date: '2026-05-14',
    excerpt:
      'A short note on why we are launching Insights — practical engineering writing on concrete, lateral systems, and automation.',
    tags: ['announcement', 'automation'],
    readingTime: '3 min read',
  },
];

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
