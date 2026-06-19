"use client";

import { useEffect } from "react";
import { useDialKit, DialRoot } from "dialkit";
import "dialkit/styles.css";
import { DEFAULT_BEAM_PARAMS, type BeamParams } from "./beamScene";

/**
 * Dev-only DialKit panel for tuning the golden beam live. Each dial is
 * [default, min, max, step]; defaults mirror DEFAULT_BEAM_PARAMS so opening it
 * doesn't jump the look.
 */
export default function BeamDialPanel({
  onChange,
}: {
  onChange: (p: BeamParams) => void;
}) {
  const dial = useDialKit("Golden beam", {
    beam: {
      intensity: [DEFAULT_BEAM_PARAMS.intensity, 0, 3, 0.01],
      width: [DEFAULT_BEAM_PARAMS.width, 0.005, 0.25, 0.001],
      spread: [DEFAULT_BEAM_PARAMS.spread, 0, 2, 0.01],
      softness: [DEFAULT_BEAM_PARAMS.softness, 0.3, 3, 0.01],
      warmth: [DEFAULT_BEAM_PARAMS.warmth, 0, 1, 0.01],
      dust: [DEFAULT_BEAM_PARAMS.dust, 0, 2, 0.01],
      opacity: [DEFAULT_BEAM_PARAMS.opacity, 0, 1, 0.01],
    },
    source: {
      srcX: [DEFAULT_BEAM_PARAMS.srcX, -0.5, 1.0, 0.01],
      srcY: [DEFAULT_BEAM_PARAMS.srcY, 0.5, 1.3, 0.01],
    },
    spotlight: {
      poolSize: [DEFAULT_BEAM_PARAMS.poolSize, 0.02, 0.4, 0.005],
      poolIntensity: [DEFAULT_BEAM_PARAMS.poolIntensity, 0, 3, 0.01],
      poolAspect: [DEFAULT_BEAM_PARAMS.poolAspect, 0.5, 2.0, 0.05],
    },
    grade: {
      bloomIntensity: [DEFAULT_BEAM_PARAMS.bloomIntensity, 0, 2, 0.01],
      bloomRadius: [DEFAULT_BEAM_PARAMS.bloomRadius, 0, 20, 0.05],
    },
  });

  const { intensity, width, spread, softness, warmth, dust, opacity } =
    dial.beam;
  const { srcX, srcY } = dial.source;
  const { poolSize, poolIntensity, poolAspect } = dial.spotlight;
  const { bloomIntensity, bloomRadius } = dial.grade;

  useEffect(() => {
    onChange({
      width,
      spread,
      softness,
      intensity,
      dust,
      poolSize,
      poolIntensity,
      poolAspect,
      warmth,
      srcX,
      srcY,
      opacity,
      bloomIntensity,
      bloomRadius,
    });
  }, [
    width,
    spread,
    softness,
    intensity,
    dust,
    poolSize,
    poolIntensity,
    poolAspect,
    warmth,
    srcX,
    srcY,
    opacity,
    bloomIntensity,
    bloomRadius,
    onChange,
  ]);

  return <DialRoot position="top-right" />;
}
