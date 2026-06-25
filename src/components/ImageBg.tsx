"use client";

import dynamic from "next/dynamic";
import { useHeavyGpuAllowed } from "@/lib/useHeavyGpuAllowed";

interface Props {
  src: string;
  fileName?: string;
  className?: string;
  /** Overrides the shader's image scale (default 0.65). Larger = bigger fill. */
  scale?: number;
  /** Overrides the shader's image offset (default [0, 0]). */
  offset?: [number, number];
}

const ImageShader = dynamic(() => import("./ImageShader"), {
  ssr: false,
  loading: () => null,
});

/**
 * Background image with shader effects applied.
 *
 * - WebGPU available → renders the Shader Lab composition.
 * - WebGPU unavailable → falls back to a plain <img> element.
 */
export function ImageBg({ src, fileName, className, scale, offset }: Props) {
  const allowed = useHeavyGpuAllowed();

  if (allowed === true) {
    return (
      <ImageShader
        src={src}
        fileName={fileName}
        className={className}
        scale={scale}
        offset={offset}
      />
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt="Fern asset"
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}
