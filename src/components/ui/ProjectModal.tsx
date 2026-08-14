"use client";

import { useEffect } from "react";
import gsap from "gsap";
import type { Project } from "@/data/projects";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    if (!project) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".project-modal-panel",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="project-modal-panel w-full max-w-lg border border-white/30 bg-black p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="font-pixel text-xs tracking-[0.25em] text-white/50">
            {project.number} / 05
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-xs tracking-widest text-white/70 hover:text-white"
          >
            [ close ]
          </button>
        </div>
        <h2
          id="project-modal-title"
          className="font-pixel text-2xl uppercase tracking-wide text-white sm:text-3xl"
        >
          {project.title}
        </h2>
        <p className="mt-2 font-pixel text-sm text-white/60">{project.tagline}</p>
        <p className="mt-6 font-pixel text-xs leading-relaxed text-white/80 sm:text-sm">
          {project.description}
        </p>
        {project.year && (
          <p className="mt-8 font-pixel text-[10px] tracking-[0.3em] text-white/40">
            {project.year}
          </p>
        )}
      </div>
    </div>
  );
}
