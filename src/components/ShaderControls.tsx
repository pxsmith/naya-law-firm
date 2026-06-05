"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

/**
 * Live values for the shader-lab "Pattern" effect, shaped to match the layer's
 * `params`. `null` when the dev tuning panel isn't open (and always null in
 * production), so the shaders fall back to their baked-in defaults.
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

// The DialKit panel is a development-only tuning tool. Loading it client-side
// only (ssr:false) keeps it out of the server render and away from real
// visitors — the production build never mounts it.
const DevDialPanel = dynamic(() => import("./DevDialPanel"), { ssr: false });

export function ShaderControls({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<PatternParams | null>(null);
  return (
    <ShaderParamsContext.Provider value={params}>
      {children}
      {DEV && <DevDialPanel onChange={setParams} />}
    </ShaderParamsContext.Provider>
  );
}
