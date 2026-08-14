"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const VIEWER_SCRIPT =
  "https://unpkg.com/@splinetool/viewer@1.12.98/build/spline-viewer.js";
const SCENE_URL =
  "https://prod.spline.design/fwknmRlvq6qQovFe/scene.splinecode";

type Props = {
  className?: string;
};

function hideSplineLogo(viewer: HTMLElement) {
  const root = viewer.shadowRoot;
  if (!root || root.querySelector("#spline-hide-logo")) return;

  const style = document.createElement("style");
  style.id = "spline-hide-logo";
  style.textContent = `
    #logo,
    .logo,
    a[href*="spline.design"],
    a[href*="splinetool"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  root.appendChild(style);
}

function configureViewer(viewer: HTMLElement) {
  viewer.setAttribute("url", SCENE_URL);
  viewer.setAttribute("background", "transparent");
  viewer.className = "spline-hero-viewer h-full w-full";

  hideSplineLogo(viewer);
  viewer.addEventListener("load", () => hideSplineLogo(viewer));

  const observer = new MutationObserver(() => hideSplineLogo(viewer));
  if (viewer.shadowRoot) {
    observer.observe(viewer.shadowRoot, { childList: true, subtree: true });
  } else {
    observer.observe(viewer, { childList: true });
  }

  return () => observer.disconnect();
}

export function SplineHero({ className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    let cleanupObserver: (() => void) | undefined;

    const mount = () => {
      if (!el || el.querySelector("spline-viewer")) return;

      const viewer = document.createElement("spline-viewer");
      cleanupObserver = configureViewer(viewer);
      el.appendChild(viewer);

      requestAnimationFrame(() => hideSplineLogo(viewer));
    };

    if (customElements.get("spline-viewer")) {
      mount();
    } else {
      void customElements.whenDefined("spline-viewer").then(mount);
    }

    return () => {
      cleanupObserver?.();
      el?.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className ?? "relative h-full w-full bg-transparent"}
    >
      <Script src={VIEWER_SCRIPT} type="module" strategy="afterInteractive" />
    </div>
  );
}
