"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
  const [supportsWebGpu, setSupportsWebGpu] = useState<boolean | null>(null);

  useEffect(() => {
    setSupportsWebGpu(
      typeof navigator !== "undefined" && "gpu" in navigator,
    );
  }, []);

  if (supportsWebGpu === true) {
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
    />
  );
}
