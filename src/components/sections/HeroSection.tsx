"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DynamicScene } from "@/components/three/DynamicScene";
import { heroProject } from "@/data/projects";
import { siteConfig } from "@/data/site";

/** Visible PSP canvas — compact width, taller to include vinyl below. */
const PSP_W = "min(36vw, 320px)";
const PSP_H = "min(46vw, 400px)";

/** Invisible bounds for mouse tracking — larger than PSP, does not capture clicks. */
const TRACK_W = "min(94vw, 920px)";
const TRACK_H = "min(62vh, 580px)";

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const trackBoundsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      });
      gsap.to(".scroll-indicator", {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 0.9,
        ease: "sine.inOut",
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const mid = Math.ceil(siteConfig.name.length / 2);
  const left = siteConfig.name.slice(0, mid);
  const right = siteConfig.name.slice(mid);
  const about = siteConfig.sections.about;

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
    >
      {/* Invisible tracking bounds — pointer-events-none, window listener reads this rect */}
      <div
        ref={trackBoundsRef}
        className="pointer-events-none absolute left-1/2 top-[38%] z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: TRACK_W, height: TRACK_H }}
        aria-hidden
      />

      {/* Upper cinematic block: name + PSP */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-16 sm:px-6 sm:pt-20">
        <div className="relative z-10 flex w-full max-w-6xl items-center justify-center">
          <h1 className="hero-word shrink-0 font-pixel text-2xl uppercase tracking-[0.1em] text-white sm:text-4xl md:text-6xl lg:text-7xl">
            {left}
          </h1>

          <div
            className="relative mx-1 shrink-0 sm:mx-2"
            style={{ width: PSP_W, height: PSP_H }}
          >
            <DynamicScene
              mode="hero"
              project={heroProject}
              active
              showVinyl
              pointerRoot={trackBoundsRef}
            />
          </div>

          <h1 className="hero-word shrink-0 font-pixel text-2xl uppercase tracking-[0.1em] text-white sm:text-4xl md:text-6xl lg:text-7xl">
            {right}
          </h1>
        </div>

        <p className="hero-word relative z-10 mt-8 max-w-md text-center font-pixel text-xs tracking-[0.18em] text-white/55 sm:text-sm">
          {siteConfig.tagline}
        </p>
        <p className="hero-word relative z-10 mt-3 max-w-sm text-center font-pixel text-[10px] leading-relaxed tracking-wide text-white/35 sm:text-xs">
          {siteConfig.heroSubtitle}
        </p>
      </div>

      {/* 2/5 + 3/5 intro grid */}
      <div className="relative z-10 mx-auto w-full max-w-6xl border-t border-white/10 px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="font-pixel text-xs tracking-[0.3em] text-white/45">
              {about.number} / {about.total}
            </p>
            <p className="mt-3 font-pixel text-sm tracking-[0.35em] text-white/70">
              {about.label}
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="font-pixel text-sm leading-relaxed text-white/65 sm:text-base">
              {siteConfig.heroIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="scroll-indicator relative z-10 flex flex-col items-center gap-2 pb-10">
        <span className="font-pixel text-[10px] tracking-[0.35em] text-white/50">
          SCROLL
        </span>
        <span className="font-pixel text-white/70">▼</span>
      </div>
    </section>
  );
}
