"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Loads the homepage's background videos one at a time, hero first.
 *
 * The problem: the homepage has four background videos. Left alone, the desktop
 * shader path mounts all four on first paint and they all start downloading at
 * once — so the hero, the only one anybody can actually see yet, is competing
 * for bandwidth with three videos that are thousands of pixels down the page.
 *
 * The fix is a queue rather than scroll-triggering. Scroll-triggering would fix
 * the contention but trades it for a stall: you scroll, and *then* the video
 * starts loading. Instead the hero loads immediately, and as soon as it can play
 * through, the rest warm up on their own — one at a time, so they never race the
 * hero or each other. By the time you scroll, they're already there.
 *
 * Ordering is registration order, which is DOM order, which is the order you
 * scroll past them.
 */

type Start = (done: () => void) => void;

const pending: Start[] = [];
let begun = false;
let running = false;

/** How long a single video may hold the queue before we move on regardless. */
const STEP_TIMEOUT_MS = 8000;
/** Upper bound on waiting for an idle moment before starting anyway. */
const IDLE_TIMEOUT_MS = 2000;

function whenIdle(run: () => void) {
  if (typeof window === "undefined") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
  } else {
    // Safari has no requestIdleCallback. A short timeout is close enough — we
    // only want to be after the current paint, not precisely at an idle point.
    window.setTimeout(run, 200);
  }
}

function drain() {
  if (running) return;
  const start = pending.shift();
  if (!start) return;

  running = true;
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    window.clearTimeout(timer);
    running = false;
    whenIdle(drain);
  };
  // A video that never reports back (blocked request, decode failure, a tab
  // backgrounded mid-load) must not strand everything behind it.
  const timer = window.setTimeout(advance, STEP_TIMEOUT_MS);
  start(advance);
}

function begin() {
  if (begun) return;
  begun = true;
  whenIdle(drain);
}

let priorityReady = false;
const priorityListeners = new Set<() => void>();

/**
 * Called by the priority video once it's genuinely on screen — playable on the
 * raw path, actually painting on the shader path. Opens the gate for everything
 * else, and tells the intro overlay it can lift.
 */
export function signalPriorityReady() {
  if (!priorityReady) {
    priorityReady = true;
    for (const listener of priorityListeners) listener();
    priorityListeners.clear();
  }
  begin();
}

/**
 * Subscribe to the moment the above-the-fold background is showing. Fires
 * immediately if that already happened.
 */
export function onPriorityReady(listener: () => void): () => void {
  if (priorityReady) {
    listener();
    return () => {};
  }
  priorityListeners.add(listener);
  return () => priorityListeners.delete(listener);
}

if (typeof window !== "undefined") {
  // Safety net. The gate must not depend solely on a priority video reporting
  // in: a page might have no priority video at all, or the hero's `canplaythrough`
  // may never fire (it doesn't, reliably, on some iOS versions). Falling back to
  // window load means the worst case is "warms a bit later", never "never warms".
  if (document.readyState === "complete") {
    whenIdle(begin);
  } else {
    window.addEventListener("load", () => whenIdle(begin), { once: true });
  }
}

/**
 * Claims a slot in the warm-up queue.
 *
 * `priority` videos (the one above the fold) skip the queue entirely and are warm
 * from the first render. Everything else waits its turn.
 *
 * Call `markDone` once the video has what it needs, to hand the queue to the next
 * one. Forgetting to call it isn't fatal — the queue times out and moves on.
 */
export function useWarmSlot(priority: boolean, enabled = true) {
  const [warm, setWarm] = useState(priority);
  const doneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // `enabled` is false when this background will never load a video at all
    // (reduced motion). Taking a slot in that case would park the queue on this
    // entry until it times out, delaying the videos that do need warming.
    if (priority || !enabled) return;
    let cancelled = false;
    const start: Start = (done) => {
      if (cancelled) {
        // Unmounted while queued — release the queue immediately.
        done();
        return;
      }
      doneRef.current = done;
      setWarm(true);
    };
    pending.push(start);
    if (begun) whenIdle(drain);

    return () => {
      cancelled = true;
      const i = pending.indexOf(start);
      if (i >= 0) pending.splice(i, 1);
      doneRef.current?.();
      doneRef.current = null;
    };
  }, [priority, enabled]);

  const markDone = useCallback(() => {
    doneRef.current?.();
    doneRef.current = null;
  }, []);

  return { warm, markDone };
}

/**
 * Pulls a video into the HTTP cache without creating a decoder.
 *
 * This is the whole trick that lets us warm videos ahead of time on a phone.
 * Attaching a real <video> is what allocates a hardware decoder and decoded
 * frame buffers, and four of those at once is what crashed iOS Safari before
 * (see the mobile gating fix in 189f8eb). A plain fetch costs only the bytes.
 * When the <video> does eventually attach, it reads from cache and starts
 * instantly.
 *
 * The body has to actually be consumed, or the browser may cancel the stream
 * before the response is complete and cacheable.
 */
export function useWarmFetch(
  src: string,
  enabled: boolean,
  onDone: () => void,
): boolean {
  const [fetched, setFetched] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();

    fetch(src, { signal: controller.signal, credentials: "same-origin" })
      .then((res) => res.blob())
      // A failed warm-up is not an error worth surfacing: the video will simply
      // load normally when it's needed.
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        setFetched(true);
        onDoneRef.current();
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [src, enabled]);

  return fetched;
}
