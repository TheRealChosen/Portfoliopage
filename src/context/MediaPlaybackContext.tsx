"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MediaPlaybackContextValue = {
  isMediaPlaying: boolean;
  setMediaPlaying: (playing: boolean) => void;
};

const MediaPlaybackContext = createContext<MediaPlaybackContextValue | null>(
  null
);

export function MediaPlaybackProvider({ children }: { children: ReactNode }) {
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);

  const setMediaPlaying = useCallback((playing: boolean) => {
    setIsMediaPlaying(playing);
  }, []);

  const value = useMemo(
    () => ({ isMediaPlaying, setMediaPlaying }),
    [isMediaPlaying, setMediaPlaying]
  );

  return (
    <MediaPlaybackContext.Provider value={value}>
      {children}
    </MediaPlaybackContext.Provider>
  );
}

export function useMediaPlayback() {
  const ctx = useContext(MediaPlaybackContext);
  if (!ctx) {
    throw new Error("useMediaPlayback must be used within MediaPlaybackProvider");
  }
  return ctx;
}
