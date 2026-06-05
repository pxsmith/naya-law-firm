import { NextResponse } from "next/server";
import { SURVEY_QUESTIONS } from "@/lib/survey";

/**
 * Receives the survey answers from the custom front-end and relays them to the
 * Google Form's response endpoint. Because we submit the real form fields, the
 * responses flow into the same Google Sheet the form is already connected to —
 * no extra storage to maintain.
 *
 * The form id is public (it's in the form's share URL), but we keep it
 * server-side and submit from here so the browser never has to deal with
 * Google's cross-origin rules and we get a real success/failure status.
 */

const FORM_ID =
  process.env.GOOGLE_FORM_ID ??
  "1FAIpQLScX6M-0oy2aUFRItqsI3_sTbr_mxGicGbT3sPLmUdTH0wgmSQ";

const FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

type Answers = Record<string, string | string[] | undefined>;

function isEmpty(value: string | string[] | undefined): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim() === "";
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

  // Validate required questions before bothering Google.
  for (const q of SURVEY_QUESTIONS) {
    if (q.required && isEmpty(answers[q.id])) {
      return NextResponse.json(
        { ok: false, error: `Please answer: ${q.title}` },
        { status: 400 },
      );
    }
  }

  // The Google Form has no email field, so we capture the email alongside the
  // name (e.g. "Jane Doe <jane@acme.com>") to avoid losing it. Add an "Email"
  // question to the form and give it an entry id to break this out cleanly.
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

  try {
    const res = await fetch(FORM_ACTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (compatible; NayaLawSurvey/1.0; +https://www.nayalawgroup.com)",
      },
      body: body.toString(),
      // We don't need to read Google's HTML response.
      redirect: "follow",
    });

    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: `The form rejected the submission (${res.status}).` },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not reach the form. Please try again." },
      { status: 502 },
    );
  }
}
