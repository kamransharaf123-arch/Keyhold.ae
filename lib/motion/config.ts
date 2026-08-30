import type { CSSProperties } from "react";
import { websiteContent } from "@/data/website-content";
import type { MotionBodyDataAttributes, MotionIntensity, WebsiteMotionConfig } from "@/types/motion";

export const DEFAULT_WEBSITE_MOTION: WebsiteMotionConfig = {
  enabled: true,
  intensity: "balanced",
  motionScale: 1,
  heroParallax: true,
  heroAmbient: true,
  heroHeadlineReveal: true,
  sectionReveal: true,
  staggerGrids: true,
  imageReveal: true,
  cardHover: true,
  buttonMotion: true,
  metricCountUp: true,
  progressAnimation: true,
  chartAnimation: true,
  pageIntro: true,
  maxParallaxPx: 34,
};

const INTENSITIES = new Set<MotionIntensity>(["subtle", "balanced", "cinematic"]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function parseWebsiteMotionConfig(theme: unknown): WebsiteMotionConfig {
  const themeRecord = asRecord(theme);
  const raw = asRecord(themeRecord.motion);
  const intensity = typeof raw.intensity === "string" && INTENSITIES.has(raw.intensity as MotionIntensity)
    ? (raw.intensity as MotionIntensity)
    : DEFAULT_WEBSITE_MOTION.intensity;

  return {
    enabled: bool(raw.enabled, DEFAULT_WEBSITE_MOTION.enabled),
    intensity,
    motionScale: boundedNumber(raw.motionScale, DEFAULT_WEBSITE_MOTION.motionScale, 0.7, 1.25),
    heroParallax: bool(raw.heroParallax, DEFAULT_WEBSITE_MOTION.heroParallax),
    heroAmbient: bool(raw.heroAmbient, DEFAULT_WEBSITE_MOTION.heroAmbient),
    heroHeadlineReveal: bool(raw.heroHeadlineReveal, DEFAULT_WEBSITE_MOTION.heroHeadlineReveal),
    sectionReveal: bool(raw.sectionReveal, DEFAULT_WEBSITE_MOTION.sectionReveal),
    staggerGrids: bool(raw.staggerGrids, DEFAULT_WEBSITE_MOTION.staggerGrids),
    imageReveal: bool(raw.imageReveal, DEFAULT_WEBSITE_MOTION.imageReveal),
    cardHover: bool(raw.cardHover, DEFAULT_WEBSITE_MOTION.cardHover),
    buttonMotion: bool(raw.buttonMotion, DEFAULT_WEBSITE_MOTION.buttonMotion),
    metricCountUp: bool(raw.metricCountUp, DEFAULT_WEBSITE_MOTION.metricCountUp),
    progressAnimation: bool(raw.progressAnimation, DEFAULT_WEBSITE_MOTION.progressAnimation),
    chartAnimation: bool(raw.chartAnimation, DEFAULT_WEBSITE_MOTION.chartAnimation),
    pageIntro: bool(raw.pageIntro, DEFAULT_WEBSITE_MOTION.pageIntro),
    maxParallaxPx: boundedNumber(raw.maxParallaxPx, DEFAULT_WEBSITE_MOTION.maxParallaxPx, 0, 64),
  };
}

export function websiteMotionConfig(): WebsiteMotionConfig {
  return parseWebsiteMotionConfig(websiteContent.settings?.theme);
}

type MotionCssStyle = CSSProperties & {
  "--kh-reveal-distance"?: string;
  "--kh-motion-duration"?: string;
  "--kh-motion-duration-slow"?: string;
  "--kh-stagger-step"?: string;
  "--kh-ambient-duration"?: string;
};

export function websiteMotionStyle(config = websiteMotionConfig()): MotionCssStyle {
  const intensity = config.intensity === "subtle"
    ? { distance: 14, duration: 560, slow: 900, stagger: 52, ambient: 16000 }
    : config.intensity === "cinematic"
      ? { distance: 30, duration: 860, slow: 1320, stagger: 88, ambient: 19000 }
      : { distance: 22, duration: 720, slow: 1100, stagger: 72, ambient: 17500 };
  const scale = config.motionScale;
  return {
    "--kh-reveal-distance": `${intensity.distance}px`,
    "--kh-motion-duration": `${Math.round(intensity.duration * scale)}ms`,
    "--kh-motion-duration-slow": `${Math.round(intensity.slow * scale)}ms`,
    "--kh-stagger-step": `${Math.round(intensity.stagger * scale)}ms`,
    "--kh-ambient-duration": `${Math.round(intensity.ambient * scale)}ms`,
  };
}

const flag = (value: boolean): "on" | "off" => (value ? "on" : "off");

export function websiteMotionBodyAttributes(config = websiteMotionConfig()): MotionBodyDataAttributes {
  return {
    "data-kh-motion": flag(config.enabled),
    "data-kh-motion-intensity": config.intensity,
    "data-kh-motion-scale": String(config.motionScale),
    "data-kh-hero-parallax": flag(config.heroParallax),
    "data-kh-hero-ambient": flag(config.heroAmbient),
    "data-kh-headline-reveal": flag(config.heroHeadlineReveal),
    "data-kh-section-reveal": flag(config.sectionReveal),
    "data-kh-stagger": flag(config.staggerGrids),
    "data-kh-image-reveal": flag(config.imageReveal),
    "data-kh-card-hover": flag(config.cardHover),
    "data-kh-button-motion": flag(config.buttonMotion),
    "data-kh-count-up": flag(config.metricCountUp),
    "data-kh-progress-motion": flag(config.progressAnimation),
    "data-kh-chart-motion": flag(config.chartAnimation),
    "data-kh-page-intro": flag(config.pageIntro),
    "data-kh-max-parallax": String(config.maxParallaxPx),
  };
}
