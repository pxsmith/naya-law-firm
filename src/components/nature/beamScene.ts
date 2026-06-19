/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  clamp,
  dot,
  exp,
  float,
  floor,
  Fn,
  fract,
  length,
  max,
  mix,
  sin,
  smoothstep,
  step,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";

/**
 * A procedural golden god-ray, rendered as a full-screen fragment so it can be
 * graded by the brand candle+bloom pass and composited over the page.
 *
 * The beam rakes from a fixed off-screen TOP-LEFT source toward a TARGET point
 * (the cursor now; an element's centre later). The shaft is bright along most
 * of its body and EASES OFF as it nears the target, handing off to a separate
 * SPOTLIGHT — a consistent, near-circular soft oval centred on the target whose
 * shape never changes with the beam's angle. fbm haze gives the shaft body and
 * drifting dust motes ride inside it. Warm-white core → golden edges on pure
 * black, so a `screen` blend adds light over the page.
 */

export interface BeamUniforms {
  time: ReturnType<typeof uniform>;
  aspect: ReturnType<typeof uniform>;
  targetX: ReturnType<typeof uniform>;
  targetY: ReturnType<typeof uniform>;
  width: ReturnType<typeof uniform>;
  spread: ReturnType<typeof uniform>;
  softness: ReturnType<typeof uniform>;
  intensity: ReturnType<typeof uniform>;
  dust: ReturnType<typeof uniform>;
  poolSize: ReturnType<typeof uniform>;
  poolIntensity: ReturnType<typeof uniform>;
  poolAspect: ReturnType<typeof uniform>;
  warmth: ReturnType<typeof uniform>;
  srcX: ReturnType<typeof uniform>;
  srcY: ReturnType<typeof uniform>;
  opacity: ReturnType<typeof uniform>;
}

export interface BeamScene {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  uniforms: BeamUniforms;
  setAspect: (aspect: number) => void;
  dispose: () => void;
}

/** Where the beam should aim, in viewport CSS pixels. active=false → rest.
 *  inZone = the cursor is over a section that opts into the beam (the beam fades
 *  out everywhere else, e.g. over video-background sections). */
export type BeamTarget = {
  xPx: number | null;
  yPx: number | null;
  active: boolean;
  inZone: boolean;
  // When set, the beam locks onto this element's live position (scroll-driven
  // "scrollytelling" mode) instead of the cursor.
  el: Element | null;
};

// Phil's dialed-in look (set as the defaults).
export const BEAM_DEFAULTS = {
  width: 0.049,
  spread: 0.7,
  softness: 1.0,
  intensity: 0.1,
  dust: 0.49,
  poolSize: 0.06,
  poolIntensity: 0.14, // the consistent cursor spotlight (was the removed ground pool)
  poolAspect: 2.0, // wider-than-tall oval. 1 = round; >1 wider, <1 taller. Fixed orientation.
  warmth: 0.5,
  srcX: 0.16, // source x as fraction of (aspect-corrected) width
  srcY: 1.05, // source y in uv space (>1 = just above the top edge)
  opacity: 1.0,
};

/** Tunable params surfaced by the dial (beam uniforms + grade bloom override). */
export type BeamParams = {
  width: number;
  spread: number;
  softness: number;
  intensity: number;
  dust: number;
  poolSize: number;
  poolIntensity: number;
  poolAspect: number;
  warmth: number;
  srcX: number;
  srcY: number;
  opacity: number;
  bloomIntensity: number;
  bloomRadius: number;
};

export const DEFAULT_BEAM_PARAMS: BeamParams = {
  ...BEAM_DEFAULTS,
  bloomIntensity: 1.5,
  bloomRadius: 9.75,
};

// ── value-noise fbm (hand-rolled; no reliance on optional TSL noise exports) ──
const hash21 = Fn(([p]: [any]) => {
  const h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h).mul(43758.5453));
});

const valueNoise = Fn(([p]: [any]) => {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(f.mul(-2.0).add(3.0)); // 3f²-2f³ smoothing
  const a = hash21(i);
  const b = hash21(i.add(vec2(1.0, 0.0)));
  const c = hash21(i.add(vec2(0.0, 1.0)));
  const d = hash21(i.add(vec2(1.0, 1.0)));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
});

const fbm = Fn(([p]: [any]) => {
  const o1 = valueNoise(p).mul(0.5);
  const o2 = valueNoise(p.mul(2.03)).mul(0.25);
  const o3 = valueNoise(p.mul(4.01)).mul(0.125);
  return o1.add(o2).add(o3);
});

