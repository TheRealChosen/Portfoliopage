"use client";

type Props = {
  onLeft: () => void;
  onRight: () => void;
};

export function RotationButtons({ onLeft, onRight }: Props) {
  return (
    <div className="pointer-events-auto flex items-center gap-3">
      <button
        type="button"
        aria-label="Rotate left"
        onClick={onLeft}
        className="group flex h-11 w-11 items-center justify-center border border-white/40 bg-black text-white transition hover:border-white hover:bg-white hover:text-black"
      >
        <span className="font-pixel text-lg leading-none">◀</span>
      </button>
      <span className="font-pixel text-[10px] uppercase tracking-[0.2em] text-white/50">
        nudge
      </span>
      <button
        type="button"
        aria-label="Rotate right"
        onClick={onRight}
        className="group flex h-11 w-11 items-center justify-center border border-white/40 bg-black text-white transition hover:border-white hover:bg-white hover:text-black"
      >
        <span className="font-pixel text-lg leading-none">▶</span>
      </button>
    </div>
  );
}
