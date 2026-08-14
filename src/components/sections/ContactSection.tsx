"use client";

import { DynamicScene } from "@/components/three/DynamicScene";
import { siteConfig } from "@/data/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-t border-white/10"
    >
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 py-24 sm:px-6">
        <div className="flex w-full items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <h2 className="shrink-0 font-pixel text-2xl uppercase tracking-[0.1em] text-white sm:text-4xl md:text-5xl">
            contact
          </h2>

          <div className="relative h-[22vw] w-[22vw] max-h-[200px] max-w-[200px] min-h-[110px] min-w-[110px] shrink-0">
            <DynamicScene mode="contact" />
          </div>

          <h2 className="shrink-0 font-pixel text-2xl uppercase tracking-[0.1em] text-white sm:text-4xl md:text-5xl">
            {siteConfig.fullName.toLowerCase()}.
          </h2>
        </div>

        <a
          href={`mailto:${siteConfig.email}`}
          className="mt-14 font-pixel text-sm tracking-[0.2em] text-white underline decoration-white/30 underline-offset-8 transition hover:decoration-white"
        >
          {siteConfig.email}
        </a>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6">
          {siteConfig.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="font-pixel text-xs tracking-[0.25em] text-white/55 transition hover:text-white"
              >
                [{s.label}]
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
