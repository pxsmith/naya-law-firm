import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ArticleCard } from "@/components/ArticleCard";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Commentary, legal updates, and practical guidance from Naya Law Firm.",
};

export default async function InsightsIndex() {
  const posts = await getAllPosts();
  return (
    <>
      <PageIntro
        eyebrow="Insights"
        title="Articles & legal updates"
        description="Commentary on developments in our practice areas and practical guidance for clients."
      />
      <Container narrow>
        <div style={{ paddingBlock: "var(--space-12)" }}>
          {posts.length === 0 && <p>No posts yet — check back soon.</p>}
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </>
  );
}
