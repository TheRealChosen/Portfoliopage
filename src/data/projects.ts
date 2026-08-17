export type ScreenUVRect = {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
};

/** Perspective screen corners in WebGL UV (v=0 at bottom). */
export type ScreenUVQuad = {
  tl: { u: number; v: number };
  tr: { u: number; v: number };
  bl: { u: number; v: number };
  br: { u: number; v: number };
};

export type UVHitRect = {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
};

export type ProjectModelType = "standard" | "pspDepth";

export type StandardPrimitive =
  | "box"
  | "torus"
  | "sphere"
  | "icosahedron"
  | "octahedron";

export type Project = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  summary?: string;
  modelType: ProjectModelType;
  primitive?: StandardPrimitive;
  colorMap?: string;
  depthMap?: string;
  videoSrc?: string;
  videoSources?: string[];
  screenUVRect?: ScreenUVRect;
  screenUVQuad?: ScreenUVQuad;
  dpadLeft?: UVHitRect;
  dpadRight?: UVHitRect;
  dpadRightOverlay?: string;
  mediaImage?: string;
  mediaImages?: string[];
  videoLoop?: boolean;
  rotationStep?: number;
  rotationClamp?: number;
  link?: string;
  year?: string;
};

export const PSP_SCREEN_QUAD: ScreenUVQuad = {
  tl: { u: 0.263, v: 0.72 },
  tr: { u: 0.785, v: 0.642 },
  bl: { u: 0.187, v: 0.427 },
  br: { u: 0.714, v: 0.335 },
};

export const PSP_DPAD_LEFT: UVHitRect = {
  uMin: 0.062,
  uMax: 0.108,
  vMin: 0.572,
  vMax: 0.622,
};

export const PSP_DPAD_RIGHT: UVHitRect = {
  uMin: 0.138,
  uMax: 0.208,
  vMin: 0.568,
  vMax: 0.622,
};

/** PSP config used in the hero centerpiece. */
export const heroProject: Project = {
  id: "hero-psp",
  number: "01",
  title: "PSP SHOWREEL",
  tagline: "Interactive depth-mapped centerpiece",
  description:
    "Pseudo-3D relief from a color still and depth map. Move your cursor anywhere in the hero; tap the D-pad to play on the LCD.",
  modelType: "pspDepth",
  colorMap: "/images/psp-100.png",
  depthMap: "/images/psp-depth.png",
  dpadRightOverlay: "/images/psp-100-rightdpad.png",
  videoSources: ["/videos/the-end.mp4"],
  screenUVQuad: PSP_SCREEN_QUAD,
  dpadLeft: PSP_DPAD_LEFT,
  dpadRight: PSP_DPAD_RIGHT,
  videoLoop: false,
  rotationClamp: 14,
  year: "2026",
};

/** Work section projects — populated as sections are built. */
export const projects: Project[] = [];
