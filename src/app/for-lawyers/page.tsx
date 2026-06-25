import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import styles from "./for-lawyers.module.css";

export const metadata: Metadata = {
  title: "For Lawyers",
  description:
    "A better platform for commercial real estate lawyers. Fixed fees, software-enabled workflows, no billable-hour treadmill.",
};

export default function ForLawyersPage() {
  return (
    <>
      <PageIntro
        eyebrow="For lawyers"
        title="A better platform for commercial real estate lawyers."
        description="Built for attorneys who are done with the billable-hour model in Big Law and want to be a part of transforming the business of law in the AI era."
      />
      <Container narrow>
        <div className={styles.body}>
          <p>
            Naya Law&rsquo;s model appeals to commercial real estate lawyers who are
            tired of the billable-hour structure and want to work with cutting
            edge AI and tech tools and help to create the law firm of the
            future.
          </p>
          <p>
            Our team is comprised of former big law partners and associates that
            want to redefine the way law is practiced. We adapt efficiently and
            approach process improvement like a high growth startup.
          </p>

          <h2>What that looks like in practice</h2>
          <ul className={styles.bullets}>
            <li>
              <strong>Fixed-fee economics.</strong> Compensation aligned with
              closing deals and revenue.
            </li>
            <li>
              <strong>Proprietary closing platform.</strong> Access to the best
              technology. We are obsessed with innovation and efficiency.
            </li>
            <li>
              <strong>Big Law-caliber work.</strong> Institutional lender
              clients, complex deals without the Big Law operating model.
            </li>
            <li>
              <strong>Focused practice.</strong> Commercial real estate and
              corporate lending transactions, not everything-to-everyone.
            </li>
            <li>
              <strong>Better quality of life.</strong> Never bill another hour
              again.
            </li>
            <li>
              <strong>Develop business.</strong> New business model helps
              attract clients and you keep a bigger percentage of what you bring
              in.
            </li>
          </ul>

          <h2>Who we're looking for</h2>
          <p>
            Experienced commercial real estate attorneys — particularly those
            with institutional lender or Big Law transactional backgrounds —
            who want to build something rather than maintain the status quo.
          </p>

          <div className={styles.cta}>
            <Link href="/contact" className={styles.ctaButton}>
              Talk to Us About Joining
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
