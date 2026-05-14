import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "./Container";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/practice-areas", label: "Practice Areas" },
  { href: "/attorneys", label: "Attorneys" },
  { href: "/insights", label: "Insights" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
