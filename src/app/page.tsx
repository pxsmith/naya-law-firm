import Link from "next/link";
import { Container } from "@/components/Container";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <Container>
          <p className={styles.eyebrow}>Naya Law Group</p>
          <h1 className={styles.heroTitle}>
            Save 50% on commercial
            <br />
            real estate closings.
          </h1>
          <p className={styles.lede}>
            Naya Law Group is an AI-native law firm for institutional lenders.
            We combine Big Law experience, a proprietary closing platform, and
            fixed-fee pricing so you can quote legal costs up front, close more
            loans with the same team, and stop paying for inefficiency.
          </p>
          <p className={styles.proof}>
            <span className={styles.proofDot} aria-hidden="true" />
            100+ commercial real estate loans closed using this model.
          </p>
          <div className={styles.ctas}>
            <Link href="/#contact" className={styles.primaryCta}>
              Book a Call
            </Link>
            <Link href="#approach" className={styles.secondaryCta}>
              How Our Closings Work &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* ───────────── Problem ───────────── */}
      <section className={styles.section}>
        <Container narrow>
          <p className={styles.eyebrow}>The problem</p>
          <h2 className={styles.sectionTitle}>
            The longer they take, the more you pay.
          </h2>
          <div className={styles.prose}>
            <p>
              Traditional law firms still run on the billable hour, which means
              delay, manual work, and extra timekeepers all turn into a bigger
              invoice for the client.
            </p>
            <p>
              That model also gives firms weak incentives to automate, because
              efficiency can reduce billable time.
            </p>
            <p>
              For institutional lenders, that creates friction where there
              should be certainty: fees are hard to quote up front, hard to
              explain to borrowers, and often higher than expected by the time
              the deal closes.
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────── What Naya Does ───────────── */}
      <section className={`${styles.section} ${styles.alt}`}>
        <Container>
          <p className={styles.eyebrow}>What we do</p>
          <h2 className={styles.sectionTitle}>
            Commercial lending closings, rebuilt for the AI era.
          </h2>
          <div className={`${styles.prose} ${styles.proseNarrow}`}>
            <p>
              Naya Law Group focuses narrowly on commercial real estate and
              corporate lending transactions rather than trying to be everything
              to everyone.
            </p>
            <p>
              The firm runs its legal work on Naya's own software platform,
              built specifically for commercial mortgage loan transactions. The
              legal workflow, software workflow, and client experience are
              designed together from day one.
            </p>
          </div>
          <ul className={styles.differentiators}>
            <li>
              <h3>Fixed-fee pricing</h3>
              <p>Quoted up front, before the work begins.</p>
            </li>
            <li>
              <h3>Big Law experience</h3>
              <p>Nearly two decades of complex CRE transactions.</p>
            </li>
            <li>
              <h3>Proprietary platform</h3>
              <p>Built around commercial mortgage closings.</p>
            </li>
            <li>
              <h3>100+ loans closed</h3>
              <p>This model is already proven in production.</p>
            </li>
          </ul>
        </Container>
      </section>

      {/* ───────────── Approach ───────────── */}
      <section id="approach" className={styles.section}>
        <Container narrow>
          <p className={styles.eyebrow}>Approach</p>
          <h2 className={styles.sectionTitle}>
            Built to align with the client, not the clock.
          </h2>
          <div className={styles.prose}>
            <p>
              Before the work begins, Naya gives clients a defined fee structure
              instead of an open-ended hourly meter.
            </p>
            <p>
              That helps lenders quote legal fees to borrowers early, manage
              expectations, and compete more effectively on total deal
              economics.
            </p>
            <p>
              Because Naya does not bill by the hour, its incentive is
              straightforward: close the deal accurately, efficiently, and
              without unnecessary friction.
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────── Experience / About ───────────── */}
      <section id="about" className={`${styles.section} ${styles.alt}`}>
        <Container>
          <div className={styles.split}>
            <div>
              <p className={styles.eyebrow}>About</p>
              <h2 className={styles.sectionTitle}>
                Big Law judgment. Different economics.
              </h2>
            </div>
            <div className={styles.prose}>
              <p>
                Matthew Basile spent nearly two decades practicing commercial
                real estate law and served as a partner at a large Am Law 150
                firm before building Naya.
              </p>
              <p>
                That background gives Naya experience with complex transactions,
                but the delivery model is different: fixed fees, software-enabled
                workflows, and no billable-hour treadmill.
              </p>
              <p>
                The result is the quality lenders expect from a major firm with
                a pricing model built for how legal work should operate in the
                AI era.
              </p>
              <p>
                <Link href="/about">More about the firm &rarr;</Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── Pricing ───────────── */}
      <section id="pricing" className={styles.section}>
        <Container>
          <p className={styles.eyebrow}>Pricing</p>
          <h2 className={styles.sectionTitle}>
            Know the legal fee before the work starts.
          </h2>

          <div className={styles.priceCompare}>
            <div className={styles.priceCard}>
              <p className={styles.priceLabel}>Naya Law Group</p>
              <p className={styles.priceAmount}>$5K–$15K</p>
              <p className={styles.priceNote}>typical sub-$10M loan closing</p>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardMuted}`}>
              <p className={styles.priceLabel}>Big Law equivalent</p>
              <p className={styles.priceAmount}>$20K–$30K</p>
              <p className={styles.priceNote}>for similar matters</p>
            </div>
          </div>

          <div className={`${styles.prose} ${styles.proseNarrow}`}>
            <p>
              For context: large-firm associate rates often run $650–$700 per
              hour, junior partners $1,000+, and top partners $2,000–$3,000.
              Naya's pitch is simple: price the matter based on what it should
              cost, then stand behind that number.
            </p>
          </div>

          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Traditional Big Law</th>
                <th>Naya Law Group</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bills by the hour.</td>
                <td>Fixed fee quoted up front.</td>
              </tr>
              <tr>
                <td>Fee is known after the work.</td>
                <td>Fee structure is known before the work starts.</td>
              </tr>
              <tr>
                <td>Technology is layered onto old workflows.</td>
                <td>Technology is built into the operating model.</td>
              </tr>
              <tr>
                <td>Incentive is to spend more time.</td>
                <td>Incentive is to close efficiently.</td>
              </tr>
            </tbody>
          </table>
        </Container>
      </section>

      {/* ───────────── Platform ───────────── */}
      <section className={`${styles.section} ${styles.alt}`}>
        <Container narrow>
          <p className={styles.eyebrow}>Platform</p>
          <h2 className={styles.sectionTitle}>
            A law firm running on its own operating system.
          </h2>
          <div className={styles.prose}>
            <p>
              Naya's software is customized for commercial mortgage loan
              transactions, including document automation and workflow support
              tailored to lender requirements.
            </p>
            <p>
              The Naya Closing Services model combines cutting-edge technology
              with an experienced deal team to improve cost efficiency and
              accelerate commercial real estate finance closings.
            </p>
            <p>
              This is the core differentiator: Naya is not just using
              third-party tools — it is building and controlling the platform
              behind the work.
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────── Who It's For ───────────── */}
      <section className={styles.section}>
        <Container>
          <p className={styles.eyebrow}>Who it's for</p>
          <h2 className={styles.sectionTitle}>
            Built for institutional lenders.
          </h2>
          <ul className={styles.audienceList}>
            <li>Commercial mortgage lenders</li>
            <li>Life insurance company lenders</li>
            <li>Institutional lending teams</li>
            <li>High-volume CRE finance participants</li>
            <li>Other firms wanting fixed-fee capability</li>
          </ul>
          <div className={`${styles.prose} ${styles.proseNarrow}`}>
            <p>
              If your team needs predictable legal fees, repeatable workflows,
              and a partner focused specifically on lending transactions, Naya
              fits that profile.
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────── For Lawyers ───────────── */}
      <section id="for-lawyers" className={`${styles.section} ${styles.alt}`}>
        <Container narrow>
          <p className={styles.eyebrow}>For lawyers</p>
          <h2 className={styles.sectionTitle}>
            Tired of the billable-hour treadmill?
          </h2>
          <div className={styles.prose}>
            <p>
              Naya is also built for commercial real estate lawyers who want
              better tools and more aligned economics — an operating system for
              closing commercial mortgage loans that you can plug into instead
              of trying to reform a traditional firm from the inside.
            </p>
          </div>
          <p>
            <Link href="/for-lawyers" className={styles.secondaryCta}>
              Learn more about joining &rarr;
            </Link>
          </p>
        </Container>
      </section>

      {/* ───────────── Final CTA / Contact ───────────── */}
      <section id="contact" className={styles.finalCta}>
        <Container narrow>
          <h2 className={styles.sectionTitle}>
            Ready to close with more certainty?
          </h2>
          <p className={styles.lede}>
            If your team wants fixed-fee commercial real estate closings,
            predictable pricing, and a technology-first legal partner, Naya Law
            Group was built for that.
          </p>
          <div className={styles.ctas}>
            <Link href="/contact" className={styles.primaryCta}>
              Book a Call
            </Link>
            <Link href="/contact" className={styles.secondaryCta}>
              Contact Naya Law Group
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
