// Post metadata, newest first.
// Markdown bodies live in src/content/posts/{slug}.md
export const posts = [
  {
    slug: 'cracked-section-properties-etabs',
    title: 'Cracked Section Properties in ETABS — What Most Engineers Get Wrong',
    date: '2026-05-22',
    excerpt:
      'Applying 0.7 to all columns and 0.35 to all walls and moving on is the most common stiffness-modifier mistake I see — and the one with the biggest downstream consequences.',
    tags: ['etabs', 'methodology', 'high-rise'],
    readingTime: '8 min read',
  },
  {
    slug: 'lateral-stability-workflow',
    title: 'Setting Up a Lateral Stability Workflow That Actually Holds Up',
    date: '2026-05-15',
    excerpt:
      'Most lateral systems fail in review for the same reason — the workflow skipped straight to modelling. Here\'s the order that catches problems before they become rework.',
    tags: ['lateral', 'methodology', 'high-rise'],
    readingTime: '7 min read',
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
