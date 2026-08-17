"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  createDepthDisplacementMaterial,
  createDepthOverlayMaterial,
} from "./DepthDisplacementMaterial";
import { attachAlphaRaycast } from "./alphaRaycast";
import { useConstrainedRotation } from "./useConstrainedRotation";
import type { ScreenUVQuad, UVHitRect } from "@/data/projects";
import {
  PSP_DPAD_LEFT,
  PSP_DPAD_RIGHT,
  PSP_SCREEN_QUAD,
} from "@/data/projects";

export type PSPDepthObjectProps = {
  colorMap?: string;
  depthMap?: string;
  /** Full-size cutout aligned to colorMap (e.g. right D-pad). */
  dpadRightOverlay?: string;
  /** Static image shown on the LCD when media plays. */
  mediaImage?: string;
  /** Static images cycled on the LCD (D-pad). Falls back to mediaImage. */
  mediaImages?: string[];
  screenUVQuad?: ScreenUVQuad;
  videoSources?: string[];
  videoSrc?: string;
  videoLoop?: boolean;
  displacement?: number;
  rotationClamp?: number;
  dpadLeft?: UVHitRect;
  dpadRight?: UVHitRect;
  /** Draw red boxes over D-pad UV hit areas (for calibration). */
  showDpadHitboxes?: boolean;
  active?: boolean;
  pointerRoot?: React.RefObject<HTMLElement | null>;
  onReady?: (api: {
    prevMedia: () => void;
    nextMedia: () => void;
    mediaIndex: number;
  }) => void;
};

function hitTest(uv: { x: number; y: number }, rect: UVHitRect) {
  return (
    uv.x >= rect.uMin &&
    uv.x <= rect.uMax &&
    uv.y >= rect.vMin &&
    uv.y <= rect.vMax
  );
}

function uvRectToLocal(rect: UVHitRect, planeWidth: number, planeHeight: number) {
  const centerU = (rect.uMin + rect.uMax) / 2;
  const centerV = (rect.vMin + rect.vMax) / 2;
  return {
    x: (centerU - 0.5) * planeWidth,
    y: (centerV - 0.5) * planeHeight,
    w: (rect.uMax - rect.uMin) * planeWidth,
    h: (rect.vMax - rect.vMin) * planeHeight,
  };
}

