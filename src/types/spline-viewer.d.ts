import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          url?: string;
          background?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
