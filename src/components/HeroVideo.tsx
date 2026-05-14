"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface Props {
  className?: string;
}

const HeroVideoShader = dynamic(() => import("./HeroVideoShader"), {
  ssr: false,
  loading: () => null,
});

/**
 * Hero background video.
 *
 * - WebGPU available → renders the Shader Lab composition (with effects).
 * - WebGPU unavailable → falls back to a plain <video> element so the hero
 *   still has motion on Firefox, older browsers, and devices without WebGPU.
 */
export function HeroVideo({ className }: Props) {
  const [supportsWebGpu, setSupportsWebGpu] = useState<boolean | null>(null);

  useEffect(() => {
    setSupportsWebGpu(
      typeof navigator !== "undefined" && "gpu" in navigator,
    );
  }, []);

  // SSR + first render: render the plain video so we paint something
  // immediately. On hydration, if WebGPU is supported, swap in the shader.
  if (supportsWebGpu === true) {
    return <HeroVideoShader className={className} />;
  }

  return (
    <video
      className={className}
      src="/videos/hero.mp4"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
