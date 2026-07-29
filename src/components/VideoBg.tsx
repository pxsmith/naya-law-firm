"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { watchShaderVideo } from "@/lib/shaderVideoWatch";
import {
  useHeavyGpuAllowed,
  usePrefersReducedMotion,
} from "@/lib/useHeavyGpuAllowed";
import {
  signalPriorityReady,
  useWarmFetch,
  useWarmSlot,
} from "@/lib/videoWarmQueue";
import { LazyVideo } from "./LazyVideo";

interface Props {
  src: string;
  fileName?: string;
  className?: string;
  /** Still frame for the light/mobile fallback so it never shows blank. */
  poster?: string;
  /**
   * Pre-graded still — the desktop candlelight look (candles + bloom) baked into
   * a static image. When provided, the light/mobile path shows THIS instead of
   * the raw video, so phones match the desktop look and skip the video download.
   */
  posterGraded?: string;
  /** Video duration (seconds) — keeps the shader loop synced to the video. */
  duration?: number;
  /**
   * The one video above the fold. Loads immediately, and opens the warm-up queue
   * for the rest of the page once it's ready. Exactly one per page.
   */
  priority?: boolean;
}

/**
 * Grace period after the video reports `playing`, before anything is revealed.
 *
 * `playing` is the earliest honest signal available, but it is not the same
 * moment as "there are pixels on screen" — the library still has to build the
 * texture and the renderer still has to draw it. Measured from a screen
 * recording: the picture appeared ~450ms after playback began. 150ms was not
 * nearly enough, and the reveal landed on a black hero.
 *
 * This does not have to be exact, because the hero cross-fades in rather than
 * snapping; the fade absorbs whatever is left.
 */
const POST_PLAY_SETTLE_MS = 400;

const loadVideoShader = () => import("./VideoShader");

const VideoShader = dynamic(loadVideoShader, {
  ssr: false,
  loading: () => null,
});

/**
 * Background video, rendered three different ways depending on the visitor.
 *
 * - Reduced motion → the poster still, and no video is ever requested. A
 *   full-screen autoplaying video is exactly what that setting asks us not to do,
 *   and it makes this the lightest version of the page.
 * - Heavy GPU path allowed (desktop-class device with WebGPU) → the Shader Lab
 *   composition (shared config lives in VideoShader.tsx).
 * - Otherwise (phones, Firefox, older Safari, no WebGPU) → a lazy <video> that
 *   only decodes near the viewport, so four background videos never crash mobile.
 *
 * Both video paths get the same file: `VideoShader` takes a bare `src`, so there
 * is no way to serve the shader a lower-quality cut than the raw path. The raw
 * path therefore sets the quality floor for the encode.
 */
export function VideoBg({
  src,
  fileName,
  className,
  poster,
  posterGraded,
  duration,
  priority = false,
}: Props) {
  const allowed = useHeavyGpuAllowed();
  const reducedMotion = usePrefersReducedMotion();

  // Light/mobile path with a pre-graded still available: show the still instead
  // of the raw video (lighter, and matches the desktop shader look). These
  // backgrounds therefore want no video downloaded at all.
  const rawStill = allowed === false && !!posterGraded;

  // Both hooks report null until measured on the client. Until then, and forever
  // for reduced-motion visitors, this background loads no video whatsoever.
  const wantsVideo = reducedMotion === false && allowed !== null && !rawStill;
  const isRawPath = wantsVideo && allowed === false;

  const { warm, markDone } = useWarmSlot(priority, wantsVideo);

  // Start pulling the shader chunk as soon as we know we're on the shader path,
  // in parallel with fetching the video bytes. Otherwise the chunk download is
  // dead time at the front of the load that nothing else is using.
  useEffect(() => {
    if (allowed === true) void loadVideoShader();
  }, [allowed]);

  /** Has the shader's video actually started rolling? */
  const [live, setLive] = useState(false);

  // Listen from HERE, not from inside VideoShader. React runs child effects
  // before parent effects, so a watcher installed by the shader component can
  // miss the very element it is looking for. This effect runs long before the
  // composition mounts, since that waits on the fetch below.
  useEffect(() => {
    if (allowed !== true) return;
    let settle: number | undefined;
    const stop = watchShaderVideo(src, () => {
      // A beat after playback starts, so WebGPU has drawn a frame of it.
      settle ??= window.setTimeout(() => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.info(
            `[VideoBg] ${src} live at ${Math.round(performance.now())}ms${priority ? " (priority — lifting intro)" : ""}`,
          );
        }
        setLive(true);
        if (priority) signalPriorityReady();
      }, POST_PLAY_SETTLE_MS);
    });
    return () => {
      stop();
      window.clearTimeout(settle);
    };
  }, [allowed, src, priority]);

  // Warm the bytes into the HTTP cache before mounting the shader — including
  // for the priority video, so that by the time the shader comes up the video is
  // local and starts from frame 0 immediately.
  //
  // The one exception is the priority video on the raw path: LazyVideo attaches
  // that one to a real <video> straight away, so prefetching it too would pull
  // the same file down twice, concurrently.
  const shouldPrefetch = wantsVideo && warm && !(isRawPath && priority);
  const prefetched = useWarmFetch(src, shouldPrefetch, markDone);

  // Without a poster there is nothing to show, so render nothing rather than an
  // <img> with no src (which browsers resolve against the page URL and refetch it).
  const stillSrc = posterGraded ?? poster;
  const stillOnly = stillSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={stillSrc} alt="" aria-hidden="true" />
  ) : null;

  // `reducedMotion` is null on the server and the first client paint. Rendering
  // the still in that window means the markup matches on both sides, and it's
  // already the right answer if the visitor does prefer reduced motion.
  if (reducedMotion !== false) return stillOnly;

  if (allowed === true) {
    // Deliberately NO poster on this path. The shader repaints the image into
    // posterized cells with bloom, so a raw still underneath would visibly
    // "change" when the shader takes over. Instead the section's own black
    // background shows through until the shader is painting, and the video is
    // already rolling from frame 0 the first time it's seen — no swap.
    if (!prefetched) return null;
    return (
      <VideoShader
        src={src}
        fileName={fileName}
        className={className}
        duration={duration}
        live={live}
      />
    );
  }

  // Light/mobile path. With a pre-graded still, show it (no video) so phones get
  // the desktop look as a fast static image. Otherwise fall back to the lazy video.
  if (rawStill) return stillOnly;

  return (
    <LazyVideo
      src={src}
      poster={poster}
      className={className}
      priority={priority}
    />
  );
}
