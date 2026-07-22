"use client";

import { useEffect, useState } from "react";
import { onPriorityReady } from "@/lib/videoWarmQueue";
import styles from "./BrandIntro.module.css";

/**
 * Whether the intro has already played in this page load.
 *
 * Module scope is exactly the right lifetime here: it survives client-side
 * navigations away from and back to the homepage (so the intro doesn't replay
 * when you click "Home"), and it resets on a real page load — which is correct,
 * because a real load genuinely has to warm the shader up again, so there is
 * something to cover.
 *
 * Deliberately NOT sessionStorage. Persisting across reloads would mean the
 * server renders the overlay and the client immediately removes it, which is
 * both a visible flash and, if you try to suppress it by stamping <html> before
 * paint, a hydration mismatch.
 */
let playedThisPageLoad = false;

/**
 * Hang guard, not a timing choice. The intro ends when the hero is actually
 * showing a picture — there is deliberately no minimum time on screen.
 *
 * This has to be generous, and 3000 was not. Measured on a cold load, the hero
 * video file alone did not finish downloading until 4033ms, so a 3s cap lifted
 * the overlay before the video even existed — which was one of the two causes
 * of the flash. Anything that lifts the intro on a clock rather than on the
 * hero being ready is a bug; this number exists only so a dead GPU or a stalled
 * network can't leave someone staring at a logo forever.
 */
const MAX_HOLD_MS = 8000;
/** Must match the transition duration in .leaving. */
const EXIT_MS = 620;

/**
 * The first-load screen.
 *
 * It exists to solve a specific problem: on desktop the background is a WebGPU
 * shader composition, which takes a beat to come online and paints nothing until
 * it does. Without this you get black, then a pop. Holding the page for that beat
 * means the video is already rolling from its first frame when it's revealed.
 *
 * It lifts on whichever comes first: the hero reporting that it's painting, or
 * MAX_HOLD_MS. It plays once per page load, and never for reduced-motion
 * visitors (who get stills, so there's nothing to wait for).
 */
export function BrandIntro() {
  const [leaving, setLeaving] = useState(false);
  // Read the flag during the first render rather than in an effect, so a
  // client-side navigation back here renders nothing at all instead of showing
  // the overlay for a frame and then pulling it.
  const [gone, setGone] = useState(() => playedThisPageLoad);

  useEffect(() => {
    if (playedThisPageLoad) return;

    let exitTimer: number | undefined;
    const lift = () => {
      playedThisPageLoad = true;
      // Releases the hero's staggered entrance (see page.module.css). It has to
      // be here rather than on mount: these animations used to run while the
      // overlay was still covering them, finishing unseen, so the whole hero
      // landed in one lump the instant the overlay went.
      document.documentElement.setAttribute("data-entrance", "");
      setLeaving(true);
      exitTimer = window.setTimeout(() => setGone(true), EXIT_MS);
    };

    const unsubscribe = onPriorityReady(lift);
    const cap = window.setTimeout(lift, MAX_HOLD_MS);

    return () => {
      unsubscribe();
      window.clearTimeout(cap);
      if (exitTimer) window.clearTimeout(exitTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      data-brand-intro=""
      className={`${styles.overlay} ${leaving ? styles.leaving : ""}`}
      // Decorative and transient: it must never be announced, and it must never
      // swallow focus from the page underneath it.
      aria-hidden="true"
      inert
    >
      <div className={styles.inner}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.mark}
          src="/brand/naya-logo.png"
          alt=""
          width={567}
          height={112}
          decoding="sync"
        />
        <div className={styles.rule} />
      </div>
    </div>
  );
}
