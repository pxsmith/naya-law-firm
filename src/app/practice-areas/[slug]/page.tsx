import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import {
  getPracticeArea,
  getPracticeAreaSlugs,
  getAllAttorneys,
} from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPracticeAreaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getPracticeArea(slug);
    return {
      title: frontmatter.title,
      description: frontmatter.summary,
    };
  } catch {
    return {};
  }
}

export default async function PracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  let data;
  try {
    data = await getPracticeArea(slug);
  } catch {
    notFound();
  }
  const { frontmatter, Content } = data;

  const allAttorneys = await getAllAttorneys();
  const practitioners = allAttorneys.filter((a) =>
    a.practiceAreas.includes(slug),
  );

  return (
    <>
      <PageIntro
        eyebrow="Practice Area"
        title={frontmatter.title}
        description={frontmatter.summary}
      />
      <Container narrow>
        <article className="prose" style={{ paddingBlock: "var(--space-16)" }}>
          <Content />

          {practitioners.length > 0 && (
            <>
              <h2>Attorneys in this practice</h2>
              <ul>
                {practitioners.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/attorneys/${p.slug}`}>
                      {p.name}, {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p style={{ marginTop: "var(--space-12)" }}>
            <Link href="/contact">Discuss a matter &rarr;</Link>
          </p>
        </article>
      </Container>
    </>
  );
}
