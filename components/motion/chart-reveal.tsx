"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type ChartRevealProps = {
  children: ReactNode;
  className?: string;
};

export function ChartReveal({ children, className = "" }: ChartRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const motion = useMotionPreference();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    const active = motion.enabled && document.body.dataset.khChartMotion !== "off";
    node.dataset.motionReady = active ? "true" : "false";
    if (!active) node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khChartMotion === "off") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.motionVisible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion.enabled, motion.ready]);

  return <div ref={ref} className={className} data-kh-chart data-motion-visible="false">{children}</div>;
}
