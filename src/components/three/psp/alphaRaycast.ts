import * as THREE from "three";

const canvasCache = new WeakMap<
  HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  HTMLCanvasElement
>();

function getCanvas(
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
): HTMLCanvasElement | null {
  if (!("width" in image) || !image.width) return null;

  let canvas = canvasCache.get(image);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image as CanvasImageSource, 0, 0);
    canvasCache.set(image, canvas);
  }
  return canvas;
}

/** Sample texture alpha at WebGL UV (v=0 at bottom). */
export function sampleTextureAlpha(
  texture: THREE.Texture,
  u: number,
  v: number
): number {
  const image = texture.image as
    | HTMLImageElement
    | HTMLCanvasElement
    | ImageBitmap
    | undefined;
  if (!image) return 0;

  const canvas = getCanvas(image);
  if (!canvas) return 0;

  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const x = Math.min(
    canvas.width - 1,
    Math.max(0, Math.floor(u * canvas.width))
  );
  const y = Math.min(
    canvas.height - 1,
    Math.max(0, Math.floor((1 - v) * canvas.height))
  );

  return ctx.getImageData(x, y, 1, 1).data[3] / 255;
}

/** Ignore ray hits on fully transparent texels so clicks pass through. */
export function attachAlphaRaycast(
  mesh: THREE.Mesh,
  texture: THREE.Texture,
  threshold = 0.12
) {
  const baseRaycast = THREE.Mesh.prototype.raycast;
  mesh.raycast = (raycaster, intersects) => {
    const hits: THREE.Intersection[] = [];
    baseRaycast.call(mesh, raycaster, hits);
    const hit = hits[0];
    if (!hit?.uv) return;

    if (sampleTextureAlpha(texture, hit.uv.x, hit.uv.y) >= threshold) {
      intersects.push(hit);
    }
  };
}
