import { NextResponse } from "next/server";
import { SURVEY_QUESTIONS } from "@/lib/survey";
import { computeQuote, formatUSD, type Quote } from "@/lib/pricing";
import { encodeQuote } from "@/lib/quoteCode";

/**
 * Receives the survey answers from the custom front-end and:
 *   1. relays the research answers to the Google Form (same Google Sheet), and
 *   2. emails the full entry (incl. the computed fixed-fee estimate) via
 *      Formspree — the same service the contact form already uses.
 *
 * The Google form id is public (it's in the form's share URL) but kept
 * server-side so the browser avoids Google's cross-origin rules.
 */

const FORM_ID =
  process.env.GOOGLE_FORM_ID ??
  "1FAIpQLScX6M-0oy2aUFRItqsI3_sTbr_mxGicGbT3sPLmUdTH0wgmSQ";

const FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

/**
 * Where pricing submissions are emailed. Reuses the Formspree pattern from the
 * contact form: create a Formspree form whose recipient is the target inbox,
 * then set PRICING_FORMSPREE_ID to that form's id.
 *
 * ⚠️  PRODUCTION FLAG: for now this routes to phil@gotimehq.com (the recipient
 * is configured inside the Formspree form). Before launch, point the Formspree
 * form — or this env var — at the CLIENT's inbox.
 */
const PRICING_FORMSPREE_ID = process.env.PRICING_FORMSPREE_ID ?? "";

type Answers = Record<string, string | string[] | undefined>;

function isEmpty(value: string | string[] | undefined): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim() === "";
}

function describeEstimate(quote: Quote): string {
  if (quote.baseTBD) return "Custom — loan over $20MM (call to confirm)";
  if (quote.isTBD)
    return `from ${formatUSD(quote.knownTotal)} (+ items priced per transaction)`;
  return formatUSD(quote.total as number);
}

/** Email the entry + estimate to the Formspree inbox. Returns true on success. */
async function notifyFormspree(
  formId: string,
  answers: Record<string, unknown>,
  quote: Quote,
  origin: string,
): Promise<boolean> {
  const str = (k: string) =>
    typeof answers[k] === "string" ? (answers[k] as string).trim() : "";

  const code = encodeQuote(answers);
  const breakdown = [
    quote.baseLabel
      ? `Base fixed fee (${quote.baseLabel}): ${
          quote.baseFee == null ? "TBD" : formatUSD(quote.baseFee)
        }`
      : null,
    ...quote.lineItems.map(
      (li) =>
        `${li.label}${li.hasQuantity ? ` ×${li.quantity}` : ""}: ${
          li.amount == null ? "TBD" : formatUSD(li.amount)
        }`,
    ),
    `Total: ${describeEstimate(quote)}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Labelled research answers (only the questions that map to the Google form).
  const survey = SURVEY_QUESTIONS.filter((q) => q.entryId)
    .map((q) => {
      const v = answers[q.id];
      const s = Array.isArray(v)
        ? v.join(", ")
        : typeof v === "string"
          ? v
          : "";
      return s ? `${q.title}\n  ${s}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const payload = {
    _subject: `New pricing estimate — ${describeEstimate(quote)}${
      str("lenderName") ? ` · ${str("lenderName")}` : ""
    }`,
    name: str("name"),
    email: str("email"),
    lender: str("lenderName"),
    estimate: describeEstimate(quote),
    breakdown,
    shareable_link: code ? `${origin}/pricing?q=${code}` : "(no estimate)",
    survey,
  };

  const res = await fetch(`https://formspree.io/f/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function POST(request: Request) {
  let payload: { answers?: Answers };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const answers = payload.answers ?? {};

  // Validate required questions before doing anything. Local-only pricing
  // questions (no entryId, e.g. quoteLoanBand/quoteAddons) are validated on the
  // client. Email is the one exception: it has no field of its own but is folded
  // into Name on the Google side.
  for (const q of SURVEY_QUESTIONS) {
    if (!q.entryId && q.id !== "email") continue;
    if (q.required && isEmpty(answers[q.id])) {
      return NextResponse.json(
        { ok: false, error: `Please answer: ${q.title}` },
        { status: 400 },
      );
    }
  }

  // The Google Form has no email field, so capture the email alongside the name
  // (e.g. "Jane Doe <jane@acme.com>") to avoid losing it.
  const emailRaw = answers["email"];
  const email = typeof emailRaw === "string" ? emailRaw.trim() : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  // Build the URL-encoded body Google expects. Multi-selects repeat the same
  // entry key once per chosen option.
  const body = new URLSearchParams();
  for (const q of SURVEY_QUESTIONS) {
    if (q.id === "email") continue; // no matching form field; folded into Name
    if (!q.entryId) continue; // local-only pricing questions never post to Google
    const value = answers[q.id];
    if (q.id === "name") {
      const nameStr = typeof value === "string" ? value.trim() : "";
      const composed = email ? `${nameStr} <${email}>` : nameStr;
      if (composed) body.append(q.entryId, composed);
      continue;
    }
    if (value == null) continue;
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      const trimmed = String(item).trim();
      if (trimmed) body.append(q.entryId, trimmed);
    }
  }
  // Standard single-page form view markers.
  body.append("fvv", "1");
  body.append("pageHistory", "0");

  const answersAny = answers as Record<string, unknown>;
  const quote = computeQuote(answersAny);
  const origin = new URL(request.url).origin;

  // 1) Relay research answers to the Google Form (best-effort).
  let googleOk = false;
  try {
    const res = await fetch(FORM_ACTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (compatible; NayaLawSurvey/1.0; +https://www.nayalawgroup.com)",
      },
      body: body.toString(),
      redirect: "follow",
    });
    googleOk = res.ok || (res.status >= 300 && res.status < 400);
  } catch {
    googleOk = false;
  }

  // 2) Email the entry + estimate via Formspree (best-effort — never blocks the
  // reveal). If unconfigured, we simply skip it.
  let formspreeOk = false;
  if (PRICING_FORMSPREE_ID) {
    try {
      formspreeOk = await notifyFormspree(
        PRICING_FORMSPREE_ID,
        answersAny,
        quote,
        origin,
      );
    } catch {
      formspreeOk = false;
    }
  } else {
    console.warn(
      "[survey] PRICING_FORMSPREE_ID not set — submission email skipped.",
    );
  }

  // Success if the entry was captured anywhere (sheet or inbox).
  if (googleOk || formspreeOk) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json(
    { ok: false, error: "We couldn't record your responses. Please try again." },
    { status: 502 },
  );
}
