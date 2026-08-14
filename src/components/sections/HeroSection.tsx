"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplineHero } from "@/components/three/SplineHero";
import { siteConfig } from "@/data/site";

/** Shared dice slot — keeps 3D object centered between RUZ / GAR */
const DICE_SIZE = "min(42vw, 380px)";

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
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

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* Dice pinned to viewport center */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ width: DICE_SIZE, height: DICE_SIZE }}
      >
        <SplineHero className="pointer-events-auto h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 sm:px-6">
        <div className="flex w-full items-center justify-center">
          <h1 className="hero-word shrink-0 font-pixel text-3xl uppercase tracking-[0.12em] text-white sm:text-5xl md:text-7xl">
            {left}
          </h1>

          {/* Spacer matches dice — keeps text flanking centered 3D */}
          <div
            className="shrink-0"
            style={{ width: DICE_SIZE, height: DICE_SIZE }}
            aria-hidden
          />

          <h1 className="hero-word shrink-0 font-pixel text-3xl uppercase tracking-[0.12em] text-white sm:text-5xl md:text-7xl">
            {right}
          </h1>
        </div>

        <p className="hero-word mt-10 max-w-md text-center font-pixel text-xs tracking-[0.2em] text-white/55 sm:text-sm">
          {siteConfig.tagline}
        </p>
      </div>

      <div className="scroll-indicator absolute bottom-10 z-10 flex flex-col items-center gap-2">
        <span className="font-pixel text-[10px] tracking-[0.35em] text-white/50">
          SCROLL
        </span>
        <span className="font-pixel text-white/70">▼</span>
      </div>
    </section>
  );
}
