"use client";

import { useEffect } from "react";
import { useDialKit, DialRoot } from "dialkit";
import "dialkit/styles.css";
import type { PatternParams } from "./ShaderControls";

/**
 * Live control panel mirroring the shader-lab "Pattern" properties panel
 * (SETTINGS + BLOOM). Dev-only — mounted with ssr:false by ShaderControls.
 * Drag a control and the value flows up via onChange → context → every
 * <VideoShader> / <ImageShader> on the page, retuning them in real time.
 *
 * Defaults exactly match the dialed-in shader: bloom 1.11 / 0.24 / 9.75 / 0.77.
 */
export default function DevDialPanel({
  onChange,
}: {
  onChange: (p: PatternParams) => void;
}) {
  const dial = useDialKit("Pattern", {
    settings: {
      cellSize: [6, 1, 32, 1],
      preset: { type: "select", options: ["candles"], default: "candles" },
      colorMode: {
        type: "select",
        options: ["source", "mono", "duo-tone", "custom"],
        default: "source",
      },
      background: [0, 0, 1, 0.01],
      invert: false,
    },
    bloom: {
      enabled: true,
      intensity: [1.11, 0, 3, 0.01],
      threshold: [0.24, 0, 1, 0.01],
      radius: [9.75, 0, 20, 0.05],
      softness: [0.77, 0, 1, 0.01],
    },
  });

  const { settings, bloom } = dial;

  useEffect(() => {
    onChange({
      cellSize: settings.cellSize,
      preset: settings.preset,
      colorMode: settings.colorMode,
      bgOpacity: settings.background,
      invert: settings.invert,
      bloomEnabled: bloom.enabled,
      bloomIntensity: bloom.intensity,
      bloomThreshold: bloom.threshold,
      bloomRadius: bloom.radius,
      bloomSoftness: bloom.softness,
    });
  }, [
    onChange,
    settings.cellSize,
    settings.preset,
    settings.colorMode,
    settings.background,
    settings.invert,
    bloom.enabled,
    bloom.intensity,
    bloom.threshold,
    bloom.radius,
    bloom.softness,
  ]);

  return <DialRoot position="top-right" />;
}
