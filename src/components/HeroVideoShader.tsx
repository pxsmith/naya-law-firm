"use client";

import {
  ShaderLabComposition,
  type ShaderLabConfig,
} from "@basementstudio/shader-lab";

/**
 * Placeholder composition: a video source layer + a single bloom effect.
 * Replace this `config` with whatever you export from the Shader Lab
 * editor at https://shaderlab.basement.studio — same `ShaderLabConfig`
 * shape, just swap the asset.src to "/videos/hero.mp4".
 */
const config: ShaderLabConfig = {
  composition: { width: 1920, height: 1080 },
  layers: [
    {
      id: "video-source",
      name: "Hero Video",
      kind: "source",
      type: "video",
      asset: { kind: "video", src: "/videos/hero.mp4" },
      blendMode: "normal",
      compositeMode: "filter",
      hue: 0,
      saturation: 1,
      opacity: 1,
      params: {},
      visible: true,
    },
    {
      id: "bloom",
      name: "Bloom",
      kind: "effect",
      type: "bloom",
      blendMode: "normal",
      compositeMode: "filter",
      hue: 0,
      saturation: 1,
      opacity: 1,
      params: {},
      visible: true,
    },
  ],
  timeline: { duration: 6, loop: true, tracks: [] },
};

interface Props {
  className?: string;
}

export default function HeroVideoShader({ className }: Props) {
  return (
    <ShaderLabComposition
      className={className}
      config={config}
      onRuntimeError={(msg) =>
        // eslint-disable-next-line no-console
        console.error("[shader-lab]", msg)
      }
    />
  );
}
