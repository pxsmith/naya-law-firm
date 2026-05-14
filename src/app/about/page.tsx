import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "About",
  description:
    "Naya Law Firm — the firm's story, values, and approach to client service.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="A firm built around client outcomes."
        description="Replace this placeholder with the firm's positioning statement — who you serve, what makes the practice distinctive, and how you work."
      />
      <Container narrow>
        <article className="prose" style={{ paddingBlock: "var(--space-16)" }}>
          <h2>Our story</h2>
          <p>
            Replace this section with the firm's history — when it was founded,
            the experience the partners bring, and the philosophy that shapes
            the practice today.
          </p>

          <h2>How we work</h2>
          <p>
            Describe the firm's approach to engagements — staffing, fee
            structures, communication cadence, and how matters are managed end
            to end.
          </p>

          <h2>Values</h2>
          <p>
            Outline the principles that guide the firm — substantive
            excellence, responsiveness, and the standards held in every
            engagement.
          </p>
        </article>
      </Container>
    </>
  );
}
