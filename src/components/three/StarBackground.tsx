"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Large faint 5-point star — extruded as thin mesh for subtle parallax depth. */
function StarMesh({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const spikes = 5;
    const outer = 1;
    const inner = 0.38;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed * 2) * 0.08;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </mesh>
  );
}

export function StarBackground({ scrollY = 0 }: { scrollY?: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.position.y = scrollY * 0.00035;
      group.current.rotation.z = scrollY * 0.00005;
    }
  });

  return (
    <group ref={group}>
      <StarMesh position={[-2.8, 1.6, -3]} scale={1.8} speed={0.05} />
      <StarMesh position={[3.2, -0.4, -4]} scale={2.4} speed={-0.03} />
      <StarMesh position={[0.2, 2.4, -5]} scale={1.2} speed={0.04} />
      <StarMesh position={[-1.5, -2.2, -3.5]} scale={1.5} speed={-0.06} />
    </group>
  );
}
