# Halftone Portfolio

Single-page portfolio — Next.js 14, React Three Fiber, GSAP, Lenis.

## Run

```bash
npm install
npm run dev
```

## PSP depth-map section

Assets in `/public/images/`:

- `psp-100.png` — diffuse photo
- `psp-depth.png` — greyscale depth map

Demo screen video: `/public/videos/psp-demo.mp4`

Tune screen UV + rotation in `src/data/projects.ts` (`psp-parallax` entry).

## Deploy

Works on Vercel / Netlify (`npm run build`).
