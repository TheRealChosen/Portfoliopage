"use client";

import { siteConfig } from "@/data/site";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-[70vh] w-full items-center border-t border-white/10 px-6 py-24"
    >
      <div className="mx-auto w-full max-w-3xl">
        <p className="font-pixel text-xs tracking-[0.35em] text-white/45">
          ABOUT
        </p>
        <h2 className="mt-4 font-pixel text-3xl uppercase tracking-wide text-white sm:text-4xl">
          {siteConfig.fullName}.
        </h2>
        <p className="mt-8 font-pixel text-sm leading-relaxed text-white/70 sm:text-base">
          {siteConfig.bio}
        </p>
      </div>
    </section>
  );
}
