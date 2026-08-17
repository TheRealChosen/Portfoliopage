import * as THREE from "three";

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
varying vec2 vUv;

void main() {
  vec4 color = texture2D(uColorMap, vUv);
  if (color.a < 0.02) discard;
  gl_FragColor = color;
}
`;

export function createVinylMaterial(
  colorMap: THREE.Texture,
  depthMap: THREE.Texture,
  displacement = 0.28
) {
  colorMap.colorSpace = THREE.SRGBColorSpace;
  depthMap.colorSpace = THREE.NoColorSpace;

  return new THREE.ShaderMaterial({
    uniforms: {
      uColorMap: { value: colorMap },
      uDepthMap: { value: depthMap },
      uDisplacement: { value: displacement },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: true,
  });
}
