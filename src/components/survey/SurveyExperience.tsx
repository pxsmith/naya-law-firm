"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  SURVEY_META,
  SURVEY_QUESTIONS,
  type SurveyQuestion,
} from "@/lib/survey";
import styles from "./SurveyExperience.module.css";

type Phase = "welcome" | "question" | "submitting" | "success" | "error";
type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;

/** Exit-animation duration. Keep in sync with `--exit-ms` in the CSS module. */
const EXIT_MS = 280;
/** Brief pause after picking a single answer before auto-advancing. */
const AUTO_ADVANCE_MS = 320;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A question counts as answered (and valid) — gates the Continue button. */
function isComplete(q: SurveyQuestion, value: AnswerValue | undefined): boolean {
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
  const [errorMsg, setErrorMsg] = useState("");
  /** Index of the currently highlighted option (keyboard cursor). */
  const [focusedOption, setFocusedOption] = useState(0);

  const total = SURVEY_QUESTIONS.length;
  const question = SURVEY_QUESTIONS[index];
  const isLast = index + 1 >= total;
  const answered = isComplete(question, answers[question.id]);

  // The Continue button only appears once the question is satisfied — or, for
  // optional questions, always (it doubles as "skip"). Single-select questions
  // auto-advance on pick, so they never need a Continue button.
  const showContinue =
    question.type === "single" ? !question.required : answered || !question.required;

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

  // On entering a question: highlight the first option (or the previously
  // chosen one for single-select), and auto-focus text fields.
  useEffect(() => {
    if (phase !== "question") return;
    const q = SURVEY_QUESTIONS[index];
    if (q.type === "single") {
      const sel = answersRef.current[q.id];
      const i = typeof sel === "string" ? q.options?.indexOf(sel) ?? -1 : -1;
      setFocusedOption(i >= 0 ? i : 0);
    } else {
      setFocusedOption(0);
    }
    if (q.type === "text" || q.type === "longtext") {
      const id = window.setTimeout(() => inputRef.current?.focus(), EXIT_MS + 40);
      return () => window.clearTimeout(id);
    }
  }, [phase, index]);

  // Keep the highlighted option scrolled into view on long lists.
  useEffect(() => {
    if (phase !== "question") return;
    const el = optionsRef.current?.querySelector(
      `[data-opt="${focusedOption}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedOption, phase, index]);

  const submit = useCallback(async (finalAnswers: Answers) => {
    setPhase("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.ok && data?.ok) {
        setPhase("success");
      } else {
        setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
        setPhase("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setPhase("error");
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

  // Advance forward (or submit if we're on the last question).
  const proceed = useCallback(
    (extra?: { id: string; value: AnswerValue }) => {
      const merged = extra
        ? { ...answersRef.current, [extra.id]: extra.value }
        : answersRef.current;
      if (index + 1 >= total) {
        submit(merged);
      } else {
        transitionTo(index + 1, 1);
      }
    },
    [index, total, submit, transitionTo],
  );

  // Continue / submit. Silently does nothing if a required answer is missing —
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
    (option: string) => {
      if (leaving) return;
      setAnswers((a) => ({ ...a, [question.id]: option }));
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        proceed({ id: question.id, value: option });
      }, AUTO_ADVANCE_MS);
    },
    [leaving, question.id, proceed],
  );

  const toggleMulti = useCallback(
    (option: string) => {
      setAnswers((a) => {
        const current = Array.isArray(a[question.id])
          ? [...(a[question.id] as string[])]
          : [];
        const at = current.indexOf(option);
        if (at >= 0) current.splice(at, 1);
        else current.push(option);
        return { ...a, [question.id]: current };
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
    const option = question.options?.[focusedOptionRef.current];
    if (option == null) return;
    if (question.type === "single") selectSingle(option);
    else toggleMulti(option);
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
      if (phase === "error") {
        if (e.key === "Enter") {
          e.preventDefault();
          submit(answersRef.current);
        }
        return;
      }
      if (phase !== "question" || leaving) return;

      // Text questions own their keys (Enter, and arrows at the caret edges)
      // via the field's onKeyDown, so the global handler stays out of the way.
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const len = question.options?.length ?? 0;
      const isChoice = question.type === "single" || question.type === "multi";

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
          // Single: Enter picks the highlight. Multi: Enter means "I'm done".
          if (question.type === "single") pickFocused();
          else handleNext();
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    phase,
    leaving,
    question,
    pickFocused,
    handleNext,
    handleBack,
    startSurvey,
    submit,
  ]);

  const progress = useMemo(() => {
    if (phase === "welcome") return 0;
    if (phase === "success") return 1;
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

      <main className={styles.stage}>
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
              inputRef={inputRef}
              optionsRef={optionsRef}
              focused={focusedOption}
              onHover={setFocusedOption}
              onSelectSingle={selectSingle}
              onToggleMulti={toggleMulti}
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
                  {isLast ? "Submit" : "Continue"}
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
              {question.type === "multi" && (
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
                  <kbd>Enter</kbd> to {isLast ? "submit" : "continue"}
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

        {phase === "submitting" && (
          <div className={styles.statusScreen}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Sending your response…</p>
          </div>
        )}

        {phase === "success" && <ThankYou />}

        {phase === "error" && (
          <div className={styles.statusScreen}>
            <h1 className={styles.qtitle}>That didn&apos;t go through.</h1>
            <p className={styles.qdesc}>{errorMsg}</p>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => submit(answersRef.current)}
              >
                Try again
              </button>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setPhase("question")}
              >
                Back to the survey
              </button>
            </div>
          </div>
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

function ThankYou() {
  return (
    <div className={styles.welcome}>
      <span className={styles.checkmark} aria-hidden="true">
        <svg viewBox="0 0 52 52" width="72" height="72">
          <circle
            className={styles.checkCircle}
            cx="26"
            cy="26"
            r="24"
            fill="none"
          />
          <path className={styles.checkPath} fill="none" d="M14 27l8 8 16-18" />
        </svg>
      </span>
      <h1 className={styles.welcomeTitle}>{SURVEY_META.thanks.title}</h1>
      <p className={styles.welcomeSub}>{SURVEY_META.thanks.body}</p>
      <div className={styles.controls}>
        <Link href="/" className={styles.primaryBtn}>
          Back to Naya Law
        </Link>
      </div>
    </div>
  );
}

function QuestionBody({
  question,
  value,
  inputRef,
  optionsRef,
  focused,
  onHover,
  onSelectSingle,
  onToggleMulti,
  onText,
  onEnter,
  onBack,
}: {
  question: SurveyQuestion;
  value: AnswerValue | undefined;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  optionsRef: React.RefObject<HTMLUListElement | null>;
  focused: number;
  onHover: (i: number) => void;
  onSelectSingle: (option: string) => void;
  onToggleMulti: (option: string) => void;
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

  if (question.type === "single" || question.type === "multi") {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const len = question.options?.length ?? 0;
    // Which option each arrow key would move the highlight to (with wrap).
    const downTarget = len ? (focused + 1) % len : -1;
    const upTarget = len ? (focused - 1 + len) % len : -1;
    return (
      <ul
        ref={optionsRef}
        className={styles.options}
        role="listbox"
        aria-multiselectable={question.type === "multi" || undefined}
      >
        {question.options?.map((option, i) => {
          const isSelected = selected.includes(option);
          const isFocused = i === focused;
          // → acts on the highlighted row; ↓ / ↑ move to the neighbours (wrap).
          const hint = isFocused
            ? "→"
            : i === downTarget
              ? "↓"
              : i === upTarget
                ? "↑"
                : null;
          return (
            <li key={option} style={{ ["--i" as string]: i }}>
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
                  question.type === "single"
                    ? onSelectSingle(option)
                    : onToggleMulti(option)
                }
              >
                <span className={styles.optKeySlot} aria-hidden="true">
                  {hint && <span className={styles.keyCap}>{hint}</span>}
                </span>
                <span className={styles.optionLabel}>{option}</span>
                <span
                  className={`${styles.tick} ${
                    question.type === "multi" ? styles.tickBox : styles.tickDot
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
