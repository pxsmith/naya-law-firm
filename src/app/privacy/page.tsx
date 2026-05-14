import type { Metadata } from "next";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Naya Law Firm collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we handle information collected through this website."
      />
      <Container narrow>
        <article className="prose" style={{ paddingBlock: "var(--space-16)" }}>
          <p>
            <strong>Last updated:</strong> Replace with effective date.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you voluntarily provide when you contact us
            through this website — including your name, email address, phone
            number, and the contents of your message. We also collect basic
            usage data (e.g., pages visited) through standard web analytics.
          </p>

          <h2>How We Use Information</h2>
          <p>
            We use the information you provide to respond to your inquiry and,
            where appropriate, to provide legal services. We do not sell your
            personal information.
          </p>

          <h2>Form Submissions</h2>
          <p>
            Contact form submissions are processed through a third-party
            service (Formspree) that delivers them to our inbox. Please review
            Formspree's privacy policy for additional information.
          </p>

          <h2>Cookies</h2>
          <p>
            This website may use minimal cookies for analytics. You can
            configure your browser to refuse cookies; doing so will not affect
            functionality.
          </p>

          <h2>Confidentiality</h2>
          <p>
            Information submitted through this website is not confidential and
            is not protected by attorney-client privilege. Please do not send
            confidential information until an attorney-client relationship has
            been established in writing.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy should be directed to{" "}
            <a href={`mailto:${siteSettings.contact.email}`}>
              {siteSettings.contact.email}
            </a>
            .
          </p>
        </article>
      </Container>
    </>
  );
}
