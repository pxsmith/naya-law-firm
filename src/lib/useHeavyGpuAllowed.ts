"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for "should we run the heavy WebGPU / shader path?"
 *
 * The homepage's shader compositions + golden-beam canvas are gorgeous on a
 * desktop GPU but will exhaust an iPhone's per-tab memory budget and get the
 * Safari tab killed ("A problem repeatedly occurred"). So we only light up the
 * heavy path on mouse-class, desktop-width devices and fall back to plain
 * <video>/<img> everywhere else.
 *
 * Returns:
 *   null  — not yet determined (SSR + first client paint). Render the light
 *           fallback so server and client markup match (no hydration mismatch).
 *   true  — has WebGPU AND looks like a device that can afford the heavy stack.
 *   false — no WebGPU, or a phone/tablet/constrained device → light fallback.
 *
 * IMPORTANT: all `navigator` / `matchMedia` reads happen inside useEffect, never
 * during render, so SSR and the first client render both emit the fallback.
 */
export function useHeavyGpuAllowed(): boolean | null {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      setAllowed(false);
      return;
    }

    const hasWebGpu = "gpu" in navigator;

    // A real mouse-class pointer. Phones/tablets report `(hover: none) and
    // (pointer: coarse)` even on Safari 26 (which DOES expose WebGPU), so this
    // is the single strongest "not a phone" discriminator — and it's already
    // trusted elsewhere in this codebase (BeamControls cursor logic).
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    // Desktop-class width — guards small/foldable windows and phone landscape.
    const wideEnough = window.matchMedia("(min-width: 900px)").matches;

    // Honor reduced-motion: skip the continuously-animating beam entirely.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Soft memory veto. `deviceMemory` is Chromium-only (undefined on Safari /
    // Firefox), so it can only ever veto, never be the sole reason we allow.
    const deviceMemory = (
      navigator as Navigator & { deviceMemory?: number }
    ).deviceMemory;
    const lowMemory = typeof deviceMemory === "number" && deviceMemory < 4;

    setAllowed(
      hasWebGpu && finePointer && wideEnough && !reducedMotion && !lowMemory,
    );
  }, []);

  return allowed;
}
