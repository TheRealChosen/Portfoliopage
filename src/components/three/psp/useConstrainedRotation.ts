"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Object3D } from "three";

type Options = {
  clampDeg?: number;
  /** Max pitch (x) in degrees */
  clampXDeg?: number;
  sensitivity?: number;
  lerp?: number;
  idleEnabled?: boolean;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Cursor-driven constrained rotation (yaw + slight pitch).
 * Clamped so depth-map edges don't tear.
 */
export function useConstrainedRotation(
  targetRef: React.RefObject<Object3D | null>,
  {
    clampDeg = 15,
    clampXDeg = 8,
    sensitivity = 1,
    lerp = 0.08,
    idleEnabled = true,
  }: Options = {}
) {
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const targetRot = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.current.x = nx;
      pointer.current.y = ny;
      pointer.current.inside = true;

      targetRot.current.y = Math.max(
        -clampDeg,
        Math.min(clampDeg, nx * clampDeg * sensitivity)
      );
      targetRot.current.x = Math.max(
        -clampXDeg,
        Math.min(clampXDeg, -ny * clampXDeg * sensitivity)
      );
    };

    const onLeave = () => {
      pointer.current.inside = false;
      targetRot.current.x = 0;
      targetRot.current.y = 0;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, clampDeg, clampXDeg, sensitivity]);

  useFrame((state) => {
    const mesh = targetRef.current;
    if (!mesh) return;

    let goalX = toRad(targetRot.current.x);
    let goalY = toRad(targetRot.current.y);

    if (idleEnabled && !pointer.current.inside) {
      const t = state.clock.elapsedTime;
      goalY += Math.sin(t * 0.45) * toRad(1.4);
      goalX += Math.sin(t * 0.35) * toRad(0.8);
    }

    mesh.rotation.x += (goalX - mesh.rotation.x) * lerp;
    mesh.rotation.y += (goalY - mesh.rotation.y) * lerp;
  });

  const setYaw = useCallback(
    (deg: number) => {
      targetRot.current.y = Math.max(-clampDeg, Math.min(clampDeg, deg));
    },
    [clampDeg]
  );

  return { setYaw, pointer };
}
