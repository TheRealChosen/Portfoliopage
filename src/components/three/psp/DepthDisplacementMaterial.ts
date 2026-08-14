import * as THREE from "three";
import { vhsScreenFragmentChunk } from "./VHSScreenMaterial";
import { screenInverseHomography } from "./screenHomography";
import type { ScreenUVQuad } from "@/data/projects";

export type DepthDisplacementUniforms = {
  uColorMap: { value: THREE.Texture | null };
  uDepthMap: { value: THREE.Texture | null };
  uDisplacement: { value: number };
  uVideoMap: { value: THREE.Texture | null };
  uHasVideo: { value: number };
  uVideoPlaying: { value: number };
  uMediaIsImage: { value: number };
  uScreenInvHomography: { value: THREE.Matrix3 };
  uTime: { value: number };
  uVhsIntensity: { value: number };
};

const vertexShader = /* glsl */ `
uniform sampler2D uDepthMap;
uniform float uDisplacement;

varying vec2 vUv;

void main() {
  vUv = uv;
  float depth = texture2D(uDepthMap, uv).r;
  vec3 displaced = position + normal * depth * uDisplacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uColorMap;
uniform float uMediaIsImage;
varying vec2 vUv;

${vhsScreenFragmentChunk}

void main() {
  vec4 photo = texture2D(uColorMap, vUv);
  vec3 color = photo.rgb;
  float alpha = photo.a;

  if (uHasVideo > 0.5 && uVideoPlaying > 0.5 && inScreen(vUv)) {
    vec2 screenUV = mapScreenUV(vUv);
    vec3 media = sampleVhs(screenUV);
    float edge =
      smoothstep(0.0, 0.02, screenUV.x) *
      smoothstep(0.0, 0.02, screenUV.y) *
      smoothstep(0.0, 0.02, 1.0 - screenUV.x) *
      smoothstep(0.0, 0.02, 1.0 - screenUV.y);
    color = mix(color, media, edge);
    // Transparent LCD hole in psp-100.png — keep media visible inside the cutout.
    alpha = max(alpha, edge);
  }

  gl_FragColor = vec4(color, alpha);
}
`;

const DEFAULT_QUAD: ScreenUVQuad = {
  tl: { u: 0.263, v: 0.72 },
  tr: { u: 0.785, v: 0.642 },
  bl: { u: 0.187, v: 0.427 },
  br: { u: 0.714, v: 0.335 },
};

export function createDepthDisplacementMaterial(
  colorMap: THREE.Texture,
  depthMap: THREE.Texture,
  options?: {
    displacement?: number;
    screenUVQuad?: ScreenUVQuad;
  }
): THREE.ShaderMaterial {
  const q = options?.screenUVQuad ?? DEFAULT_QUAD;

  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.needsUpdate = true;
  depthMap.needsUpdate = true;

  const uniforms: DepthDisplacementUniforms = {
    uColorMap: { value: colorMap },
    uDepthMap: { value: depthMap },
    uDisplacement: { value: options?.displacement ?? 0.35 },
    uVideoMap: { value: null },
    uHasVideo: { value: 0 },
    uVideoPlaying: { value: 0 },
    uMediaIsImage: { value: 0 },
    uScreenInvHomography: { value: screenInverseHomography(q) },
    uTime: { value: 0 },
    uVhsIntensity: { value: 1 },
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
}

const overlayFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uColorMap;
varying vec2 vUv;

void main() {
  vec4 photo = texture2D(uColorMap, vUv);
  if (photo.a < 0.08) discard;
  gl_FragColor = vec4(photo.rgb, photo.a);
}
`;

/** Full-size cutout layer (e.g. D-pad) sharing the base depth map. */
export function createDepthOverlayMaterial(
  colorMap: THREE.Texture,
  depthMap: THREE.Texture,
  options?: { displacement?: number }
): THREE.ShaderMaterial {
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.needsUpdate = true;
  depthMap.needsUpdate = true;

  return new THREE.ShaderMaterial({
    uniforms: {
      uColorMap: { value: colorMap },
      uDepthMap: { value: depthMap },
      uDisplacement: { value: options?.displacement ?? 0.35 },
    },
    vertexShader,
    fragmentShader: overlayFragmentShader,
    transparent: true,
    depthWrite: true,
  });
}
