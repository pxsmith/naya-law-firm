"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  SURVEY_META,
  SURVEY_QUESTIONS,
  type PriceOption,
  type SurveyQuestion,
} from "@/lib/survey";
import { computeQuote, formatUSD, type Quote } from "@/lib/pricing";
import { encodeQuote, decodeQuote } from "@/lib/quoteCode";
import styles from "./SurveyExperience.module.css";

type Phase = "welcome" | "question" | "reveal";
/** Background status of the Google-Form relay — never blocks the reveal. */
type SubmitState = "idle" | "sending" | "ok" | "failed";
/** A selected add-on's quantity, keyed by PriceOption.key. */
type Quantities = Record<string, number>;
type AnswerValue = string | string[] | Quantities;
type Answers = Record<string, AnswerValue>;

/** Exit-animation duration. Keep in sync with `--exit-ms` in the CSS module. */
const EXIT_MS = 280;
/** Brief pause after picking a single answer before auto-advancing. */
const AUTO_ADVANCE_MS = 320;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isSingleType = (t: SurveyQuestion["type"]) =>
  t === "single" || t === "loanBand";
const isMultiType = (t: SurveyQuestion["type"]) =>
  t === "multi" || t === "addons";
const isChoiceType = (t: SurveyQuestion["type"]) =>
  isSingleType(t) || isMultiType(t);

/** The selectable keys for a choice question (price keys or raw options). */
function choiceKeys(q: SurveyQuestion): string[] {
  if (q.priceOptions) return q.priceOptions.map((p) => p.key);
  return q.options ?? [];
}

/** A question counts as answered (and valid) — gates the Continue button. */
function isComplete(q: SurveyQuestion, value: AnswerValue | undefined): boolean {
  // A quantity map (object) is never a direct answer.
  if (value && typeof value === "object" && !Array.isArray(value)) return false;
  if (Array.isArray(value)) return value.length > 0;
  const s = (value ?? "").toString().trim();
  if (s === "") return false;
  if (q.id === "email") return EMAIL_RE.test(s);
  return true;
}

