"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
};

export function ImageReveal({ children, className = "" }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const motion = useMotionPreference();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    const active = motion.enabled && document.body.dataset.khImageReveal !== "off";
    node.dataset.motionReady = active ? "true" : "false";
    if (!active) node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khImageReveal === "off") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.motionVisible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion.enabled, motion.ready]);

  return <div ref={ref} className={`kh-image-reveal ${className}`.trim()} data-motion-visible="false">{children}</div>;
}
