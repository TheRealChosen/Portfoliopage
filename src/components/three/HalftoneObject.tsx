"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createHalftoneMaterial } from "./HalftoneShaderMaterial";
import type { StandardPrimitive } from "@/data/projects";

type Props = {
  primitive?: StandardPrimitive;
  scale?: number;
  autoRotate?: boolean;
};

function geometryFor(kind: StandardPrimitive) {
  switch (kind) {
    case "box":
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    case "torus":
      return <torusGeometry args={[0.7, 0.28, 32, 64]} />;
    case "sphere":
      return <sphereGeometry args={[0.85, 48, 48]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.95, 0]} />;
    case "icosahedron":
    default:
      return <icosahedronGeometry args={[0.95, 1]} />;
  }
}

export function HalftoneObject({
  primitive = "icosahedron",
  scale = 1,
  autoRotate = true,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const material = useMemo(() => createHalftoneMaterial("#ffffff", 2.4), []);

  useEffect(() => {
    material.uniforms.uResolution.value.set(size.width, size.height);
  }, [material, size]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    if (autoRotate) {
      m.rotation.y = state.clock.elapsedTime * 0.35;
      m.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    }
    m.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
  });

  return (
    <mesh ref={meshRef} scale={scale} material={material}>
      {geometryFor(primitive)}
    </mesh>
  );
}
