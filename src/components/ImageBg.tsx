"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface Props {
  src: string;
  fileName?: string;
  className?: string;
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
export function ImageBg({ src, fileName, className }: Props) {
  const [supportsWebGpu, setSupportsWebGpu] = useState<boolean | null>(null);

  useEffect(() => {
    setSupportsWebGpu(
      typeof navigator !== "undefined" && "gpu" in navigator,
    );
  }, []);

  if (supportsWebGpu === true) {
    return <ImageShader src={src} fileName={fileName} className={className} />;
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
