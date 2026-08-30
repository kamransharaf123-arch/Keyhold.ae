"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

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
    if (!root || !mediaNode || !motion.ready || !motion.enabled || document.body.dataset.khHeroParallax === "off") return;

    let frame = 0;
    const render = () => {
      frame = 0;
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
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motion.enabled, motion.maxParallaxPx, motion.ready]);

  return (
    <div ref={rootRef} className={`kh-cinematic-hero ${className}`.trim()}>
      <div ref={mediaRef} className={`kh-cinematic-hero-media ${mediaClassName}`.trim()}>{media}</div>
      <div className="kh-cinematic-hero-content">{children}</div>
    </div>
  );
}
