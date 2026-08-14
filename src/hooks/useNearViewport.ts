"use client";

import { useEffect, useState } from "react";

/** Lazy-mount 3D when the section is near the viewport. */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin = "200px"
) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return near;
}
