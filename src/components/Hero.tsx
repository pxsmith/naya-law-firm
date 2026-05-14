import Link from "next/link";
import { Container } from "./Container";
import styles from "./Hero.module.css";

interface HeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.inner}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
          {(primaryCta || secondaryCta) && (
            <div className={styles.ctas}>
              {primaryCta && (
                <Link href={primaryCta.href} className={styles.primaryCta}>
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href} className={styles.secondaryCta}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
