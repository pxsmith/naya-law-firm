import type { Metadata } from "next";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Attorney advertising and legal disclaimers for Naya Law Firm.",
};

export default function DisclaimerPage() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Disclaimer"
        description="Please read carefully before using this website."
      />
      <Container narrow>
        <article className="prose" style={{ paddingBlock: "var(--space-16)" }}>
          <h2>Attorney Advertising</h2>
          <p>{siteSettings.disclaimers.attorneyAdvertising}</p>

          <h2>No Attorney-Client Relationship</h2>
          <p>{siteSettings.disclaimers.legalAdvice}</p>

          <h2>No Legal Advice</h2>
          <p>
            Materials on this website are intended for general information only.
            They are not a substitute for legal advice and should not be relied
            upon as such. Laws and regulations change over time; the
            information on this site may not reflect the most current legal
            developments.
          </p>

          <h2>Prior Results</h2>
          <p>
            Prior results described on this website do not guarantee a similar
            outcome. Each matter is unique, and the firm makes no warranty or
            prediction about the outcome of any future matter.
          </p>

          <h2>Jurisdiction</h2>
          <p>
            The firm's attorneys are licensed to practice law in the
            jurisdictions identified in their individual biographies. The firm
            does not seek to represent anyone in any jurisdiction where this
            website does not comply with applicable laws and rules of
            professional conduct.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            This website may contain links to third-party websites. Such links
            are provided for convenience only and do not constitute an
            endorsement of the linked website.
          </p>
        </article>
      </Container>
    </>
  );
}
