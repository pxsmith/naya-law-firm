import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { PracticeAreaCard } from "@/components/PracticeAreaCard";
import { AttorneyCard } from "@/components/AttorneyCard";
import { ArticleCard } from "@/components/ArticleCard";
import {
  getAllPracticeAreas,
  getAllAttorneys,
  getAllPosts,
} from "@/lib/content";
import styles from "./page.module.css";

export default async function HomePage() {
  const [practiceAreas, attorneys, posts] = await Promise.all([
    getAllPracticeAreas(),
    getAllAttorneys(),
    getAllPosts(),
  ]);

  const featuredAreas = practiceAreas.filter((p) => p.featured).slice(0, 3);
  const displayAreas = featuredAreas.length ? featuredAreas : practiceAreas.slice(0, 3);
  const featuredAttorneys = attorneys.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  return (
    <>
      <Hero
        eyebrow={siteSettings.firmName}
        title="Trusted counsel for businesses and the people who run them."
        description={siteSettings.tagline}
        primaryCta={{ label: "Schedule a consultation", href: "/contact" }}
        secondaryCta={{ label: "Our practice areas", href: "/practice-areas" }}
      />

      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Practice areas</h2>
            <Link href="/practice-areas" className={styles.sectionLink}>
              View all &rarr;
            </Link>
          </div>
          <div className={styles.cardGrid}>
            {displayAreas.map((area) => (
              <PracticeAreaCard key={area.slug} area={area} />
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Our attorneys</h2>
            <Link href="/attorneys" className={styles.sectionLink}>
              Meet the team &rarr;
            </Link>
          </div>
          <div className={styles.attorneyGrid}>
            {featuredAttorneys.map((a) => (
              <AttorneyCard key={a.slug} attorney={a} />
            ))}
          </div>
        </Container>
      </section>

      {recentPosts.length > 0 && (
        <section className={styles.section}>
          <Container narrow>
            <div className={styles.sectionHeader}>
              <h2>Latest insights</h2>
              <Link href="/insights" className={styles.sectionLink}>
                All insights &rarr;
              </Link>
            </div>
            <div>
              {recentPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
