"use client";

import { siteConfig } from "@/data/site";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center border-t border-white/10 px-6 py-24"
    >
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <p className="font-pixel text-xs tracking-[0.35em] text-white/45">
          CONTACT
        </p>
        <h2 className="mt-4 font-pixel text-3xl uppercase tracking-wide text-white sm:text-4xl">
          Let&apos;s build something.
        </h2>

        <a
          href={`mailto:${siteConfig.email}`}
          className="mt-10 font-pixel text-sm tracking-[0.15em] text-white underline decoration-white/30 underline-offset-8 transition hover:decoration-white"
        >
          {siteConfig.email}
        </a>

        <a
          href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
          className="mt-4 font-pixel text-xs tracking-[0.2em] text-white/55 transition hover:text-white"
        >
          {siteConfig.phone}
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

        <p className="mt-12 max-w-md font-pixel text-[10px] leading-relaxed tracking-wide text-white/35">
          Parents or guardians are welcome to CC themselves on first contact.
          Prefer WhatsApp or Signal? Say so in your email.
        </p>
      </div>
    </section>
  );
}
