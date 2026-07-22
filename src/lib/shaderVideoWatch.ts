"use client";

/**
 * Knowing when a shader background is genuinely showing its video.
 *
 * ShaderLabComposition exposes no ready callback, and three ways of inferring it
 * were tried and failed. Recorded here so nobody repeats them:
 *
 *   1. "Wait for the <canvas> to exist, then settle briefly." A mounted canvas is
 *      nowhere near a painting one — this revealed the hero ~250ms early.
 *   2. "Wait a fixed time and hope." Same guess, different number. On a cold load
 *      the video file alone took 4s to arrive, so any fixed guess loses.
 *   3. "Snapshot the canvas and look for a picture." Measured on a real, fully
 *      sized (3406x1428) WebGPU canvas in Chrome: createImageBitmap returns a
 *      FULLY TRANSPARENT image. A WebGPU canvas does not retain its drawing
 *      buffer after presenting, so there is nothing to read back. Dead end.
 *
 * What is left is the signal the library itself uses. Its `createVideoTexture`
 * builds a DETACHED <video> (never inserted into the page, which is why no DOM
 * query finds it), and resolves the texture only once that video fires `playing`.
 * The composition therefore CANNOT display a frame before `playing` has fired —
 * which makes it correct by construction rather than by estimate.
 *
 * The elements are created inside the library, so the only way to reach them is
 * to watch document.createElement while a composition is coming up. The patch is
 * shared, reference counted, and removed again as soon as nothing is listening.
 */

type VideoListener = (video: HTMLVideoElement) => void;

const listeners = new Set<VideoListener>();
let nativeCreateElement: typeof document.createElement | null = null;

function install() {
  if (nativeCreateElement) return;
  nativeCreateElement = document.createElement;
  document.createElement = function patchedCreateElement(
    this: Document,
    ...args: Parameters<Document["createElement"]>
  ) {
    const el = nativeCreateElement!.apply(this, args);
    if (el instanceof HTMLVideoElement) {
      for (const notify of listeners) notify(el);
    }
    return el;
  } as typeof document.createElement;
}

function uninstallIfIdle() {
  if (listeners.size > 0 || !nativeCreateElement) return;
  document.createElement = nativeCreateElement;
  nativeCreateElement = null;
}

/** Same clip? Compare resolved paths, since the element's src may be relative. */
function isSameSource(video: HTMLVideoElement, src: string): boolean {
  const actual = video.currentSrc || video.src;
  if (!actual) return false;
  try {
    return (
      new URL(actual, window.location.href).pathname ===
      new URL(src, window.location.href).pathname
    );
  } catch {
    return false;
  }
}

/**
 * Calls `onPlaying` once the shader's video for `src` has actually started.
 * Returns a cancel function.
 *
 * Start this BEFORE the composition mounts. Child effects run before parent
 * effects in React, so watching from inside the shader component itself can miss
 * the element it is trying to catch.
 */
export function watchShaderVideo(
  src: string,
  onPlaying: () => void,
): () => void {
  let cancelled = false;
  const undo: Array<() => void> = [];

  const listener: VideoListener = (video) => {
    const handle = () => {
      if (cancelled || !isSameSource(video, src)) return;
      onPlaying();
    };
    video.addEventListener("playing", handle);
    undo.push(() => video.removeEventListener("playing", handle));
  };

  listeners.add(listener);
  install();

  return () => {
    cancelled = true;
    listeners.delete(listener);
    while (undo.length) undo.pop()?.();
    uninstallIfIdle();
  };
}
