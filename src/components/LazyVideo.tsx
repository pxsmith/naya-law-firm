"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  /** Still frame shown until (and whenever) the video isn't decoding. */
  poster?: string;
  className?: string;
}

/**
 * Background <video> that only decodes while it's near the viewport.
 *
 * Four eager autoplay videos (~157MB) decoding at once is enough to crash
 * iOS Safari on its own — even without the shader path. So instead of
 * `autoPlay`, we attach the source and play only when the section is near
 * screen, and we pause + release the decoder when it scrolls far away. The
 * `poster` stays painted the whole time, so the section never shows a blank
 * or a spinner — it looks like the video paused on a still.
 */
export function LazyVideo({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === "undefined") {
      // No observer support → just load and play eagerly as a safe fallback.
      if (video && !video.src) {
        video.src = src;
        void video.play().catch(() => {});
      }
      return;
    }

    const attachAndPlay = () => {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", src);
        video.load();
      }
      // iOS may reject play() outside a gesture; muted + playsInline normally
      // permits it. Swallow the rejection and let the poster stand in.
      void video.play().catch(() => {});
    };

    const releaseDecoder = () => {
      video.pause();
      // Dropping the src frees the decoded frames from memory. The poster
      // keeps the section looking finished while unloaded.
      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) attachAndPlay();
          else releaseDecoder();
        }
      },
      // Start loading just before it enters view so the motion is ready in time.
      { rootMargin: "200px 0px" },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      releaseDecoder();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
