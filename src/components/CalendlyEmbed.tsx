import styles from "./CalendlyEmbed.module.css";

/**
 * Inline Calendly booking widget.
 *
 * Uses Calendly's standard inline embed (`embed_type=Inline`), which drops
 * Calendly's standalone-page chrome (the light-gray page background) so the
 * widget sits cleanly on our dark section — matching the Naya Software contact
 * page, which uses the same Calendly link.
 *
 * The dark-theme colour params were removed: custom embed colours are a Calendly
 * paid-plan feature and were being ignored on the current plan. If Calendly is
 * ever upgraded, re-add
 * `&background_color=0a0b0e&text_color=ebecef&primary_color=1f9d63` to theme it.
 */
const CALENDLY_URL =
  "https://calendly.com/matthew-basile/naya-demo" +
  "?embed_domain=www.nayalawgroup.com" +
  "&embed_type=Inline" +
  "&hide_gdpr_banner=1";

export function CalendlyEmbed() {
  return (
    <div className={styles.embed}>
      <iframe
        src={CALENDLY_URL}
        title="Select a date & time — Calendly"
        className={styles.frame}
      />
    </div>
  );
}
