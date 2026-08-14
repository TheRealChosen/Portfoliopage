import * as THREE from "three";

/**
 * Bayer-matrix ordered dither — white dots on black.
 * Dot scale responds to resolution via uPixelSize / uResolution.
 */
export const halftoneVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const halftoneFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uPixelSize;
uniform vec2 uResolution;
uniform float uLightIntensity;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

float bayer4(vec2 p) {
  // 4x4 Bayer matrix indexed by pixel
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int index = x + y * 4;
  float m[16];
  m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
  m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
  m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
  return m[index] / 16.0;
}

void main() {
  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
  float ndl = max(dot(normalize(vNormal), lightDir), 0.0);
  float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
  float lum = clamp(ndl * uLightIntensity + rim * 0.25 + 0.08, 0.0, 1.0);

  vec2 pixel = gl_FragCoord.xy / max(uPixelSize, 1.0);
  float threshold = bayer4(floor(pixel));
  float dither = step(threshold, lum);

  // Soften with a circular dot feel inside each cell
  vec2 cell = fract(pixel) - 0.5;
  float dotMask = 1.0 - smoothstep(0.22, 0.48, length(cell));
  float ink = dither * mix(0.85, 1.0, dotMask);

  vec3 col = mix(vec3(0.0), uColor, ink);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createHalftoneMaterial(
  color: THREE.ColorRepresentation = "#ffffff",
  pixelSize = 2.5
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPixelSize: { value: pixelSize },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uLightIntensity: { value: 1.1 },
    },
    vertexShader: halftoneVertexShader,
    fragmentShader: halftoneFragmentShader,
  });
}
