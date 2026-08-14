"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Scene = dynamic(
  () => import("@/components/three/Scene").then((m) => m.Scene),
  { ssr: false, loading: () => <div className="h-full w-full bg-black" /> }
);

export function DynamicScene(props: ComponentProps<typeof Scene>) {
  return <Scene {...props} />;
}
