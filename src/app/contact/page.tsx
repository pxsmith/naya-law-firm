import type { Metadata } from "next";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ContactForm } from "@/components/ContactForm";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Naya Law Firm. We respond to every inquiry within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Get in touch."
        description="We respond to every inquiry within one business day. For urgent matters, please call our office directly."
      />
      <Container>
        <div className={styles.layout}>
          <div className={styles.form}>
            <ContactForm />
          </div>
          <aside className={styles.aside}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>By phone</h2>
              <p>
                <a href={`tel:${siteSettings.contact.phone}`}>
                  {siteSettings.contact.phoneDisplay}
                </a>
              </p>
            </div>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>By email</h2>
              <p>
                <a href={`mailto:${siteSettings.contact.email}`}>
                  {siteSettings.contact.email}
                </a>
              </p>
            </div>
            {siteSettings.offices.map((office) => (
              <div key={office.label} className={styles.block}>
                <h2 className={styles.blockTitle}>{office.label}</h2>
                <address className={styles.address}>
                  {office.street}
                  <br />
                  {office.city}, {office.region} {office.postalCode}
                </address>
                <p className={styles.hours}>{office.hours}</p>
              </div>
            ))}
          </aside>
        </div>
      </Container>
    </>
  );
}
