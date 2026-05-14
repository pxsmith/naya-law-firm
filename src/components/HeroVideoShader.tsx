"use client";

import {
  ShaderLabComposition,
  type ShaderLabConfig,
} from "@basementstudio/shader-lab";

/**
 * Composition exported from shaderlab.basement.studio.
 * Source paths rewritten from `/replace/video/...` to the actual
 * `/videos/...` paths served from public/. The visible video layer
 * ("Video 3") is the active one; the other two video layers are
 * preserved from the editor export but flagged invisible.
 *
 * Re-export from the editor and paste over this `config` to update.
 */
const config: ShaderLabConfig = {
  layers: [
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
        cellSize: 12,
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
    {
      blendMode: "normal",
      compositeMode: "filter",
      maskConfig: {
        invert: false,
        mode: "multiply",
        source: "luminance",
      },
      hue: 10,
      id: "2bec8781-b9fa-45ec-bc5d-89e5f4e61924",
      kind: "source",
      name: "Video 3",
      opacity: 1,
      params: {
        fitMode: "cover",
        scale: 1,
        offset: [0, 0],
        playbackRate: 1,
      },
      saturation: 1,
      type: "video",
      visible: true,
      asset: {
        fileName: "Stocksy_unlicensed_comp_watermarked_2907984.mp4",
        kind: "video",
        src: "/videos/Stocksy_unlicensed_comp_watermarked_2907984.mp4",
      },
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
      id: "16b2bb8d-9f18-4bf3-978b-1c0d194a9de0",
      kind: "source",
      name: "Video 2",
      opacity: 1,
      params: {
        fitMode: "cover",
        scale: 1,
        offset: [0, 0],
        playbackRate: 1,
      },
      saturation: 1,
      type: "video",
      visible: false,
      asset: {
        fileName: "Stocksy_unlicensed_comp_watermarked_6191856.mp4",
        kind: "video",
        src: "/videos/Stocksy_unlicensed_comp_watermarked_6191856.mp4",
      },
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
      id: "ca7458b9-8ccb-4b09-8c65-f6dcb04b16c8",
      kind: "source",
      name: "Video",
      opacity: 1,
      params: {
        fitMode: "cover",
        scale: 1,
        offset: [0, 0],
        playbackRate: 1,
      },
      saturation: 1,
      type: "video",
      visible: false,
      asset: {
        fileName: "Stocksy_unlicensed_comp_watermarked_5257325.mp4",
        kind: "video",
        src: "/videos/Stocksy_unlicensed_comp_watermarked_5257325.mp4",
      },
    },
  ],
  timeline: {
    duration: 23.481792,
    loop: true,
    tracks: [],
  },
};

interface Props {
  className?: string;
}

export default function HeroVideoShader({ className }: Props) {
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
