/**
 * Shareable estimate codes for the pricing reveal.
 *
 * Encodes the *inputs* of a quote (loan band + selected add-ons + quantities)
 * into a short, URL-safe, human-readable code so a result can live in the URL,
 * be shared, and be re-derived on load. The price is recomputed from these
 * inputs (via computeQuote), so a shared link stays correct if the fee chart
 * ever changes.
 *
 * Format: `band.addonKey.addonKey-QTY` — e.g. `b5to10.nyCema.leaseReview-2`.
 * All band/add-on keys are alphanumeric, so `.` and `-` are safe delimiters.
 */

import { LOAN_BANDS, ADDONS } from "@/lib/pricing";

const BAND_KEYS = new Set(LOAN_BANDS.map((b) => b.key));
const ADDON_BY_KEY = new Map(ADDONS.map((a) => [a.key, a]));

export const BAND_FIELD = "quoteLoanBand";
export const ADDONS_FIELD = "quoteAddons";
export const QTY_FIELD = "quoteAddons__qty";

/** Encode a quote's inputs into a short, shareable, URL-safe code. */
export function encodeQuote(answers: Record<string, unknown>): string {
  const tokens: string[] = [];

  const band = answers[BAND_FIELD];
  if (typeof band === "string" && BAND_KEYS.has(band)) tokens.push(band);

  const selected = Array.isArray(answers[ADDONS_FIELD])
    ? (answers[ADDONS_FIELD] as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : [];
  const qty = (answers[QTY_FIELD] ?? {}) as Record<string, number>;

  // Iterate ADDONS for canonical order; "none" isn't in ADDONS so it's dropped.
  for (const a of ADDONS) {
    if (!selected.includes(a.key)) continue;
    if (a.hasQuantity) {
      const n = Math.max(1, Math.round(qty[a.key] ?? a.minQty ?? 1));
      tokens.push(n > 1 ? `${a.key}-${n}` : a.key);
    } else {
      tokens.push(a.key);
    }
  }

  return tokens.join(".");
}

/** A subset of the survey answers reconstructed from a code. */
type DecodedAnswers = Record<string, string | string[] | Record<string, number>>;

/** Decode a code back into the answer fields, or null if it has no valid band. */
export function decodeQuote(code: string): DecodedAnswers | null {
  if (!code) return null;
  let band: string | null = null;
  const addons: string[] = [];
  const qty: Record<string, number> = {};

  for (const tok of code.split(".").filter(Boolean)) {
    const [key, qtyStr] = tok.split("-");
    if (band === null && BAND_KEYS.has(key)) {
      band = key;
      continue;
    }
    const addon = ADDON_BY_KEY.get(key);
    if (!addon) continue; // ignore unknown / "none"
    addons.push(key);
    if (addon.hasQuantity && qtyStr) {
      const n = parseInt(qtyStr, 10);
      if (Number.isFinite(n) && n > 0) qty[key] = n;
    }
  }

  if (!band) return null;
  return { [BAND_FIELD]: band, [ADDONS_FIELD]: addons, [QTY_FIELD]: qty };
}
