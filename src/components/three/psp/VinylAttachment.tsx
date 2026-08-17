"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createVinylMaterial } from "../vinyl/createVinylMaterial";

type Props = {
  /** Ref synced from PSP video element — read in useFrame, never React state. */
  playbackActiveRef: React.RefObject<boolean>;
  colorMap?: string;
  depthMap?: string;
  displacement?: number;
  /** Local offset inside the PSP group (follows parallax automatically). */
  position?: [number, number, number];
  scale?: number;
};

export function VinylAttachment({
  playbackActiveRef,
  colorMap = "/images/vinyl-color.png",
  depthMap = "/images/vinyl-depth.png",
  displacement = 0.26,
  position = [0, -1.05, 0.015],
  scale = 0.52,
}: Props) {
  const spinRef = useRef<THREE.Group>(null);
  const spinAngle = useRef(0);
  const [aspect, setAspect] = useState(1);

  const [colorTex, depthTex] = useLoader(THREE.TextureLoader, [
    colorMap,
    depthMap,
  ]);

  const material = useMemo(
    () => createVinylMaterial(colorTex, depthTex, displacement),
    [colorTex, depthTex, displacement]
  );

  useEffect(() => {
    const img = colorTex.image as HTMLImageElement | undefined;
    if (img?.width && img?.height) setAspect(img.width / img.height);
  }, [colorTex]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const spin = spinRef.current;
    if (!spin) return;

    if (playbackActiveRef.current) {
      spinAngle.current += delta * 2.35;
    }
    spin.rotation.z = spinAngle.current;
  });

  const width = 2.2 * scale;
  const height = width / aspect;

  return (
    <group position={position}>
      <group ref={spinRef}>
        <mesh material={material} renderOrder={2}>
          <planeGeometry args={[width, height, 96, 96]} />
        </mesh>
      </group>
    </group>
  );
}