export function createBeamScene(): BeamScene {
  const uniforms: BeamUniforms = {
    time: uniform(0),
    aspect: uniform(1),
    targetX: uniform(0.8),
    targetY: uniform(0.1),
    width: uniform(BEAM_DEFAULTS.width),
    spread: uniform(BEAM_DEFAULTS.spread),
    softness: uniform(BEAM_DEFAULTS.softness),
    intensity: uniform(BEAM_DEFAULTS.intensity),
    dust: uniform(BEAM_DEFAULTS.dust),
    poolSize: uniform(BEAM_DEFAULTS.poolSize),
    poolIntensity: uniform(BEAM_DEFAULTS.poolIntensity),
    poolAspect: uniform(BEAM_DEFAULTS.poolAspect),
    warmth: uniform(BEAM_DEFAULTS.warmth),
    srcX: uniform(BEAM_DEFAULTS.srcX),
    srcY: uniform(BEAM_DEFAULTS.srcY),
    opacity: uniform(BEAM_DEFAULTS.opacity),
  };

  const vUv = uv();
  const aspect = uniforms.aspect;
  const p = vec2(vUv.x.mul(aspect), vUv.y); // aspect-corrected, y-up

  const S = vec2(uniforms.srcX.mul(aspect), uniforms.srcY);
  const target = vec2(uniforms.targetX, uniforms.targetY);
  const tv = target.sub(S);
  const reach = max(length(tv), 0.0001); // beam reaches the target (cursor)
  const dir = tv.div(reach); // aim from source → target

  const toP = p.sub(S);
  const t = dot(toP, dir); // distance along the beam
  const tC = clamp(t, 0.0, reach);
  const proj = S.add(dir.mul(tC));
  const perp = length(p.sub(proj)); // perpendicular distance to the axis
  const tNorm = t.div(reach); // 0 at source → 1 at target

  // soft gaussian shaft that widens slightly with distance
  const w = uniforms.width.mul(
    float(1.0).add(clamp(tNorm, 0.0, 1.0).mul(uniforms.spread)),
  );
  const core = exp(perp.mul(perp).div(w.mul(w).mul(uniforms.softness)).mul(-1.0));
  // Bright most of the way; fades out as it nears the target so the directional
  // streak no longer forms the spot. Slight source emphasis (light entering).
  const fade = float(1.0).sub(smoothstep(0.78, 1.0, tNorm));
  const srcEmph = float(0.7).add(clamp(float(1.0).sub(tNorm), 0.0, 1.0).mul(0.3));
  const behind = step(0.0, t);
  const haze = float(0.6).add(
    fbm(p.mul(6.0).add(vec2(0.0, uniforms.time.mul(-0.06)))).mul(0.6),
  );
  const shaft = core.mul(fade).mul(srcEmph).mul(behind).mul(haze);

  // drifting dust motes, riding inside the (fading) shaft
  const dn = valueNoise(
    p.mul(90.0).add(vec2(uniforms.time.mul(0.4), uniforms.time.mul(-0.8))),
  );
  const dust = smoothstep(0.86, 1.0, dn)
    .mul(core)
    .mul(fade)
    .mul(uniforms.dust)
    .mul(behind);

  // Consistent spotlight at the TARGET — fixed orientation, near-circular, so it
  // reads the same shape wherever the cursor is (independent of the beam angle).
  const sd = p.sub(target);
  const sdist = length(vec2(sd.x, sd.y.mul(uniforms.poolAspect)));
  const pool = exp(
    sdist.mul(sdist).div(uniforms.poolSize.mul(uniforms.poolSize)).mul(-1.0),
  ).mul(uniforms.poolIntensity);

  const inten = shaft.mul(uniforms.intensity).add(dust).add(pool);

  // warm-white core → golden edge
  const gold = mix(vec3(1.0, 0.82, 0.52), vec3(1.0, 0.6, 0.22), uniforms.warmth);
  const warmWhite = vec3(1.0, 0.95, 0.86);
  const col = mix(gold, warmWhite, smoothstep(0.0, 0.9, clamp(inten, 0.0, 1.0)));
  const outRgb = col.mul(inten).mul(uniforms.opacity);

  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = outRgb;
  material.depthTest = false;
  material.depthWrite = false;

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(mesh);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    scene,
    camera,
    uniforms,
    setAspect: (a: number) => {
      uniforms.aspect.value = a;
    },
    dispose: () => {
      material.dispose();
      (mesh.geometry as THREE.PlaneGeometry).dispose();
    },
  };
}
