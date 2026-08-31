"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";
import { allowCinematicParallax } from "@/lib/performance/browser-capabilities";

type HeroParallaxProps = {
  media: ReactNode;
  children: ReactNode;
  className?: string;
  mediaClassName?: string;
};

export function HeroParallax({ media, children, className = "", mediaClassName = "" }: HeroParallaxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const motion = useMotionPreference();

  useEffect(() => {
    const root = rootRef.current;
    const mediaNode = mediaRef.current;
    if (!root || !mediaNode || !motion.ready || !motion.enabled || document.body.dataset.khHeroParallax === "off" || !allowCinematicParallax()) {
      mediaNode?.style.removeProperty("--kh-parallax-y");
      return;
    }

    let frame = 0;
    let active = false;
    const render = () => {
      frame = 0;
      if (!active) return;
      const rect = root.getBoundingClientRect();
      const viewport = Math.max(1, window.innerHeight);
      if (rect.bottom < -160 || rect.top > viewport + 160) return;
      const progress = (viewport - rect.top) / (viewport + Math.max(1, rect.height));
      const centered = (Math.min(1, Math.max(0, progress)) - 0.5) * 2;
      const max = motion.maxParallaxPx;
      const translate = Math.max(-max, Math.min(max, centered * max));
      mediaNode.style.setProperty("--kh-parallax-y", `${translate.toFixed(2)}px`);
    };
    const schedule = () => {
      if (active && !frame) frame = window.requestAnimationFrame(render);
    };
    const start = () => {
      if (active) return;
      active = true;
      mediaNode.style.willChange = "transform";
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      schedule();
    };
    const stop = () => {
      if (!active) return;
      active = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mediaNode.style.willChange = "auto";
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const observer = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? start() : stop()),
      { rootMargin: "160px 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [motion.enabled, motion.maxParallaxPx, motion.ready]);

  return (
    <div ref={rootRef} className={`kh-cinematic-hero ${className}`.trim()}>
      <div ref={mediaRef} className={`kh-cinematic-hero-media ${mediaClassName}`.trim()}>{media}</div>
      <div className="kh-cinematic-hero-content">{children}</div>
    </div>
  );
}
