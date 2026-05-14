import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { getAllCaseStudies } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Representative matters and client outcomes.",
};

export default async function CaseStudiesIndex() {
  const items = await getAllCaseStudies();
  return (
    <>
      <PageIntro
        eyebrow="Client work"
        title="Case studies"
        description="Representative matters illustrating the firm's experience and approach."
      />
      <Container narrow>
        <div style={{ paddingBlock: "var(--space-16)" }}>
          {items.length === 0 ? (
            <p>
              Case studies are coming soon. In the meantime, please{" "}
              <Link href="/contact">get in touch</Link> to discuss the firm's
              representative experience.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-6)" }}>
              {items.map((item) => (
                <li key={item.slug}>
                  <Link href={`/case-studies/${item.slug}`}>
                    <strong>{item.title}</strong>
                  </Link>
                  <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                    {item.summary}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}