export function SurveyExperience() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [leaving, setLeaving] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  /** Index of the currently highlighted option (keyboard cursor). */
  const [focusedOption, setFocusedOption] = useState(0);

  const total = SURVEY_QUESTIONS.length;
  const question = SURVEY_QUESTIONS[index];
  const isLast = index + 1 >= total;
  const answered = isComplete(question, answers[question.id]);

  // The Continue button only appears once the question is satisfied — or, for
  // optional questions, always (it doubles as "skip"). Single-select questions
  // auto-advance on pick, so they never need a Continue button.
  const showContinue = isSingleType(question.type)
    ? !question.required
    : answered || !question.required;

  // Refs so timer/keyboard callbacks always read fresh values.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const focusedOptionRef = useRef(focusedOption);
  useEffect(() => {
    focusedOptionRef.current = focusedOption;
  }, [focusedOption]);

  const advanceTimer = useRef<number | undefined>(undefined);
  const exitTimer = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

  // The estimate is derived purely from the collected answers.
  const quote = useMemo(() => computeQuote(answers), [answers]);

  // Lock the page behind the full-screen experience while it's mounted.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(advanceTimer.current);
      window.clearTimeout(exitTimer.current);
    };
  }, []);

  // Shareable estimate links + browser back/forward. A `?q=` code lands the
  // visitor straight on the reveal; popstate keeps form ↔ reveal in sync.
  // (Normal completion uses history.pushState in `proceed`, which never fires
  // popstate, so this only reacts to real Back/Forward and the initial load.)
  useEffect(() => {
    const syncFromUrl = () => {
      const code = new URLSearchParams(window.location.search).get("q");
      const decoded = code ? decodeQuote(code) : null;
      if (decoded) {
        setAnswers((a) => ({ ...a, ...decoded }));
        setPhase("reveal");
      } else {
        // No valid code: if a reveal is showing (Back was pressed), return to
        // the form. On first mount phase is "welcome", so this no-ops.
        setPhase((p) => (p === "reveal" ? "question" : p));
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // On entering a question: highlight the first option (or the previously
  // chosen one for single-select), and auto-focus text fields.
  useEffect(() => {
    if (phase !== "question") return;
    const q = SURVEY_QUESTIONS[index];
    if (isSingleType(q.type)) {
      const sel = answersRef.current[q.id];
      const i = typeof sel === "string" ? choiceKeys(q).indexOf(sel) : -1;
      setFocusedOption(i >= 0 ? i : 0);
    } else {
      setFocusedOption(0);
    }
    if (q.type === "text" || q.type === "longtext") {
      const id = window.setTimeout(() => inputRef.current?.focus(), EXIT_MS + 40);
      return () => window.clearTimeout(id);
    }
  }, [phase, index]);

  // On entering a question, start scrolled to the top so the header/subheader
  // are always visible (long screens like the add-ons list otherwise open
  // mid-list). While navigating options with the keyboard within the same
  // question, keep the highlighted one in view — but never on fresh entry.
  const prevIndexRef = useRef(index);
  useEffect(() => {
    if (phase !== "question") return;
    if (prevIndexRef.current !== index) {
      prevIndexRef.current = index;
      stageRef.current?.scrollTo({ top: 0 });
      return;
    }
    const el = optionsRef.current?.querySelector(
      `[data-opt="${focusedOption}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedOption, phase, index]);

  // Relay the research answers to the Google Form in the background. The price
  // reveal never waits on this, so a failed relay never hides the estimate.
  const submit = useCallback(async (finalAnswers: Answers) => {
    setSubmitState("sending");
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      setSubmitState(res.ok && data?.ok ? "ok" : "failed");
    } catch {
      setSubmitState("failed");
    }
  }, []);

  // Move to a given index with a directional transition.
  const transitionTo = useCallback((nextIndex: number, dir: 1 | -1) => {
    setDirection(dir);
    setLeaving(true);
    window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      setIndex(nextIndex);
      setLeaving(false);
    }, EXIT_MS);
  }, []);

  // Advance forward (or finish → reveal if we're on the last question).
  const proceed = useCallback(
    (extra?: { id: string; value: AnswerValue }) => {
      const merged = extra
        ? { ...answersRef.current, [extra.id]: extra.value }
        : answersRef.current;
      if (index + 1 >= total) {
        // Show the estimate instantly; relay to Google in the background.
        submit(merged);
        // Put the estimate in the URL: shareable + a browser back/forward stop.
        const code = encodeQuote(merged);
        if (typeof window !== "undefined" && code) {
          window.history.pushState({ q: code }, "", `?q=${code}`);
        }
        setPhase("reveal");
      } else {
        transitionTo(index + 1, 1);
      }
    },
    [index, total, submit, transitionTo],
  );

  // Continue / finish. Silently does nothing if a required answer is missing —
  // the Continue button is hidden in that case, so this never rejects loudly.
  const handleNext = useCallback(() => {
    if (leaving) return;
    const value = answersRef.current[question.id];
    if (question.required && !isComplete(question, value)) return;
    proceed();
  }, [leaving, question, proceed]);

  const handleBack = useCallback(() => {
    if (leaving || index === 0) return; // no going back from the first question
    window.clearTimeout(advanceTimer.current);
    transitionTo(index - 1, -1);
  }, [leaving, index, transitionTo]);

  const selectSingle = useCallback(
    (optionKey: string) => {
      if (leaving) return;
      setAnswers((a) => ({ ...a, [question.id]: optionKey }));
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        proceed({ id: question.id, value: optionKey });
      }, AUTO_ADVANCE_MS);
    },
    [leaving, question.id, proceed],
  );

  const toggleMulti = useCallback(
    (optionKey: string) => {
      setAnswers((a) => {
        let current = Array.isArray(a[question.id])
          ? [...(a[question.id] as string[])]
          : [];
        if (optionKey === "none") {
          // "None of these" is mutually exclusive with every real add-on.
          current = current.includes("none") ? [] : ["none"];
        } else {
          const at = current.indexOf(optionKey);
          if (at >= 0) current.splice(at, 1);
          else current.push(optionKey);
          current = current.filter((k) => k !== "none"); // any real pick clears "none"
        }
        return { ...a, [question.id]: current };
      });
    },
    [question.id],
  );

  // Quantity stepper for per-unit add-ons. Stored under a sibling `__qty` key
  // (no entryId → never reaches Google, never appears in the question loop).
  const setQty = useCallback(
    (optionKey: string, next: number) => {
      setAnswers((a) => {
        const qmapKey = `${question.id}__qty`;
        const prev = (a[qmapKey] as Quantities) ?? {};
        return { ...a, [qmapKey]: { ...prev, [optionKey]: next } };
      });
    },
    [question.id],
  );

  const setText = useCallback(
    (value: string) => {
      setAnswers((a) => ({ ...a, [question.id]: value }));
    },
    [question.id],
  );

  // → on an option question acts on the highlighted row: single picks it (and
  // auto-advances); multi toggles it (you keep selecting, then Continue).
  const pickFocused = useCallback(() => {
    if (leaving) return;
    const key = choiceKeys(question)[focusedOptionRef.current];
    if (key == null) return;
    if (isSingleType(question.type)) selectSingle(key);
    else toggleMulti(key);
  }, [leaving, question, selectSingle, toggleMulti]);

  const startSurvey = useCallback(() => {
    setIndex(0);
    setDirection(1);
    setPhase("question");
  }, []);

  // ── Keyboard control ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "welcome") {
        if (e.key === "Enter" || e.key === "ArrowRight") {
          e.preventDefault();
          startSurvey();
        }
        return;
      }
      if (phase !== "question" || leaving) return;

      // Text questions own their keys (Enter, and arrows at the caret edges)
      // via the field's onKeyDown, so the global handler stays out of the way.
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const len = choiceKeys(question).length;
      const isChoice = isChoiceType(question.type);
      const singleLike = isSingleType(question.type);

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleBack();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isChoice) pickFocused();
        else handleNext();
        return;
      }
      if (isChoice && len > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedOption((f) => (f + 1) % len);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedOption((f) => (f - 1 + len) % len);
          return;
        }
        if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          pickFocused();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (singleLike) {
            // Single: Enter picks the highlighted option.
            pickFocused();
          } else {
            // Multi: Enter selects the highlighted option first; once something
            // is selected, a second Enter advances. Same feel as single-select,
            // consistent across required + optional "select all that apply".
            const v = answersRef.current[question.id];
            const anySelected = Array.isArray(v) && v.length > 0;
            if (anySelected) handleNext();
            else pickFocused();
          }
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, leaving, question, pickFocused, handleNext, handleBack, startSurvey]);

  const progress = useMemo(() => {
    if (phase === "welcome") return 0;
    if (phase === "reveal") return 1;
    return index / total;
  }, [phase, index, total]);

  const cardClass = [
    styles.card,
    leaving
      ? direction === 1
        ? styles.leaveUp
        : styles.leaveDown
      : direction === 1
        ? styles.enterUp
        : styles.enterDown,
  ]
    .filter(Boolean)
    .join(" ");

  // Jump back into the flow at the pricing question to revise an estimate.
  const editEstimate = useCallback(() => {
    const i = SURVEY_QUESTIONS.findIndex((q) => q.id === "quoteLoanBand");
    // Drop the ?q= estimate code from the URL while editing.
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setIndex(i >= 0 ? i : 0);
    setDirection(-1);
    setPhase("question");
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.mesh} aria-hidden="true" />

      {/* Top bar: brand · progress · exit */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Naya Law — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/naya-logo.png" alt="Naya Law" />
        </Link>
        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={styles.progressFill}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <Link href="/" className={styles.close} aria-label="Exit">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </header>

      <main
        ref={stageRef}
        className={[styles.stage, phase === "reveal" ? styles.stageScroll : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {phase === "welcome" && <Welcome onStart={startSurvey} count={total} />}

        {phase === "question" && (
          <section className={cardClass} aria-live="polite" key={index}>
            <div className={styles.qmeta}>
              <span className={styles.qnum}>
                {String(index + 1).padStart(2, "0")}
                <span className={styles.qsep}>/</span>
                <span className={styles.qtotal}>
                  {String(total).padStart(2, "0")}
                </span>
              </span>
              {!question.required && (
                <span className={styles.optional}>Optional</span>
              )}
            </div>

            <h1 className={styles.qtitle}>{question.title}</h1>
            {question.description && (
              <p className={styles.qdesc}>{question.description}</p>
            )}

            <QuestionBody
              question={question}
              value={answers[question.id]}
              quantities={(answers[`${question.id}__qty`] as Quantities) ?? {}}
              inputRef={inputRef}
              optionsRef={optionsRef}
              focused={focusedOption}
              onHover={setFocusedOption}
              onSelectSingle={selectSingle}
              onToggleMulti={toggleMulti}
              onQty={setQty}
              onText={setText}
              onEnter={handleNext}
              onBack={handleBack}
            />

            <div className={styles.controls}>
              {showContinue && (
                <button
                  type="button"
                  className={`${styles.primaryBtn} ${styles.continueBtn}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleNext}
                >
                  {isLast ? "See my estimate" : "Continue"}
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h13M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              {isMultiType(question.type) && (
                <span className={styles.enterHint}>
                  <kbd>→</kbd> select · <kbd>Enter</kbd> continue
                </span>
              )}
              {question.type === "longtext" && (
                <span className={styles.enterHint}>
                  <kbd>Enter</kbd> continue · <kbd>Shift</kbd>+<kbd>Enter</kbd> new
                  line
                </span>
              )}
              {question.type === "text" && (
                <span className={styles.enterHint}>
                  <kbd>Enter</kbd> to {isLast ? "finish" : "continue"}
                </span>
              )}
            </div>

            {index > 0 && (
              <button
                type="button"
                className={styles.backBtn}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBack}
              >
                <span className={styles.keyCap} aria-hidden="true">
                  ←
                </span>
                Back
              </button>
            )}
          </section>
        )}

        {phase === "reveal" && (
          <PriceReveal
            quote={quote}
            submitState={submitState}
            onRetry={() => submit(answersRef.current)}
            onEdit={editEstimate}
          />
        )}
      </main>
    </div>
  );
}

// ── Sub-views ────────────────────────────────────────────────────────

function Welcome({ onStart, count }: { onStart: () => void; count: number }) {
  return (
    <div className={styles.welcome}>
      <p className={styles.eyebrow}>{SURVEY_META.eyebrow}</p>
      <h1 className={styles.welcomeTitle}>{SURVEY_META.title}</h1>
      <p className={styles.welcomeSub}>{SURVEY_META.subtitle}</p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.primaryBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onStart}
        >
          Start
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className={styles.enterHint}>
          press <kbd>Enter</kbd> · {count} questions · ~2 min
        </span>
      </div>
      <p className={styles.disclaimer}>
        Submitting this form does not create an attorney-client relationship.
      </p>
    </div>
  );
}

