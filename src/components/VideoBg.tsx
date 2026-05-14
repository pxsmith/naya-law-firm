"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface Props {
  src: string;
  fileName?: string;
  className?: string;
}

const VideoShader = dynamic(() => import("./VideoShader"), {
  ssr: false,
  loading: () => null,
});

/**
 * Background video with shader effects applied.
 *
 * - WebGPU available → renders the Shader Lab composition (shared config
 *   lives in VideoShader.tsx; effects update everywhere at once).
 * - WebGPU unavailable → falls back to a plain <video> element so the
 *   section still has motion on Firefox / older browsers.
 */
export function VideoBg({ src, fileName, className }: Props) {
  const [supportsWebGpu, setSupportsWebGpu] = useState<boolean | null>(null);

  useEffect(() => {
    setSupportsWebGpu(
      typeof navigator !== "undefined" && "gpu" in navigator,
    );
  }, []);

  if (supportsWebGpu === true) {
    return <VideoShader src={src} fileName={fileName} className={className} />;
  }

  return (
    <video
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
