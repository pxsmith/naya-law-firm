import styles from "./CalendlyEmbed.module.css";

/**
 * Inline Calendly booking widget, themed to match the brand's dark palette.
 *
 * Calendly renders inside a cross-origin iframe, so it can't read our CSS
 * variables — the dark theme is passed as URL query params instead. The hex
 * values mirror the design tokens in globals.css:
 *   background_color → --color-bg     (#0a0b0e)
 *   text_color       → --color-text   (#ebecef)
 *   primary_color    → --color-accent (#b1e244)
 */
const CALENDLY_URL =
  "https://calendly.com/matthew-basile/naya-demo" +
  "?hide_gdpr_banner=1" +
  "&background_color=0a0b0e" +
  "&text_color=ebecef" +
  "&primary_color=b1e244";

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
