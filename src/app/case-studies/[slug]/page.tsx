import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getCaseStudy(slug);
    return {
      title: frontmatter.title,
      description: frontmatter.summary,
    };
  } catch {
    return {};
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  let data;
  try {
    data = await getCaseStudy(slug);
  } catch {
    notFound();
  }
  const { frontmatter, Content } = data;
  return (
    <>
      <PageIntro
        eyebrow="Case study"
        title={frontmatter.title}
        description={frontmatter.summary}
      />
      <Container narrow>
        <article className="prose" style={{ paddingBlock: "var(--space-16)" }}>
          <Content />
          <p style={{ marginTop: "var(--space-12)" }}>
            <Link href="/case-studies">&larr; All case studies</Link>
          </p>
        </article>
      </Container>
    </>
  );
}
