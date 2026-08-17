"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Object3D } from "three";

type Options = {
  clampDeg?: number;
  clampXDeg?: number;
  sensitivity?: number;
  lerp?: number;
  idleEnabled?: boolean;
  /**
   * Invisible bounds element — pointer is tracked relative to this rect
   * via window-level listener, so the PSP canvas stays clickable.
   */
  pointerRoot?: React.RefObject<HTMLElement | null>;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

function isInsideRect(x: number, y: number, rect: DOMRect) {
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

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
    lerp = 0.065,
    idleEnabled = true,
    pointerRoot,
  }: Options = {}
) {
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const targetRot = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const boundsEl = pointerRoot?.current ?? gl.domElement;

    const applyFromClient = (clientX: number, clientY: number) => {
      const rect = boundsEl.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      if (pointerRoot?.current && !isInsideRect(clientX, clientY, rect)) {
        pointer.current.inside = false;
        targetRot.current.x = 0;
        targetRot.current.y = 0;
        return;
      }

      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
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

    const onMove = (e: PointerEvent) => applyFromClient(e.clientX, e.clientY);

    const onLeave = () => {
      pointer.current.inside = false;
      targetRot.current.x = 0;
      targetRot.current.y = 0;
    };

    if (pointerRoot?.current) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onLeave);
      };
    }

    boundsEl.addEventListener("pointermove", onMove, { passive: true });
    boundsEl.addEventListener("pointerleave", onLeave);
    return () => {
      boundsEl.removeEventListener("pointermove", onMove);
      boundsEl.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, clampDeg, clampXDeg, sensitivity, pointerRoot]);

  useFrame((state) => {
    const mesh = targetRef.current;
    if (!mesh) return;

    let goalX = toRad(targetRot.current.x);
    let goalY = toRad(targetRot.current.y);

    if (idleEnabled && !pointer.current.inside) {
      const t = state.clock.elapsedTime;
      goalY += Math.sin(t * 0.45) * toRad(1.2);
      goalX += Math.sin(t * 0.35) * toRad(0.7);
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
};
