"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { StarBackground } from "./StarBackground";
import { HalftoneObject } from "./HalftoneObject";
import { PSPDepthObject } from "./psp/PSPDepthObject";
import type { Project, StandardPrimitive } from "@/data/projects";

type SceneMode = "hero" | "project" | "contact";

type SceneProps = {
  mode: SceneMode;
  project?: Project;
  primitive?: StandardPrimitive;
  active?: boolean;
  onPspReady?: (api: {
    prevMedia: () => void;
    nextMedia: () => void;
    mediaIndex: number;
  }) => void;
};

function SceneContent({
  mode,
  project,
  primitive,
  active = true,
  onPspReady,
}: SceneProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <StarBackground scrollY={scrollY} />

      {mode === "hero" && <HalftoneObject primitive="icosahedron" scale={1.15} />}
      {mode === "contact" && <HalftoneObject primitive="octahedron" scale={1} />}
      {mode === "project" && project?.modelType === "pspDepth" && (
        <Suspense fallback={null}>
          <PSPDepthObject
            colorMap={project.colorMap}
            depthMap={project.depthMap}
            videoSrc={project.videoSrc}
            videoSources={project.videoSources}
            screenUVQuad={project.screenUVQuad}
            dpadLeft={project.dpadLeft}
            dpadRight={project.dpadRight}
            dpadRightOverlay={project.dpadRightOverlay}
            mediaImage={project.mediaImage}
            mediaImages={project.mediaImages}
            rotationClamp={project.rotationClamp}
            videoLoop={project.videoLoop}
            active={active}
            onReady={onPspReady}
          />
        </Suspense>
      )}
      {mode === "project" && project?.modelType === "standard" && (
        <HalftoneObject
          primitive={project.primitive ?? primitive ?? "box"}
          scale={1.1}
        />
      )}
    </>
  );
}

export function Scene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "#000" }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
