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
  modelType: ProjectModelType;
  primitive?: StandardPrimitive;
  colorMap?: string;
  depthMap?: string;
  /** @deprecated prefer videoSources */
  videoSrc?: string;
  videoSources?: string[];
  screenUVRect?: ScreenUVRect;
  screenUVQuad?: ScreenUVQuad;
  dpadLeft?: UVHitRect;
  dpadRight?: UVHitRect;
  /** Full-size cutout PNG aligned to colorMap (e.g. right D-pad). */
  dpadRightOverlay?: string;
  /** Static image shown on the LCD when media plays. */
  mediaImage?: string;
  /** Static images cycled on the LCD (D-pad). Falls back to mediaImage. */
  mediaImages?: string[];
  videoLoop?: boolean;
  rotationStep?: number;
  rotationClamp?: number;
  link?: string;
  year?: string;
};

/** Calibrated against psp-100.png transparent LCD cutout (perspective quad). */
export const PSP_SCREEN_QUAD: ScreenUVQuad = {
  tl: { u: 0.263, v: 0.72 },
  tr: { u: 0.785, v: 0.642 },
  bl: { u: 0.187, v: 0.427 },
  br: { u: 0.714, v: 0.335 },
};

/** On-device D-pad arrow hitboxes (slightly padded for easier clicks). */
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

export const projects: Project[] = [
  {
    id: "signal-form",
    number: "01",
    title: "SIGNAL FORM",
    tagline: "Procedural typography systems",
    description:
      "A real-time type laboratory exploring dithered surfaces, kinetic letterforms, and scroll-driven composition.",
    modelType: "standard",
    primitive: "icosahedron",
    year: "2025",
    link: "#",
  },
  {
    id: "psp-parallax",
    number: "02",
    title: "PSP RELIEF",
    tagline: "Depth-map parallax handheld",
    description:
      "Pseudo-3D relief from a still + depth map. Move with the cursor; tap the on-device D-pad to cycle VHS media on the LCD.",
    modelType: "pspDepth",
    colorMap: "/images/psp-100.png",
    depthMap: "/images/psp-depth.png",
    dpadRightOverlay: "/images/psp-100-rightdpad.png",
    mediaImages: [
      "/images/psp-media.png",
      "/images/psp-media-outside.png",
      "/images/psp-media-cat-collage.png",
      "/images/psp-media-cat-paint.png",
    ],
    screenUVQuad: PSP_SCREEN_QUAD,
    dpadLeft: PSP_DPAD_LEFT,
    dpadRight: PSP_DPAD_RIGHT,
    videoLoop: true,
    rotationClamp: 15,
    year: "2026",
    link: "#",
  },
  {
    id: "orbit-kit",
    number: "03",
    title: "ORBIT KIT",
    tagline: "Motion primitives for product UI",
    description:
      "A library of constrained 3D interactions — float, nudge, snap — designed for marketing sites that need physicality without game engines.",
    modelType: "standard",
    primitive: "torus",
    year: "2025",
    link: "#",
  },
  {
    id: "mono-field",
    number: "04",
    title: "MONO FIELD",
    tagline: "Black-and-white spatial brand",
    description:
      "Identity system built around halftone stars, monospace wordmarks, and a single light source.",
    modelType: "standard",
    primitive: "octahedron",
    year: "2024",
    link: "#",
  },
  {
    id: "wire-room",
    number: "05",
    title: "WIRE ROOM",
    tagline: "Archived installation studies",
    description:
      "A collection of room-scale wireframe studies — density, occlusion, and quiet motion.",
    modelType: "standard",
    primitive: "sphere",
    year: "2024",
    link: "#",
  },
];
