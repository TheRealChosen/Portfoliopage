import type { ScreenUVQuad } from "@/data/projects";
import * as THREE from "three";

/** 3x3 row-major matrix invert; returns null if singular. */
function invert3x3(m: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  const inv = 1 / det;
  return [
    A * inv,
    D * inv,
    G * inv,
    B * inv,
    E * inv,
    H * inv,
    C * inv,
    F * inv,
    I * inv,
  ];
}

/**
 * Homography mapping unit square (s,t) -> image UV (u,v).
 * (0,0)=BL, (1,0)=BR, (0,1)=TL, (1,1)=TR — matches WebGL media v-up.
 */
function homographyFromUnitSquareToQuad(quad: ScreenUVQuad): number[] {
  const src = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  const dst = [
    [quad.bl.u, quad.bl.v],
    [quad.br.u, quad.br.v],
    [quad.tl.u, quad.tl.v],
    [quad.tr.u, quad.tr.v],
  ];

  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }

  const h = solve8(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/** Gaussian elimination for 8x8. */
function solve8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];

    const div = M[col][col];
    if (Math.abs(div) < 1e-12) continue;
    for (let j = col; j <= n; j++) M[col][j] /= div;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }

  return M.map((row) => row[n]);
}

/** Inverse homography: image UV -> unit-square screen (s,t). */
export function screenInverseHomography(quad: ScreenUVQuad): THREE.Matrix3 {
  const forward = homographyFromUnitSquareToQuad(quad);
  const inverse = invert3x3(forward);
  const mat = inverse ?? forward;
  const m = new THREE.Matrix3();
  m.set(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5], mat[6], mat[7], mat[8]);
  return m;
}
