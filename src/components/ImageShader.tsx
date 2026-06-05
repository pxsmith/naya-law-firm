"use client";

import { useMemo } from "react";
import {
  ShaderLabComposition,
  type ShaderLabConfig,
  type ShaderLabLayerConfig,
} from "@basementstudio/shader-lab";
import { useShaderPatternParams, type PatternParams } from "./ShaderControls";

/**
 * Shared shader settings for images, matching the exact styling as VideoShader.
 */

const EFFECT_LAYERS: ShaderLabLayerConfig[] = [
  {
    blendMode: "normal",
    compositeMode: "filter",
    maskConfig: {
      invert: false,
      mode: "multiply",
      source: "luminance",
    },
    hue: 0,
    id: "cd9f491c-1914-4e61-8f96-f04dc652518a",
    kind: "effect",
    name: "Pattern",
    opacity: 1,
    params: {
      cellSize: 6,
      preset: "candles",
      colorMode: "source",
      monoColor: "#f5f5f0",
      bgOpacity: 0,
      invert: false,
      customColorCount: 4,
      customLuminanceBias: 0,
      customBgColor: "#000000",
      customColor1: "#000000",
      customColor2: "#4d5057",
      customColor3: "#969aa2",
      customColor4: "#e1e2de",
      bloomEnabled: true,
      bloomIntensity: 1.11,
      bloomThreshold: 0.24,
      bloomRadius: 9.75,
      bloomSoftness: 0.77,
    },
    saturation: 1,
    type: "pattern",
    visible: true,
  },
  {
    blendMode: "normal",
    compositeMode: "filter",
    maskConfig: {
      invert: false,
      mode: "multiply",
      source: "luminance",
    },
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
  },
];

const IMAGE_LAYER_DEFAULTS = {
  blendMode: "normal" as const,
  compositeMode: "filter" as const,
  maskConfig: {
    invert: false,
    mode: "multiply" as const,
    source: "luminance" as const,
  },
  hue: 10,
  kind: "source" as const,
  opacity: 1,
  params: {
    fitMode: "cover",
    scale: 0.65,
    offset: [0, 0] as [number, number],
  },
  saturation: 1,
  type: "image" as const,
  visible: true,
};

const TIMELINE = {
  duration: 1,
  loop: true,
  tracks: [],
};

function buildConfig(
  src: string,
  fileName: string,
  live: PatternParams | null,
): ShaderLabConfig {
  const imageLayer: ShaderLabLayerConfig = {
    ...IMAGE_LAYER_DEFAULTS,
    id: `image-${fileName || src}`,
    name: "Image",
    asset: { fileName, kind: "image", src },
  };
  // Layer 0 is the Pattern effect; overlay live tuning values onto its params.
  const [pattern, ...rest] = EFFECT_LAYERS;
  const patternLayer: ShaderLabLayerConfig = live
    ? { ...pattern, params: { ...pattern.params, ...live } }
    : pattern;
  return {
    layers: [patternLayer, ...rest, imageLayer],
    timeline: TIMELINE,
  };
}

interface Props {
  src: string;
  fileName?: string;
  className?: string;
}

export default function ImageShader({ src, fileName = "", className }: Props) {
  const live = useShaderPatternParams();
  const config = useMemo(
    () => buildConfig(src, fileName, live),
    [src, fileName, live],
  );
  return (
    <div className={className}>
      <ShaderLabComposition
        config={config}
        onRuntimeError={(msg) => {
          if (msg) {
            // eslint-disable-next-line no-console
            console.error("[shader-lab]", msg);
          }
        }}
      />
    </div>
  );
}
