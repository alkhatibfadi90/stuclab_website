import { getAllTags, getPostsByTag } from '../../../../../content/postsManifest';
import InsightsByTag from '../../../../../components/insights/InsightsByTag';

// Every tag that appears on a post is statically generated.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export function generateMetadata({ params }) {
  const { tag } = params;
  return {
    title: `${tag} — Insights`,
    description: `Structural engineering insights and writing tagged “${tag}”.`,
    alternates: { canonical: `/insights/tag/${tag}` },
  };
}

export default function InsightsByTagPage({ params }) {
  const matches = getPostsByTag(params.tag);
  return <InsightsByTag tag={params.tag} matches={matches} />;
}
