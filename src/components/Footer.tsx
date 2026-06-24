import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "./Container";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/naya-logo.png"
            alt={siteSettings.firmName}
            className={styles.brand}
            width={780}
            height={112}
          />
        </div>
        <div className={styles.disclaimers}>
          <p>
            {siteSettings.disclaimers.attorneyAdvertising}{" "}
            {siteSettings.disclaimers.legalAdvice}
          </p>
        </div>
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {year} {siteSettings.firmName}. All rights reserved.{" "}
            <Link href="/privacy">Privacy</Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
