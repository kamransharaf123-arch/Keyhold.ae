export type MotionIntensity = "subtle" | "balanced" | "cinematic";

export type WebsiteMotionConfig = {
  enabled: boolean;
  intensity: MotionIntensity;
  motionScale: number;
  heroParallax: boolean;
  heroAmbient: boolean;
  heroHeadlineReveal: boolean;
  sectionReveal: boolean;
  staggerGrids: boolean;
  imageReveal: boolean;
  cardHover: boolean;
  buttonMotion: boolean;
  metricCountUp: boolean;
  progressAnimation: boolean;
  chartAnimation: boolean;
  pageIntro: boolean;
  maxParallaxPx: number;
};

export type MotionBodyDataAttributes = {
  "data-kh-motion": "on" | "off";
  "data-kh-motion-intensity": MotionIntensity;
  "data-kh-motion-scale": string;
  "data-kh-hero-parallax": "on" | "off";
  "data-kh-hero-ambient": "on" | "off";
  "data-kh-headline-reveal": "on" | "off";
  "data-kh-section-reveal": "on" | "off";
  "data-kh-stagger": "on" | "off";
  "data-kh-image-reveal": "on" | "off";
  "data-kh-card-hover": "on" | "off";
  "data-kh-button-motion": "on" | "off";
  "data-kh-count-up": "on" | "off";
  "data-kh-progress-motion": "on" | "off";
  "data-kh-chart-motion": "on" | "off";
  "data-kh-page-intro": "on" | "off";
  "data-kh-max-parallax": string;
};
