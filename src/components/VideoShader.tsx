"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShaderLabComposition,
  type ShaderLabConfig,
  type ShaderLabLayerConfig,
} from "@basementstudio/shader-lab";
import { useShaderPatternParams, type PatternParams } from "./ShaderControls";

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

// Fallback only — each <VideoShader> should pass its video's real duration so
// the composition loop boundary lands exactly on the (seamless) video loop.
const DEFAULT_DURATION = 10;

function buildConfig(
  src: string,
  fileName: string,
  duration: number,
  live: PatternParams | null,
): ShaderLabConfig {
  const videoLayer: ShaderLabLayerConfig = {
    ...VIDEO_LAYER_DEFAULTS,
    id: `video-${fileName || src}`,
    name: "Video",
    asset: { fileName, kind: "video", src },
  };
  // Layer 0 is the Pattern effect; overlay live tuning values onto its params.
  const [pattern, ...rest] = EFFECT_LAYERS;
  const patternLayer: ShaderLabLayerConfig = live
    ? { ...pattern, params: { ...pattern.params, ...live } }
    : pattern;
  return {
    layers: [patternLayer, ...rest, videoLayer],
    // Per-video duration keeps the composition clock in sync with the video's
    // own (now seamless) loop, so the desktop shader path has no visible reset.
    timeline: { duration, loop: true, tracks: [] },
  };
}

/**
 * How long to wait before showing this section anyway, if we never hear that its
 * video started. Only guards against a section staying invisible forever — it
 * does NOT report readiness, because an earlier version did exactly that and the
 * false "ready" was what lifted the intro onto a black hero.
 */
const SELF_REVEAL_FALLBACK_MS = 6000;

interface Props {
  src: string;
  fileName?: string;
  className?: string;
  /** The video's real duration in seconds (drives the loop timeline). */
  duration?: number;
  /**
   * Is the video actually rolling? Owned by VideoBg, which listens for the
   * composition's own video element to start. This component deliberately does
   * not try to work it out for itself — see shaderVideoWatch.ts for the three
   * ways of guessing that were tried and failed.
   */
  live?: boolean;
}

export default function VideoShader({
  src,
  fileName = "",
  className,
  duration = DEFAULT_DURATION,
  live = false,
}: Props) {
  const params = useShaderPatternParams();
  const config = useMemo(
    () => buildConfig(src, fileName, duration, params),
    [src, fileName, duration, params],
  );

  // Never heard that the video started. Show the section anyway rather than
  // leaving it permanently blank — but only its own appearance is affected;
  // nothing is told that the hero is ready.
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    if (live) return;
    const t = window.setTimeout(() => setGaveUp(true), SELF_REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [live]);

  const visible = live || gaveUp;

  return (
    <div
      className={className}
      style={{
        // The shared `.sectionVideo` rule fades this element in on mount, which
        // is far too early — it would fade up a blank canvas while the shader is
        // still coming online, then pop to the real image once it arrives.
        animation: "none",
        opacity: visible ? 1 : 0,
        // Cross-fades with the loading overlay dissolving above it, so the
        // handover reads as one movement. It also buys tolerance: the exact
        // moment the renderer draws its first frame can't be observed, and a
        // fade absorbs that slack where a hard cut would expose it.
        transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
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
