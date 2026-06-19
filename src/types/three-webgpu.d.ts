/* eslint-disable @typescript-eslint/no-explicit-any */
// three 0.183 ships the `three/webgpu` and `three/tsl` entry points as JS only
// (no bundled .d.ts), and this project has no @types/three. These ambient
// declarations cover just the surface used by the nature/light components —
// typed loosely (any) since three's WebGPU/TSL API is untyped here. Classes
// double as both type and value so `new THREE.Scene()` and `: THREE.Scene`
// both work.
declare module "three/webgpu" {
  export class WebGPURenderer {
    constructor(opts?: any);
    [k: string]: any;
  }
  export class Scene {
    [k: string]: any;
  }
  export class Mesh {
    constructor(geometry?: any, material?: any);
    [k: string]: any;
  }
  export class OrthographicCamera {
    constructor(...args: any[]);
    [k: string]: any;
  }
  export class PlaneGeometry {
    constructor(...args: any[]);
    [k: string]: any;
  }
  export class RenderTarget {
    constructor(...args: any[]);
    [k: string]: any;
  }
  export class WebGLRenderTarget {
    constructor(...args: any[]);
    [k: string]: any;
  }
  export class MeshBasicNodeMaterial {
    [k: string]: any;
  }
  export class Texture {
    [k: string]: any;
  }
  export const AdditiveBlending: number;
  export const LinearFilter: number;
  export const SRGBColorSpace: any;
  export const NoToneMapping: any;
}

declare module "three/tsl" {
  export const Fn: any;
  export const attribute: any;
  export const float: any;
  export const vec2: any;
  export const vec3: any;
  export const uv: any;
  export const uniform: any;
  export const texture: any;
  export const sin: any;
  export const cos: any;
  export const exp: any;
  export const pow: any;
  export const abs: any;
  export const floor: any;
  export const fract: any;
  export const dot: any;
  export const length: any;
  export const mix: any;
  export const clamp: any;
  export const smoothstep: any;
  export const max: any;
  export const min: any;
  export const step: any;
  export const mul: any;
}
