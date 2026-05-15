import { notFound } from 'next/navigation';
import { posts, getPostBySlug, getRelatedPosts } from '../../../../content/postsManifest';
import { SITE_URL } from '../../../../content/seoConfig';
import InsightPost from '../../../../components/insights/InsightPost';

// Only the slugs known at build time are valid — every post is statically
// generated, anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `/insights/${post.slug}`;
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.seoTitle,
      description: post.seoDescription,
      url,
      publishedTime: post.date,
      authors: ['Fadi Al-Khatib'],
      images: [post.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle,
      description: post.seoDescription,
      images: [post.ogImage],
    },
  };
}

export default function InsightPostPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  // Match the original rule: only show "Related posts" when at least two
  // other posts exist in total.
  const related = posts.length - 1 >= 2 ? getRelatedPosts(post.slug, 3) : [];

  // BlogPosting JSON-LD — Next 14 does not emit JSON-LD via the metadata API,
  // so it is rendered as a script element instead.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Fadi Al-Khatib' },
    publisher: { '@type': 'Organization', name: 'StrucLab' },
    url: `${SITE_URL}/insights/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
    image: `${SITE_URL}${post.ogImage}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InsightPost post={post} related={related} />
    </>
  );
}
