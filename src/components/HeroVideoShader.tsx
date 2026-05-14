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
 *
 * Note: intentionally omitting `composition` so the runtime sizes the
 * canvas from its container instead of locking to a 16:9 aspect-ratio.
 */
const config: ShaderLabConfig = {
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
    <div className={className}>
      <ShaderLabComposition
        config={config}
        onRuntimeError={(msg) => {
          // null is sent when an error is cleared — only log real errors.
          if (msg) {
            // eslint-disable-next-line no-console
            console.error("[shader-lab]", msg);
          }
        }}
      />
    </div>
  );
}
