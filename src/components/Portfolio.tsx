"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectSection } from "@/components/sections/ProjectSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { projects, type Project } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

function StarFieldSVG() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute -left-10 top-[12%] h-[40vw] w-[40vw] max-h-[480px] max-w-[480px] opacity-[0.07]"
        viewBox="0 0 100 100"
      >
        <polygon
          fill="white"
          points="50,5 61,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 39,38"
        />
      </svg>
      <svg
        className="absolute -right-16 top-[48%] h-[50vw] w-[50vw] max-h-[560px] max-w-[560px] opacity-[0.05]"
        viewBox="0 0 100 100"
      >
        <polygon
          fill="white"
          points="50,5 61,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 39,38"
        />
      </svg>
      <svg
        className="absolute bottom-[8%] left-[30%] h-[28vw] w-[28vw] max-h-[320px] max-w-[320px] opacity-[0.04]"
        viewBox="0 0 100 100"
      >
        <polygon
          fill="white"
          points="50,5 61,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 39,38"
        />
      </svg>
    </div>
  );
}

export function Portfolio() {
  useSmoothScroll();
  const [active, setActive] = useState<Project | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-project-section]");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.35 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "top 25%",
              scrub: true,
            },
          }
        );
      });

      gsap.to(".star-parallax", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-x-hidden bg-black text-white">
      <div className="star-parallax">
        <StarFieldSVG />
      </div>
      <HeroSection />
      {projects.map((project) => (
        <ProjectSection
          key={project.id}
          project={project}
          total={projects.length}
          onOpen={setActive}
        />
      ))}
      <AboutSection />
      <ContactSection />
      <ProjectModal project={active} onClose={() => setActive(null)} />
    </div>
  );
}
