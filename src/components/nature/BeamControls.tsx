"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useHeavyGpuAllowed } from "@/lib/useHeavyGpuAllowed";
import {
  DEFAULT_BEAM_PARAMS,
  type BeamParams,
  type BeamTarget,
} from "./beamScene";

/**
 * Holds the golden-beam params + the aim target, and wires the (dev-only)
 * tuning dial to the rendered overlay. WebGPU-gated.
 *
 * The beam is OFF by default and only appears in two kinds of zones:
 *
 *  1. CURSOR zones — sections marked `data-beam-zone`. While the cursor is over
 *     one, the beam follows the cursor (the hero→Approach dark stretch).
 *
 *  2. ELEMENT-LOCK zones — any element marked `data-beam-target`. While that
 *     element is on screen, the beam locks onto it and tracks it as the page
 *     scrolls (scrollytelling), independent of the cursor. Takes priority over
 *     cursor zones.
 *
 * BeamCanvas reads the resolved `targetRef` each frame and fades in/out.
 */

const DEV = process.env.NODE_ENV !== "production";

// Show the dev DialKit panel for live-tuning the golden beam. Kept wired up but
// hidden for now — flip to `true` to bring the tuning panel back.
const SHOW_DIAL_PANEL = false;

const BeamCanvas = dynamic(() => import("./BeamCanvas"), {
  ssr: false,
  loading: () => null,
});
const BeamDialPanel = dynamic(() => import("./BeamDialPanel"), { ssr: false });

export function BeamControls() {
  const [params, setParams] = useState<BeamParams>(DEFAULT_BEAM_PARAMS);
  const allowed = useHeavyGpuAllowed();
  const targetRef = useRef<BeamTarget>({
    xPx: null,
    yPx: null,
    active: false,
    inZone: false,
    el: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const cursor = { x: 0, y: 0, present: false };
    // Element currently hovered via `data-beam-hover` (the Get Pricing CTAs).
    let hoverEl: Element | null = null;

    // Resolve what the beam should aim at: a hovered CTA first, else an in-view
    // element-lock target (scroll-driven), else the cursor while over a cursor
    // zone, else nothing.
    const recompute = () => {
      const t = targetRef.current;
      const vh = window.innerHeight;
      // Hover takes top priority — bloom over the CTA and track it (same
      // element-lock path the shader already follows each frame).
      if (hoverEl) {
        t.el = hoverEl;
        t.inZone = true;
        return;
      }
      // Lock onto the in-view target nearest the viewport centre, so adjacent
      // keyword targets (e.g. About → Pricing) hand off cleanly as you scroll.
      const targets = document.querySelectorAll("[data-beam-target]");
      let best: Element | null = null;
      let bestDist = Infinity;
      let incumbentDist = Infinity;
      const incumbent = t.el; // currently-locked target, if any
      const mid = vh / 2;
      for (const el of Array.from(targets)) {
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        if (cy > 0 && cy < vh) {
          const d = Math.abs(cy - mid);
          if (d < bestDist) {
            bestDist = d;
            best = el;
          }
          if (el === incumbent) incumbentDist = d;
        }
      }
      // Hysteresis: while the locked target is still in view, only switch to a
      // new one if it's closer to centre by a clear margin. Without this, two
      // words straddling the centre flip-flop and the beam strobes/re-descends.
      const margin = vh * 0.15;
      if (incumbent && incumbentDist !== Infinity && bestDist > incumbentDist - margin) {
        best = incumbent;
      }
      if (best) {
        t.el = best;
        t.inZone = true;
        return;
      }
      t.el = null;
      if (
        finePointer &&
        cursor.present &&
        document
          .elementFromPoint(cursor.x, cursor.y)
          ?.closest("[data-beam-zone]")
      ) {
        t.xPx = cursor.x;
        t.yPx = cursor.y;
        t.active = true;
        t.inZone = true;
        return;
      }
      t.inZone = false;
    };

    const onMove = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.present = true;
      recompute();
    };
    const onScrollOrResize = () => recompute();
    const onLeave = () => {
      cursor.present = false;
      hoverEl = null;
      targetRef.current.active = false;
      recompute();
    };

    // Delegated hover on the Get Pricing CTAs (marked `data-beam-hover`).
    const onHoverOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest("[data-beam-hover]");
      if (el && el !== hoverEl) {
        hoverEl = el;
        recompute();
      }
    };
    const onHoverOut = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest("[data-beam-hover]");
      const next = (e.relatedTarget as Element | null)?.closest(
        "[data-beam-hover]",
      );
      // Ignore moves between children of the same CTA.
      if (el && el !== next) {
        hoverEl = null;
        recompute();
      }
    };

    if (finePointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
      document.addEventListener("pointerover", onHoverOver, { passive: true });
      document.addEventListener("pointerout", onHoverOut, { passive: true });
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    recompute();

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerover", onHoverOver);
      document.removeEventListener("pointerout", onHoverOut);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  if (allowed !== true) return null;

  return (
    <>
      <BeamCanvas params={params} targetRef={targetRef} />
      {DEV && SHOW_DIAL_PANEL && <BeamDialPanel onChange={setParams} />}
    </>
  );
}
