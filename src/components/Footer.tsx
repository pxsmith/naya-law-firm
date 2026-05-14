import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "./Container";
import styles from "./Footer.module.css";

const FOOTER_LINKS = [
  { href: "/practice-areas", label: "Practice Areas" },
  { href: "/attorneys", label: "Attorneys" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const office = siteSettings.offices[0];

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div>
            <p className={styles.brand}>{siteSettings.firmName}</p>
            {office && (
              <address className={styles.address}>
                {office.street}
                <br />
                {office.city}, {office.region} {office.postalCode}
                <br />
                <a href={`tel:${siteSettings.contact.phone}`}>
                  {siteSettings.contact.phoneDisplay}
                </a>
                <br />
                <a href={`mailto:${siteSettings.contact.email}`}>
                  {siteSettings.contact.email}
                </a>
              </address>
            )}
          </div>
          <nav aria-label="Footer">
            <ul className={styles.linkList}>
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.disclaimers}>
          <p>{siteSettings.disclaimers.attorneyAdvertising}</p>
          <p>{siteSettings.disclaimers.legalAdvice}</p>
        </div>
        <p className={styles.copyright}>
          &copy; {year} {siteSettings.firmName}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
