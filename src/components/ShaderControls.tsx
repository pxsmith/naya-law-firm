"use client";

import { createContext, useContext, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { BeamControls } from "./nature/BeamControls";

/**
 * Live values for the shader-lab "Pattern" effect, shaped to match the layer's
 * `params`. The shaders are no longer dial-controlled, so this context is
 * always `null` and every <VideoShader> / <ImageShader> renders with its
 * baked-in defaults. The type is kept because both shaders import it.
 */
export type PatternParams = {
  cellSize: number;
  preset: string;
  colorMode: string;
  bgOpacity: number;
  invert: boolean;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  bloomSoftness: number;
};

const ShaderParamsContext = createContext<PatternParams | null>(null);

export function useShaderPatternParams() {
  return useContext(ShaderParamsContext);
}

const DEV = process.env.NODE_ENV !== "production";

// Show the dev DialKit panel on screen. Kept wired up (component + dynamic
// import below stay intact) but hidden for now — flip this to `true` to bring
// the "Section headers" tuning panel back.
const SHOW_DIAL_PANEL = false;

// The DialKit panel now tunes the brand-sans section headers (font weight +
// size) instead of the shaders. Dev-only and client-only (ssr:false) so it
// never reaches production or the server render.
const DevTypePanel = dynamic(() => import("./DevTypePanel"), { ssr: false });

// Golden-beam: live in production + development. Activates on cursor zones,
// scroll-locked targets, and hover over `data-beam-hover` elements (the Get
// Pricing CTAs). Flip to `false` to remove it entirely.
const SHOW_BEAM = true;

export function ShaderControls({ children }: { children: ReactNode }) {
  // Shaders read this context and fall back to their baked-in defaults when
  // it's null — which it always is now.
  return (
    <ShaderParamsContext.Provider value={null}>
      {children}
      {DEV && SHOW_DIAL_PANEL && <DevTypePanel />}
      {SHOW_BEAM && <BeamControls />}
    </ShaderParamsContext.Provider>
  );
}
