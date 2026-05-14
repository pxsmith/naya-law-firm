import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "./Container";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/for-lawyers", label: "For Lawyers" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand}>
            {siteSettings.firmName}
          </Link>
          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className={styles.ctaLink}>
                  Book a Call
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
