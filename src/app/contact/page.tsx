import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Schedule a call with Naya Law. Pick a time that works for you and we'll walk through fixed-fee commercial real estate closings.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Book a call."
        description="Grab a time that works for you. We'll walk through your deals, our fixed-fee pricing, and how Naya can close faster for your team."
      />
      <Container>
        <div className={styles.booking}>
          <CalendlyEmbed />
        </div>
      </Container>
    </>
  );
}
