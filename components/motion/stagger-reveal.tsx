"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  once?: boolean;
};

export function StaggerReveal({ children, className = "", as = "div", once = true }: StaggerRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const motion = useMotionPreference();
  const Tag = as;

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    const active = motion.enabled && document.body.dataset.khStagger !== "off";
    node.dataset.motionReady = active ? "true" : "false";
    if (!active) node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khStagger === "off") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.motionVisible = "true";
          if (once) observer.disconnect();
        } else if (!once) {
          node.dataset.motionVisible = "false";
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion.enabled, motion.ready, once]);

  return (
    <Tag ref={ref as never} className={`kh-stagger ${className}`.trim()} data-motion-visible="false">
      {children}
    </Tag>
  );
}
