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
        description="Built for attorneys who are done with the billable-hour treadmill and want to work with better tools and more aligned economics."
      />
      <section className={styles.workWithUs}>
        <Container>
          <h2 className={styles.workWithUsTitle}>
            Work With Us &mdash; <em className={styles.workWithUsAccent}>For Lawyers</em>
          </h2>
          <ol className={styles.workWithUsList}>
            <li className={styles.workWithUsItem}>
              <span className={styles.workWithUsNum} aria-hidden="true">01</span>
              <p>Better quality of life. Never track another billable hour again.</p>
            </li>
            <li className={styles.workWithUsItem}>
              <span className={styles.workWithUsNum} aria-hidden="true">02</span>
              <p>Take home a larger percentage of fees generated.</p>
            </li>
            <li className={styles.workWithUsItem}>
              <span className={styles.workWithUsNum} aria-hidden="true">03</span>
              <p>Access to the best technology. We are obsessed with innovation and efficiency.</p>
            </li>
            <li className={styles.workWithUsItem}>
              <span className={styles.workWithUsNum} aria-hidden="true">04</span>
              <p>Bring in more business with a cutting edge business model.</p>
            </li>
            <li className={styles.workWithUsItem}>
              <span className={styles.workWithUsNum} aria-hidden="true">05</span>
              <p>Flexible hours and remote work policy. We have big law talent with a start-up culture.</p>
            </li>
          </ol>
        </Container>
      </section>
      <Container narrow>
        <div className={styles.body}>
          <p>
            Naya's model is intended to appeal to commercial real estate lawyers
            who are tired of the billable-hour structure and want to work with
            better tools and more aligned economics.
          </p>
          <p>
            Founder Matthew Basile describes Naya's platform as an{" "}
            <strong>operating system for closing commercial mortgage loans</strong>
            , with the vision that lawyers could plug into that system rather
            than trying to reform a traditional firm from the inside.
          </p>

          <h2>What that looks like in practice</h2>
          <ul className={styles.bullets}>
            <li>
              <strong>Fixed-fee economics.</strong> Compensation aligned with
              closing deals, not logging hours.
            </li>
            <li>
              <strong>Proprietary closing platform.</strong> Document automation
              and workflow tools built specifically for commercial mortgage
              transactions.
            </li>
            <li>
              <strong>Big Law-caliber work.</strong> Institutional lender
              clients, complex deals — without the Big Law operating model.
            </li>
            <li>
              <strong>Focused practice.</strong> Commercial real estate and
              corporate lending transactions, not everything-to-everyone.
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
