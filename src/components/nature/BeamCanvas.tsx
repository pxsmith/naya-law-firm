"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { float, texture as tslTexture, uv, vec2 } from "three/tsl";
import { ShaderLabPostProcessingSource } from "@basementstudio/shader-lab";
import { buildGradeConfig } from "../brandGrade";
import {
  createBeamScene,
  type BeamParams,
  type BeamScene,
  type BeamTarget,
} from "./beamScene";
import styles from "./BeamCanvas.module.css";

const MAX_DPR = 1.5;

/**
 * Renders the procedural golden beam through Naya's real candlelight grade and
 * presents it on a fixed, full-viewport, screen-blended overlay.
 *
 * The beam aims at a TARGET fed via `targetRef` (viewport CSS px). Here that's
 * the cursor; the same input can later be an element's centre. The target is
 * damped each frame so the beam follows smoothly rather than snapping, and
 * eases to a rest position when the cursor leaves.
 *
 * `params` drives the beam uniforms + the grade's bloom; changing it never
 * tears down the GPU.
 */
export default function BeamCanvas({
  params,
  targetRef,
}: {
  params: BeamParams;
  targetRef: { current: BeamTarget };
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beamRef = useRef<BeamScene | null>(null);
  const ppRef = useRef<ShaderLabPostProcessingSource | null>(null);
  const paramsRef = useRef(params);

  // Push param changes onto the live scene without re-initialising the GPU.
  useEffect(() => {
    paramsRef.current = params;
    const beam = beamRef.current;
    if (beam) {
      const u = beam.uniforms;
      u.width.value = params.width;
      u.spread.value = params.spread;
      u.softness.value = params.softness;
      u.intensity.value = params.intensity;
      u.dust.value = params.dust;
      u.poolSize.value = params.poolSize;
      u.poolIntensity.value = params.poolIntensity;
      u.poolAspect.value = params.poolAspect;
      u.warmth.value = params.warmth;
      u.srcX.value = params.srcX;
      u.srcY.value = params.srcY;
      u.opacity.value = params.opacity;
    }
    ppRef.current?.setConfig(
      buildGradeConfig({
        bloomIntensity: params.bloomIntensity,
        bloomRadius: params.bloomRadius,
      }),
    );
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (typeof navigator === "undefined" || !("gpu" in navigator)) return;

    let disposed = false;
    let raf = 0;
    let ready = false;
    let pageVisible = true;
    let lastMs: number | null = null;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const renderer = new THREE.WebGPURenderer({
      canvas,
      alpha: false,
      antialias: false,
    });

    let beam: BeamScene | null = null;
    let beamRT: THREE.RenderTarget | null = null;
    let presentScene: THREE.Scene | null = null;
    let presentCam: THREE.OrthographicCamera | null = null;
    let presentMat: THREE.MeshBasicNodeMaterial | null = null;
    let presentMesh: THREE.Mesh | null = null;
    let presentTexNode: ReturnType<typeof tslTexture> | null = null;

    let cssW = Math.max(1, Math.round(wrap.clientWidth));
    let cssH = Math.max(1, Math.round(wrap.clientHeight));

    // Damped aim point the beam tracks (aspect-corrected space, y-up). A settled
    // beam follows this so it stays on a word as the page scrolls.
    let curAimX = 0.9;
    let curAimY = 0.12;
    // Bloom progress (0 = off, 1 = full). The beam sits at full length on the
    // word and blooms in place — growing in thickness + brightness on enter and
    // shrinking/dimming on exit — rather than travelling.
    let bloom = 0;
    // Identity of the current aim; a change re-triggers the bloom at the new spot.
    let lastKey: Element | string = "none";

    // Bloom tuning. Exit is slower than enter so the light lingers as it leaves.
    const BLOOM_IN = 0.55;
    const BLOOM_OUT = 0.8;
    const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

    const applyParams = () => {
      if (!beam) return;
      const p = paramsRef.current;
      const u = beam.uniforms;
      u.width.value = p.width;
      u.spread.value = p.spread;
      u.softness.value = p.softness;
      u.intensity.value = p.intensity;
      u.dust.value = p.dust;
      u.poolSize.value = p.poolSize;
      u.poolIntensity.value = p.poolIntensity;
      u.poolAspect.value = p.poolAspect;
      u.warmth.value = p.warmth;
      u.srcX.value = p.srcX;
      u.srcY.value = p.srcY;
      u.opacity.value = p.opacity;
    };

    const shouldAnimate = () =>
      ready && pageVisible && !reducedMotion && !disposed;

    const updateTarget = (dt: number) => {
      if (!beam) return;
      const aspect = cssW / cssH;
      const p = paramsRef.current;
      const k = dt > 0 ? Math.min(1, dt * 30) : 1;
      const tr = targetRef.current;
      // `inZone` is the real liveness gate (xPx/yPx persist once set).
      const active =
        !reducedMotion &&
        tr.inZone &&
        (tr.el != null || (tr.xPx !== null && tr.yPx !== null));

      if (active) {
        // Desired aim (aspect space, y-up).
        let dx = aspect * 0.55;
        let dy = 0.12;
        if (tr.el) {
          // element-lock: aim at the element's live centre (tracks scroll)
          const r = tr.el.getBoundingClientRect();
          dx = Math.max(0, Math.min(1, (r.left + r.width / 2) / cssW)) * aspect;
          dy = 1 - Math.max(0, Math.min(1, (r.top + r.height / 2) / cssH));
        } else if (tr.xPx !== null && tr.yPx !== null) {
          // cursor-follow
          dx = Math.max(0, Math.min(1, tr.xPx / cssW)) * aspect;
          dy = 1 - Math.max(0, Math.min(1, tr.yPx / cssH));
        }

        // What are we aiming at? When it changes, snap the aim to the new spot
        // (no slide) and re-bloom from zero there.
        const key: Element | string = tr.el ?? "cursor";
        if (key !== lastKey) {
          lastKey = key;
          curAimX = dx;
          curAimY = dy;
          bloom = 0;
        }

        // Damp the aim every frame so a settled beam keeps tracking the word.
        curAimX += (dx - curAimX) * k;
        curAimY += (dy - curAimY) * k;
      } else {
        // Inactive: hold the aim in place (no slide to a rest point) and let the
        // bloom shrink/dim out where the word was. lastKey="none" so re-entry to
        // any target blooms in cleanly.
        lastKey = "none";
      }

      // Integrate the bloom toward full (active) or zero (inactive); exit slower.
      if (dt > 0) {
        const step = dt / (active ? BLOOM_IN : BLOOM_OUT);
        bloom = active ? Math.min(1, bloom + step) : Math.max(0, bloom - step);
      }
      const e = easeOutCubic(bloom);

      // Full length on the word — no travel. The damp only moves the aim when the
      // word itself scrolls.
      const u = beam.uniforms;
      u.targetX.value = curAimX;
      u.targetY.value = curAimY;
      // Thickness + spotlight size grow from a floor (kept subtle, and high
      // enough to avoid a razor-thin shaft under the bloom post pass).
      u.width.value = p.width * (0.5 + 0.5 * e);
      u.poolSize.value = p.poolSize * (0.55 + 0.45 * e);
      // Brightness via the inten-driving uniforms (not opacity), so the shader's
      // gold-edge → warm-white-core grading shifts naturally as it brightens.
      u.intensity.value = p.intensity * e;
      u.poolIntensity.value = p.poolIntensity * e;
      u.dust.value = p.dust * e;
      // opacity is the on/off kill (hidden under reduced motion), not the bloom.
      u.opacity.value = reducedMotion ? 0 : p.opacity;
    };

    const renderNow = (nowMs: number) => {
      if (!beam || !beamRT || !presentScene || !presentCam || !presentTexNode) {
        return;
      }
      const tSec = reducedMotion ? 0 : nowMs / 1000;
      const dt = lastMs === null ? 0 : Math.min(0.1, (nowMs - lastMs) / 1000);
      lastMs = nowMs;

      beam.uniforms.time.value = tSec;
      beam.setAspect(cssW / cssH);
      // updateTarget drives the aim, bloom, and all bloom-animated uniforms
      // (width/poolSize/intensity/poolIntensity/dust/opacity).
      updateTarget(dt);

      renderer.setRenderTarget(beamRT);
      renderer.render(beam.scene, beam.camera);

      const graded = ppRef.current?.update(beamRT.texture, tSec, dt) ?? null;
      presentTexNode.value = graded ?? beamRT.texture;

      renderer.setRenderTarget(null);
      renderer.render(presentScene, presentCam);
    };

    const frame = (nowMs: number) => {
      raf = 0;
      if (disposed) return;
      renderNow(nowMs);
      if (shouldAnimate()) raf = requestAnimationFrame(frame);
    };
    const ensureRunning = () => {
      if (!raf && shouldAnimate()) raf = requestAnimationFrame(frame);
    };
    const renderStatic = () => {
      if (ready && !disposed) renderNow(performance.now());
    };

    const applySize = () => {
      cssW = Math.max(1, Math.round(wrap.clientWidth));
      cssH = Math.max(1, Math.round(wrap.clientHeight));
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssW, cssH, false);
      beamRT?.setSize(cssW, cssH);
      ppRef.current?.resize(cssW, cssH, dpr);
      if (!shouldAnimate()) renderStatic();
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      lastMs = null;
      ensureRunning();
    };
    const ro = new ResizeObserver(() => applySize());

    const start = async () => {
      await renderer.init();
      if (disposed) {
        renderer.dispose();
        return;
      }
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor(0x000000, 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssW, cssH, false);

      beam = createBeamScene();
      beamRef.current = beam;
      beam.setAspect(cssW / cssH);

      beamRT = new THREE.RenderTarget(cssW, cssH, {
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });
      beamRT.texture.colorSpace = THREE.SRGBColorSpace;

      const pp = new ShaderLabPostProcessingSource(
        buildGradeConfig({
          bloomIntensity: paramsRef.current.bloomIntensity,
          bloomRadius: paramsRef.current.bloomRadius,
        }),
        { renderer, width: cssW, height: cssH, pixelRatio: dpr },
      );
      ppRef.current = pp;
      await pp.initialize();
      if (disposed) return;

      const flippedUv = vec2(uv().x, float(1).sub(uv().y));
      presentTexNode = tslTexture(beamRT.texture, flippedUv);
      presentMat = new THREE.MeshBasicNodeMaterial();
      presentMat.colorNode = presentTexNode;
      presentMat.depthTest = false;
      presentMat.depthWrite = false;
      presentMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), presentMat);
      presentMesh.frustumCulled = false;
      presentScene = new THREE.Scene();
      presentScene.add(presentMesh);
      presentCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      applyParams();
      ready = true;
      ro.observe(wrap);
      document.addEventListener("visibilitychange", onVisibility);

      if (reducedMotion) renderStatic();
      else ensureRunning();
    };

    void start().catch(() => {
      /* WebGPU init failed — leave the overlay blank. */
    });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ppRef.current?.dispose();
      ppRef.current = null;
      presentMat?.dispose();
      (presentMesh?.geometry as THREE.PlaneGeometry | undefined)?.dispose();
      beamRT?.dispose();
      beam?.dispose();
      beamRef.current = null;
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className={styles.overlay} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
