"use client";

import dynamic from "next/dynamic";
import { useHeavyGpuAllowed } from "@/lib/useHeavyGpuAllowed";
import { LazyVideo } from "./LazyVideo";

interface Props {
  src: string;
  fileName?: string;
  className?: string;
  /** Still frame for the light/mobile fallback so it never shows blank. */
  poster?: string;
}

const VideoShader = dynamic(() => import("./VideoShader"), {
  ssr: false,
  loading: () => null,
});

/**
 * Background video with shader effects applied.
 *
 * - Heavy GPU path allowed (desktop-class device with WebGPU) → renders the
 *   Shader Lab composition (shared config lives in VideoShader.tsx).
 * - Otherwise (phones, reduced-motion, no WebGPU) → a lazy <video> that only
 *   decodes near the viewport, so four background videos never crash mobile.
 */
export function VideoBg({ src, fileName, className, poster }: Props) {
  const allowed = useHeavyGpuAllowed();

  if (allowed === true) {
    return <VideoShader src={src} fileName={fileName} className={className} />;
  }

  return <LazyVideo src={src} poster={poster} className={className} />;
}
