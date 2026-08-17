"use client";

import { siteConfig } from "@/data/site";

export function AboutSection() {
  const about = siteConfig.sections.about;

  return (
    <section
      id="about"
      className="relative flex min-h-[70vh] w-full items-center border-t border-white/10 px-6 py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-2">
          <p className="font-pixel text-xs tracking-[0.3em] text-white/45">
            {about.number} / {about.total}
          </p>
          <p className="mt-3 font-pixel text-sm tracking-[0.35em] text-white/70">
            {about.label}
          </p>
        </div>
        <div className="lg:col-span-3">
          <h2 className="font-pixel text-3xl uppercase tracking-wide text-white sm:text-4xl">
            {siteConfig.fullName}.
          </h2>
          <p className="mt-8 font-pixel text-sm leading-relaxed text-white/70 sm:text-base">
            {siteConfig.bio}
          </p>
        </div>
      </div>
    </section>
  );
}
