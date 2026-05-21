"use client";

import {
  ShaderLabComposition,
  type ShaderLabConfig,
  type ShaderLabLayerConfig,
} from "@basementstudio/shader-lab";

/**
 * Shared shader settings. Effects (Pattern, Dithering) and timeline are
 * defined once here; the video source is parameterized per instance.
 *
 * To retune the look across the whole site (hero + contact + anywhere
 * else <VideoShader> is used), re-export from
 * https://shaderlab.basement.studio and paste over EFFECT_LAYERS /
 * VIDEO_LAYER_DEFAULTS / TIMELINE below.
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
      customBgColor: "#F5F5F0",
      customColor1: "#0d1014",
      customColor2: "#4d5057",
      customColor3: "#969aa2",
      customColor4: "#e1e2de",
      bloomEnabled: true,
      bloomIntensity: 1.25,
      bloomThreshold: 0,
      bloomRadius: 6,
      bloomSoftness: 0.35,
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

const VIDEO_LAYER_DEFAULTS = {
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
    scale: 1,
    offset: [0, 0] as [number, number],
    playbackRate: 1,
  },
  saturation: 1,
  type: "video" as const,
  visible: true,
};

const TIMELINE = {
  duration: 23.481792,
  loop: true,
  tracks: [],
};

function buildConfig(src: string, fileName: string): ShaderLabConfig {
  const videoLayer: ShaderLabLayerConfig = {
    ...VIDEO_LAYER_DEFAULTS,
    id: `video-${fileName || src}`,
    name: "Video",
    asset: { fileName, kind: "video", src },
  };
  return {
    layers: [...EFFECT_LAYERS, videoLayer],
    timeline: TIMELINE,
  };
}

interface Props {
  src: string;
  fileName?: string;
  className?: string;
}

export default function VideoShader({ src, fileName = "", className }: Props) {
  return (
    <div className={className}>
      <ShaderLabComposition
        config={buildConfig(src, fileName)}
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
