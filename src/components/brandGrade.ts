import type {
  ShaderLabConfig,
  ShaderLabLayerConfig,
  ShaderLabParameterValue,
} from "@basementstudio/shader-lab";

/**
 * Single source of truth for Naya's "candlelight" grade — the shader-lab
 * `Pattern` effect (candle halftone + bloom) plus the hidden `Dithering` layer.
 * Copied verbatim from the look baked into VideoShader.tsx so anything graded
 * through here matches the video sections exactly.
 *
 * `colorMode: "source"` means the candle glyphs keep the SOURCE's own color, so
 * a warm/golden source (e.g. the sunbeam) stays warm and just picks up the
 * brand candle texture + bloom on top.
 */

const PATTERN_PARAMS = {
  cellSize: 6,
  preset: "candles",
  colorMode: "source",
  monoColor: "#f5f5f0",
  bgOpacity: 0,
  invert: false,
  customColorCount: 4,
  customLuminanceBias: 0,
  customBgColor: "#F5F5F0",
  customColor1: "#0d1014",
  customColor2: "#4d5057",
  customColor3: "#969aa2",
  customColor4: "#e1e2de",
  bloomEnabled: true,
  bloomIntensity: 1.11,
  bloomThreshold: 0.24,
  bloomRadius: 9.75,
  bloomSoftness: 0.77,
} as const;

const DITHERING_LAYER: ShaderLabLayerConfig = {
  blendMode: "normal",
  compositeMode: "filter",
  maskConfig: { invert: false, mode: "multiply", source: "luminance" },
  hue: 0,
  id: "2d60dce5-49ab-47c9-8e08-16dab995fc5f",
  kind: "effect",
  name: "Dithering",
  opacity: 1,
  params: {
    preset: "gameboy",
    algorithm: "bayer-2x2",
    colorMode: "duo-tone",
    monoColor: "#f5f5f0",
    shadowColor: "#0f380f",
    highlightColor: "#9bbc0f",
    pixelSize: 3,
    spread: 0.5,
    levels: 4,
    dotScale: 1,
    animateDither: false,
    ditherSpeed: 1,
    chromaticSplit: false,
  },
  saturation: 1,
  type: "dithering",
  visible: false,
};

type ParamOverrides = Record<string, ShaderLabParameterValue> | null;

function patternLayer(overrides: ParamOverrides): ShaderLabLayerConfig {
  return {
    blendMode: "normal",
    compositeMode: "filter",
    maskConfig: { invert: false, mode: "multiply", source: "luminance" },
    hue: 0,
    id: "cd9f491c-1914-4e61-8f96-f04dc652518a",
    kind: "effect",
    name: "Pattern",
    opacity: 1,
    params: { ...PATTERN_PARAMS, ...(overrides ?? {}) },
    saturation: 1,
    type: "pattern",
    visible: true,
  };
}

const TIMELINE = { duration: 1, loop: true, tracks: [] };

/**
 * A grade-only ShaderLabConfig (no source layer) for the post-processing path.
 * The input texture supplied to `postprocessing.render(texture, …)` IS the
 * source; these effect layers composite on top. The hidden Dithering layer is
 * filtered out at frame-build time, exactly as on the live site.
 */
export function buildGradeConfig(
  overrides: ParamOverrides = null,
): ShaderLabConfig {
  return {
    layers: [patternLayer(overrides), DITHERING_LAYER],
    timeline: TIMELINE,
  };
}
