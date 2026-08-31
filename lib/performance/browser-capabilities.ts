export type BrowserPerformanceMode = "full" | "lite";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function getBrowserPerformanceMode(): BrowserPerformanceMode {
  if (typeof window === "undefined") return "lite";
  const nav = navigator as NavigatorWithHints;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const saveData = Boolean(nav.connection?.saveData);
  const slowNetwork = ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const lowCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  return coarsePointer || narrow || saveData || slowNetwork || lowMemory || lowCores ? "lite" : "full";
}

export function allowCinematicParallax(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return getBrowserPerformanceMode() === "full";
}