function DpadHitboxOverlay({
  rect,
  planeWidth,
  planeHeight,
}: {
  rect: UVHitRect;
  planeWidth: number;
  planeHeight: number;
}) {
  const { x, y, w, h } = uvRectToLocal(rect, planeWidth, planeHeight);
  const z = 0.012;

  const outline = useMemo(
    () => [
      new THREE.Vector3(x - w / 2, y - h / 2, z),
      new THREE.Vector3(x + w / 2, y - h / 2, z),
      new THREE.Vector3(x + w / 2, y + h / 2, z),
      new THREE.Vector3(x - w / 2, y + h / 2, z),
      new THREE.Vector3(x - w / 2, y - h / 2, z),
    ],
    [x, y, w, h, z]
  );

  return (
    <group>
      <mesh position={[x, y, z - 0.001]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={0.35}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(outline.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0000" depthTest={false} toneMapped={false} />
      </line>
    </group>
  );
}

export function PSPDepthObject({
  colorMap = "/images/psp-100.png",
  depthMap = "/images/psp-depth.png",
  dpadRightOverlay = "/images/psp-100-rightdpad.png",
  mediaImage,
  mediaImages,
  screenUVQuad = PSP_SCREEN_QUAD,
  videoSources,
  videoSrc = "/videos/the-end.mp4",
  videoLoop = false,
  displacement = 0.32,
  rotationClamp = 15,
  dpadLeft = PSP_DPAD_LEFT,
  dpadRight = PSP_DPAD_RIGHT,
  showDpadHitboxes = false,
  active = true,
  pointerRoot,
  onReady,
}: PSPDepthObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const overlayMeshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wantPlay = useRef(false);
  const playbackActiveRef = useRef(false);

  const imageSources = useMemo(
    () =>
      mediaImages && mediaImages.length > 0
        ? mediaImages
        : mediaImage
          ? [mediaImage]
          : [],
    [mediaImages, mediaImage]
  );

  const useImageMedia = imageSources.length > 0;

  const [aspect, setAspect] = useState(1);
  const [isPlaying, setIsPlaying] = useState(
    () => imageSources.length > 0 && active
  );
  const [mediaIndex, setMediaIndex] = useState(0);

  const sources = useMemo(
    () =>
      videoSources && videoSources.length > 0 ? videoSources : [videoSrc],
    [videoSources, videoSrc]
  );

  const mediaCount = useImageMedia ? imageSources.length : sources.length;

  const [colorTex, depthTex, overlayTex] = useLoader(THREE.TextureLoader, [
    colorMap,
    depthMap,
    dpadRightOverlay,
  ]);

  const mediaTextures = useLoader(
    THREE.TextureLoader,
    useImageMedia ? imageSources : [colorMap]
  );

  const activeMediaTex = useImageMedia
    ? mediaTextures[mediaIndex % mediaTextures.length]
    : null;

  useConstrainedRotation(groupRef, {
    clampDeg: rotationClamp,
    clampXDeg: 8,
    idleEnabled: active,
    pointerRoot,
  });

  const quadKey = JSON.stringify(screenUVQuad);

  const material = useMemo(() => {
    const mat = createDepthDisplacementMaterial(colorTex, depthTex, {
      displacement,
      screenUVQuad,
    });
    if (useImageMedia && activeMediaTex) {
      activeMediaTex.colorSpace = THREE.SRGBColorSpace;
      activeMediaTex.needsUpdate = true;
      mat.uniforms.uVideoMap.value = activeMediaTex;
      mat.uniforms.uHasVideo.value = 1;
      mat.uniforms.uMediaIsImage.value = 1;
    }
    materialRef.current = mat;
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorTex, depthTex, displacement, quadKey, useImageMedia, activeMediaTex]);

  const overlayMaterial = useMemo(
    () =>
      createDepthOverlayMaterial(overlayTex, depthTex, { displacement }),
    [overlayTex, depthTex, displacement]
  );

  useLayoutEffect(() => {
    const mesh = overlayMeshRef.current;
    if (!mesh) return;
    attachAlphaRaycast(mesh, overlayTex);
  }, [overlayTex]);

  useEffect(() => {
    const img = colorTex.image as HTMLImageElement | undefined;
    if (img?.width && img?.height) setAspect(img.width / img.height);
  }, [colorTex]);

  useEffect(() => {
    if (!material) return;

    if (useImageMedia && activeMediaTex) {
      activeMediaTex.colorSpace = THREE.SRGBColorSpace;
      activeMediaTex.needsUpdate = true;
      material.uniforms.uVideoMap.value = activeMediaTex;
      material.uniforms.uHasVideo.value = 1;
      material.uniforms.uMediaIsImage.value = 1;
      return;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = videoLoop;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    videoRef.current = video;

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    material.uniforms.uVideoMap.value = tex;
    material.uniforms.uHasVideo.value = 1;
    material.uniforms.uMediaIsImage.value = 0;

    const syncFromVideo = () => {
      playbackActiveRef.current =
        !video.paused && !video.ended && video.readyState >= 2;
      setIsPlaying(playbackActiveRef.current);
    };

    video.addEventListener("play", syncFromVideo);
    video.addEventListener("pause", syncFromVideo);
    video.addEventListener("ended", syncFromVideo);

    return () => {
      video.removeEventListener("play", syncFromVideo);
      video.removeEventListener("pause", syncFromVideo);
      video.removeEventListener("ended", syncFromVideo);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
      tex.dispose();
      videoRef.current = null;
      playbackActiveRef.current = false;
    };
  }, [material, videoLoop, useImageMedia, activeMediaTex]);

  useEffect(() => {
    if (useImageMedia) return;

    const video = videoRef.current;
    if (!video) return;
    const src = sources[mediaIndex % sources.length];
    video.src = src;
    video.load();

    const tryPlay = () => {
      if (!wantPlay.current) return;
      setIsPlaying(true);
      void video.play().catch(() => undefined);
    };

    video.addEventListener("loadeddata", tryPlay);
    tryPlay();
    return () => video.removeEventListener("loadeddata", tryPlay);
  }, [mediaIndex, sources, useImageMedia]);

  useEffect(() => {
    if (!active) {
      setIsPlaying(false);
      wantPlay.current = false;
      playbackActiveRef.current = false;
      videoRef.current?.pause();
      return;
    }
    if (useImageMedia) {
      wantPlay.current = true;
      setIsPlaying(true);
      playbackActiveRef.current = true;
    }
  }, [active, useImageMedia]);

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => overlayMaterial.dispose(), [overlayMaterial]);

  const wakeAndPlay = useCallback(() => {
    wantPlay.current = true;
    setIsPlaying(true);
    const video = videoRef.current;
    if (!useImageMedia) {
      void video?.play().catch(() => undefined);
    }
  }, [useImageMedia]);

  const prevMedia = useCallback(() => {
    wantPlay.current = true;
    setIsPlaying(true);
    setMediaIndex((i) => (i - 1 + mediaCount) % mediaCount);
  }, [mediaCount]);

  const nextMedia = useCallback(() => {
    wantPlay.current = true;
    setIsPlaying(true);
    setMediaIndex((i) => (i + 1) % mediaCount);
  }, [mediaCount]);

  useEffect(() => {
    onReady?.({ prevMedia, nextMedia, mediaIndex });
  }, [onReady, prevMedia, nextMedia, mediaIndex]);

  const onBasePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const uv = e.uv;
    if (!uv) {
      wakeAndPlay();
      return;
    }

    if (hitTest(uv, dpadLeft)) {
      prevMedia();
      return;
    }

    wakeAndPlay();
  };

  const onOverlayPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    nextMedia();
  };

  useFrame((state) => {
    const g = groupRef.current;
    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      if (useImageMedia) {
        mat.uniforms.uVideoPlaying.value = isPlaying ? 1 : 0;
      } else {
        const video = videoRef.current;
        if (video) {
          playbackActiveRef.current =
            !video.paused && !video.ended && video.readyState >= 2;
        }
        mat.uniforms.uVideoPlaying.value = playbackActiveRef.current ? 1 : 0;
      }
    }
    if (g) {
      g.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
    }
  });

  const width = 2.4;
  const height = width / aspect;

  return (
    <group ref={groupRef}>
      <mesh
        material={material}
        onPointerDown={onBasePointerDown}
        onPointerOver={() => {
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[width, height, 128, 128]} />
      </mesh>

      <mesh
        ref={overlayMeshRef}
        material={overlayMaterial}
        position={[0, 0, 0.008]}
        renderOrder={1}
        onPointerDown={onOverlayPointerDown}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[width, height, 128, 128]} />
      </mesh>

      {showDpadHitboxes && (
        <>
          <DpadHitboxOverlay
            rect={dpadLeft}
            planeWidth={width}
            planeHeight={height}
          />
          <DpadHitboxOverlay
            rect={dpadRight}
            planeWidth={width}
            planeHeight={height}
          />
        </>
      )}
    </group>
  );
}
