"use client";

import { useEffect, useState } from "react";
import type { MotionIntensity } from "@/types/motion";

type MotionPreference = {
  ready: boolean;
  enabled: boolean;
  reduced: boolean;
  intensity: MotionIntensity;
  motionScale: number;
  maxParallaxPx: number;
};

function numberFromDataset(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function readPreference(reduced: boolean): MotionPreference {
  if (typeof document === "undefined") {
    return { ready: false, enabled: false, reduced, intensity: "balanced", motionScale: 1, maxParallaxPx: 34 };
  }
  const dataset = document.body.dataset;
  const intensity = dataset.khMotionIntensity === "subtle" || dataset.khMotionIntensity === "cinematic"
    ? dataset.khMotionIntensity
    : "balanced";
  return {
    ready: true,
    enabled: !reduced && dataset.khMotion !== "off",
    reduced,
    intensity,
    motionScale: numberFromDataset(dataset.khMotionScale, 1, 0.7, 1.25),
    maxParallaxPx: numberFromDataset(dataset.khMaxParallax, 34, 0, 64),
  };
}

export function useMotionPreference(): MotionPreference {
  const [state, setState] = useState<MotionPreference>(() => {
    if (typeof window === "undefined") {
      return { ready: false, enabled: false, reduced: false, intensity: "balanced", motionScale: 1, maxParallaxPx: 34 };
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    return readPreference(media.matches);
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const refresh = () => setState(readPreference(media.matches));
    refresh();
    media.addEventListener?.("change", refresh);
    return () => media.removeEventListener?.("change", refresh);
  }, []);

  return state;
}
