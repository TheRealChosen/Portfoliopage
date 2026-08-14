import * as THREE from "three";

/**
 * VHS fragment chunk + perspective screen mapping via inverse homography.
 * Screen is a perspective quad in UV space (tilted PSP photo).
 */

export const vhsScreenFragmentChunk = /* glsl */ `
uniform sampler2D uVideoMap;
uniform float uHasVideo;
uniform float uVideoPlaying;
uniform mat3 uScreenInvHomography;
uniform float uTime;
uniform float uVhsIntensity;

float vhsRand(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 mapScreenST(vec2 uv) {
  vec3 ht = uScreenInvHomography * vec3(uv, 1.0);
  return ht.xy / ht.z;
}

bool inScreen(vec2 uv) {
  vec2 st = mapScreenST(uv);
  return st.x >= 0.0 && st.x <= 1.0 && st.y >= 0.0 && st.y <= 1.0;
}

vec2 mapScreenUV(vec2 uv) {
  return clamp(mapScreenST(uv), 0.0, 1.0);
}

vec3 sampleVhs(vec2 screenUV) {
  float t = uTime;
  float intensity = uVhsIntensity;

  float roll = sin(screenUV.y * 40.0 + t * 6.0) * 0.004 * intensity;
  float band = step(0.92, fract(screenUV.y * 3.0 + t * 0.35));
  float track = (vhsRand(vec2(floor(screenUV.y * 48.0), floor(t * 8.0))) - 0.5)
                * 0.035 * band * intensity;

  vec2 distorted = screenUV + vec2(roll + track, sin(t * 1.7) * 0.002 * intensity);

  float aberr = 0.004 * intensity;
  float r = texture2D(uVideoMap, distorted + vec2(aberr, 0.0)).r;
  float g = texture2D(uVideoMap, distorted).g;
  float b = texture2D(uVideoMap, distorted - vec2(aberr, 0.0)).b;
  vec3 col = vec3(r, g, b);

  float scan = sin((distorted.y + t * 0.05) * 720.0) * 0.5 + 0.5;
  col *= mix(1.0, 0.72 + scan * 0.28, intensity);

  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, mix(1.0, 0.75, intensity));
  col = (col - 0.5) * mix(1.0, 1.25, intensity) + 0.5;

  float grain = vhsRand(distorted * vec2(960.0, 540.0) + t * 12.0);
  col += (grain - 0.5) * 0.08 * intensity;

  float tear = step(0.985, vhsRand(vec2(floor(t * 4.0), 0.3)));
  col = mix(col, col.bgr * 0.85, tear * 0.5 * intensity);

  return clamp(col, 0.0, 1.0);
}
`;

export const vhsScreenMaterialVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const vhsScreenMaterialFragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
${vhsScreenFragmentChunk}

void main() {
  if (uHasVideo < 0.5 || uVideoPlaying < 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  vec3 col = sampleVhs(vUv);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createVHSScreenMaterial(
  videoMap: THREE.Texture | null = null
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uVideoMap: { value: videoMap },
      uHasVideo: { value: videoMap ? 1 : 0 },
      uVideoPlaying: { value: 1 },
      uScreenTLTR: { value: new THREE.Vector4(0, 1, 1, 1) },
      uScreenBLBR: { value: new THREE.Vector4(0, 0, 1, 0) },
      uScreenInvHomography: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
      uVhsIntensity: { value: 1 },
    },
    vertexShader: vhsScreenMaterialVertex,
    fragmentShader: vhsScreenMaterialFragment,
  });
}
