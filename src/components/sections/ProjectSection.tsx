"use client";

import { useRef } from "react";
import { DynamicScene } from "@/components/three/DynamicScene";
import { useNearViewport } from "@/hooks/useNearViewport";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  total: number;
  onOpen: (project: Project) => void;
};

export function ProjectSection({ project, total, onOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef, "280px");

  const isPsp = project.modelType === "pspDepth";

  return (
    <section
      ref={sectionRef}
      id={`project-${project.id}`}
      data-project-section
      className="relative flex min-h-screen w-full items-center overflow-hidden border-t border-white/10"
    >
      <div className="absolute left-6 top-8 z-20 sm:left-10 sm:top-12">
        <p className="font-pixel text-xs tracking-[0.3em] text-white/50">
          {project.number} /{String(total).padStart(2, "0")}
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="group text-left"
            >
              <h2 className="font-pixel text-3xl uppercase tracking-wide text-white transition group-hover:opacity-80 sm:text-4xl md:text-5xl">
                {project.title}
              </h2>
              <p className="mt-3 max-w-sm font-pixel text-sm text-white/55">
                {project.tagline}
              </p>
              <p className="mt-6 font-pixel text-[10px] tracking-[0.25em] text-white/40 group-hover:text-white/70">
                [ VIEW DETAIL ]
              </p>
            </button>

            {isPsp && (
              <p className="mt-10 max-w-sm font-pixel text-[10px] leading-relaxed tracking-wide text-white/35">
                Move anywhere in this section · tap right D-pad ▶ to play · clamp
                ±{project.rotationClamp ?? 15}°
              </p>
            )}
          </div>

          <div className="order-1 min-h-[62vh] w-full lg:order-2 lg:col-span-3 lg:min-h-[78vh]">
            {near && (
              <DynamicScene
                mode="project"
                project={project}
                active={near}
                pointerRoot={sectionRef}
              />
            )}
          </div>
        </div>

        {project.summary && (
          <p className="mt-14 max-w-3xl font-pixel text-sm leading-relaxed text-white/60 sm:text-base">
            {project.summary}
          </p>
        )}
      </div>
    </section>
  );
}
