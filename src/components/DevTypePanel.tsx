"use client";

import { useEffect } from "react";
import { useDialKit, DialRoot } from "dialkit";
import "dialkit/styles.css";

/**
 * Dev-only DialKit panel for live-tuning the brand-sans section headers
 * (Approach + Pricing). Two dials:
 *   - Weight — font-weight, stepped through the loaded Ryman Gothic weights.
 *   - Size  — an index into the golden-ratio type scale, so the size always
 *             snaps to an existing scale step rather than an arbitrary value.
 *
 * Values are written to --tune-weight / --tune-size on :root; the headers
 * (.tunableHeading) read those vars. Mounted with ssr:false by ShaderControls
 * and never shipped to production, where the headers use their baked-in
 * fallbacks instead.
 */

// Type-scale rungs from globals.css, smallest → largest. The Size dial is an
// index into this list.
const SIZE_STEPS = [
  "--text-xs",
  "--text-sm",
  "--text-md",
  "--text-lg",
  "--text-xl",
  "--text-2xl",
  "--text-3xl",
] as const;

// Dial defaults: heaviest Ryman Gothic weight, --text-xl rung.
const DEFAULT_WEIGHT = 900;
const DEFAULT_SIZE_INDEX = 4; // --text-xl

export default function DevTypePanel() {
  const dial = useDialKit("Section headers", {
    type: {
      // [default, min, max, step]
      weight: [DEFAULT_WEIGHT, 100, 900, 100],
      size: [DEFAULT_SIZE_INDEX, 0, SIZE_STEPS.length - 1, 1],
    },
  });

  const { weight, size } = dial.type;

  useEffect(() => {
    const root = document.documentElement.style;
    const token = SIZE_STEPS[Math.round(size)] ?? SIZE_STEPS[DEFAULT_SIZE_INDEX];
    root.setProperty("--tune-weight", String(weight));
    root.setProperty("--tune-size", `var(${token})`);
    return () => {
      root.removeProperty("--tune-weight");
      root.removeProperty("--tune-size");
    };
  }, [weight, size]);

  return <DialRoot position="top-right" />;
}