function PriceReveal({
  quote,
  submitState,
  onRetry,
  onEdit,
}: {
  quote: Quote;
  submitState: SubmitState;
  onRetry: () => void;
  onEdit: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Land focus on the result for screen-reader / keyboard users.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const printedOn = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  // Headline number: pure TBD when the base can't be priced; "from $X" when the
  // base is known but an add-on (Extra Negotiation) is TBD; else the total.
  const hero = quote.baseTBD
    ? { kind: "tbd" as const }
    : quote.isTBD
      ? { kind: "from" as const, value: formatUSD(quote.knownTotal) }
      : { kind: "exact" as const, value: formatUSD(quote.total as number) };

  return (
    <section
      className={`${styles.revealRoot} ${styles.enterUp}`}
      aria-labelledby="reveal-title"
    >
      {/* Print-only letterhead — hidden on screen, shown in the PDF. */}
      <div className={styles.printLetterhead} aria-hidden="true">
        <strong>Naya Law</strong> · Fixed Fee Estimate · {printedOn}
      </div>

      <p className={styles.revealEyebrow}>Your estimate</p>
      <h1
        id="reveal-title"
        ref={titleRef}
        tabIndex={-1}
        className={styles.revealTitle}
      >
        {quote.baseTBD ? "Let's confirm your fixed fee" : "Your Naya fixed fee"}
      </h1>

      <div className={styles.revealHero}>
        {hero.kind === "tbd" ? (
          <span className={styles.revealTBD} data-beam-target>
            We&apos;ll confirm this on a quick call
          </span>
        ) : (
          <span className={styles.revealTotal} data-beam-target>
            {hero.kind === "from" && (
              <span className={styles.revealFrom}>from </span>
            )}
            {hero.value}
          </span>
        )}
        <p className={styles.revealTotalNote}>
          {quote.baseTBD
            ? "Loans this size are quoted per deal — we'll finalize your fixed fee on a quick call."
            : quote.isTBD
              ? "A few items on this deal are priced per transaction — the rest is fixed and quoted upfront."
              : "A fixed fee, quoted before the work begins. No hourly surprises."}
        </p>
      </div>

      {/* Itemized breakdown */}
      <div className={styles.breakdown}>
        <p className={styles.breakdownLabel}>What&apos;s included</p>
        <ul className={styles.lineItems}>
          <li className={styles.lineRow}>
            <span className={styles.lineLabel}>
              Base fixed fee
              {quote.baseLabel && (
                <span className={styles.lineMeta}>{quote.baseLabel} loan</span>
              )}
            </span>
            <span className={styles.lineAmount}>
              {quote.baseFee == null ? "TBD" : formatUSD(quote.baseFee)}
            </span>
          </li>

          {quote.lineItems.map((li) => (
            <li className={styles.lineRow} key={li.key}>
              <span className={styles.lineLabel}>
                {li.label}
                {li.hasQuantity && li.unitPrice != null && (
                  <span className={styles.lineMeta}>
                    {li.quantity} × {formatUSD(li.unitPrice)}
                    {li.unitNote ? ` ${li.unitNote}` : ""}
                  </span>
                )}
              </span>
              <span className={styles.lineAmount}>
                {li.amount == null ? "TBD" : formatUSD(li.amount)}
              </span>
            </li>
          ))}

          <li className={`${styles.lineRow} ${styles.lineTotalRow}`}>
            <span className={styles.lineLabel}>
              {quote.isTBD ? "Estimated so far" : "Total fixed fee"}
            </span>
            <span className={styles.lineTotalAmount}>
              {quote.baseTBD
                ? "TBD"
                : `${quote.isTBD ? "from " : ""}${formatUSD(quote.knownTotal)}`}
            </span>
          </li>
        </ul>

        {quote.isTBD && quote.tbdReasons.length > 0 && (
          <p className={styles.tbdNote}>
            Priced per transaction: {quote.tbdReasons.join(", ")}. We&apos;ll
            confirm these on a quick call.
          </p>
        )}
      </div>

      {/* Footnotes from the fee chart */}
      <ol className={styles.footnotes}>
        <li>
          Pricing may be lower for simpler loan models. We can agree to this
          pricing for up to 5 loans and use those to confirm appropriate pricing.
        </li>
        <li>
          Your team gets access to the Naya Software Platform at no additional
          cost on all loans closed by Naya Law.
        </li>
        <li>
          Any extraordinary loan-document negotiations are priced per
          transaction.
        </li>
      </ol>

      <div className={`${styles.controls} ${styles.revealCtas}`}>
        <Link href="/contact" className={styles.primaryBtn}>
          Book a call
        </Link>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => window.print()}
        >
          Download PDF
        </button>
        <button type="button" className={styles.backBtn} onClick={onEdit}>
          Edit my answers
        </button>
      </div>

      <p className={styles.submitNote}>
        {submitState === "failed" ? (
          <>
            We couldn&apos;t save your responses.{" "}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={onRetry}
            >
              Retry
            </button>
          </>
        ) : submitState === "ok" ? (
          "Your responses have been recorded."
        ) : (
          "Submitting this form does not create an attorney-client relationship."
        )}
      </p>
    </section>
  );
}

