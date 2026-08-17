"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createVinylMaterial } from "./createVinylMaterial";
import { useConstrainedRotation } from "../psp/useConstrainedRotation";
import { useMediaPlayback } from "@/context/MediaPlaybackContext";

type Props = {
  colorMap?: string;
  depthMap?: string;
  displacement?: number;
  rotationClamp?: number;
  pointerRoot?: RefObject<HTMLElement | null>;
  active?: boolean;
};

export function VinylRecordObject({
  colorMap = "/images/vinyl-color.png",
  depthMap = "/images/vinyl-depth.png",
  displacement = 0.28,
  rotationClamp = 18,
  pointerRoot,
  active = true,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const spinAngle = useRef(0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { isMediaPlaying } = useMediaPlayback();
  const [aspect, setAspect] = useState(1);

  const [colorTex, depthTex] = useLoader(THREE.TextureLoader, [
    colorMap,
    depthMap,
  ]);

  const material = createVinylMaterial(colorTex, depthTex, displacement);
  materialRef.current = material;

  useEffect(() => {
    const img = colorTex.image as HTMLImageElement | undefined;
    if (img?.width && img?.height) setAspect(img.width / img.height);
  }, [colorTex]);

  useEffect(() => () => material.dispose(), [material]);

  useConstrainedRotation(groupRef, {
    clampDeg: rotationClamp,
    clampXDeg: 10,
    pointerRoot,
    idleEnabled: active,
  });

  useFrame((state, delta) => {
    const spin = spinRef.current;
    if (spin && isMediaPlaying && active) {
      spinAngle.current += delta * 2.4;
    }
    if (spin) {
      spin.rotation.z = spinAngle.current;
    }

    const g = groupRef.current;
    if (g) {
      g.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.04;
    }

    // #region agent log
    if (state.clock.elapsedTime % 2 < delta) {
      fetch(
        "http://127.0.0.1:7251/ingest/dcce27b0-84d7-4257-98af-34edcf112718",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "dbc0f3",
          },
          body: JSON.stringify({
            sessionId: "dbc0f3",
            location: "VinylRecordObject.tsx:useFrame",
            message: "vinyl spin tick",
            data: {
              isMediaPlaying,
              spinZ: spin?.rotation.z ?? 0,
              active,
            },
            timestamp: Date.now(),
            hypothesisId: "H2",
          }),
        }
      ).catch(() => {});
    }
    // #endregion
  });

  const width = 2.2;
  const height = width / aspect;

  return (
    <group ref={groupRef}>
      <group ref={spinRef}>
        <mesh material={material}>
          <planeGeometry args={[width, height, 128, 128]} />
        </mesh>
      </group>
    </group>
  );
}