function QuestionBody({
  question,
  value,
  quantities,
  inputRef,
  optionsRef,
  focused,
  onHover,
  onSelectSingle,
  onToggleMulti,
  onQty,
  onText,
  onEnter,
  onBack,
}: {
  question: SurveyQuestion;
  value: AnswerValue | undefined;
  quantities: Quantities;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  optionsRef: React.RefObject<HTMLUListElement | null>;
  focused: number;
  onHover: (i: number) => void;
  onSelectSingle: (optionKey: string) => void;
  onToggleMulti: (optionKey: string) => void;
  onQty: (optionKey: string, next: number) => void;
  onText: (value: string) => void;
  onEnter: () => void;
  onBack: () => void;
}) {
  // Shared key handling for the text/email/textarea fields: Enter continues,
  // → continues when the caret is at the end, ← goes back when it's at the start.
  const onFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const el = e.currentTarget;
    const collapsed = el.selectionStart === el.selectionEnd;
    const atEnd = collapsed && el.selectionStart === el.value.length;
    const atStart = collapsed && el.selectionStart === 0;
    if (e.key === "Enter") {
      if (question.type === "longtext" && e.shiftKey) return; // newline
      e.preventDefault();
      onEnter();
    } else if (e.key === "ArrowRight" && atEnd) {
      e.preventDefault();
      onEnter();
    } else if (e.key === "ArrowLeft" && atStart) {
      e.preventDefault();
      onBack();
    }
  };

  if (isSingleType(question.type) || isMultiType(question.type)) {
    const multi = isMultiType(question.type);
    // Normalize raw "single"/"multi" options into the priced-option shape.
    const opts: PriceOption[] =
      question.priceOptions ??
      (question.options ?? []).map((o) => ({ key: o, label: o, unitPrice: null }));
    const selected = Array.isArray(value) ? value : value ? [value as string] : [];
    const len = opts.length;
    // Which option each arrow key would move the highlight to (with wrap).
    const downTarget = len ? (focused + 1) % len : -1;
    const upTarget = len ? (focused - 1 + len) % len : -1;
    return (
      <ul
        ref={optionsRef}
        className={styles.options}
        role="listbox"
        aria-multiselectable={multi || undefined}
      >
        {opts.map((opt, i) => {
          const isSelected = selected.includes(opt.key);
          const isFocused = i === focused;
          const hint = isFocused
            ? "→"
            : i === downTarget
              ? "↓"
              : i === upTarget
                ? "↑"
                : null;
          const showStepper = multi && isSelected && opt.hasQuantity;
          const qty = quantities[opt.key] ?? opt.minQty ?? 1;
          const clampQty = (n: number) =>
            Math.min(
              Math.max(n, opt.minQty ?? 1),
              opt.maxQty ?? Number.POSITIVE_INFINITY,
            );
          return (
            <li key={opt.key} style={{ ["--i" as string]: i }}>
              <button
                type="button"
                data-opt={i}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                className={[
                  styles.option,
                  isSelected ? styles.optionSelected : "",
                  isFocused ? styles.optionFocused : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onHover(i)}
                onClick={() =>
                  multi ? onToggleMulti(opt.key) : onSelectSingle(opt.key)
                }
              >
                <span className={styles.optKeySlot} aria-hidden="true">
                  {hint && <span className={styles.keyCap}>{hint}</span>}
                </span>
                <span className={styles.optionLabel}>
                  {opt.label}
                  {opt.help && <span className={styles.optHelp}>{opt.help}</span>}
                </span>
                <span
                  className={`${styles.tick} ${
                    multi ? styles.tickBox : styles.tickDot
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </span>
              </button>

              {showStepper && (
                <div className={styles.qtyStepper}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    aria-label={`Decrease ${opt.label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onQty(opt.key, clampQty(qty - 1))}
                  >
                    −
                  </button>
                  <span className={styles.qtyValue}>{qty}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    aria-label={`Increase ${opt.label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onQty(opt.key, clampQty(qty + 1))}
                  >
                    +
                  </button>
                  {opt.unitNote && (
                    <span className={styles.qtyNote}>{opt.unitNote}</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (question.type === "longtext") {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={styles.textarea}
        placeholder={question.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onText(e.target.value)}
        onKeyDown={onFieldKeyDown}
        rows={3}
      />
    );
  }

  const isEmail = question.id === "email";
  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={styles.textInput}
      type={isEmail ? "email" : "text"}
      inputMode={isEmail ? "email" : undefined}
      autoComplete={isEmail ? "email" : question.id === "name" ? "name" : undefined}
      placeholder={question.placeholder}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onText(e.target.value)}
      onKeyDown={onFieldKeyDown}
    />
  );
}
