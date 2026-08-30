"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  delayMs?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "article";
};

type MotionStyle = CSSProperties & { "--kh-reveal-delay"?: string };

export function Reveal({ children, className = "", id, delayMs = 0, once = true, amount = 0.14, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const motion = useMotionPreference();
  const Tag = as;
  const style: MotionStyle = { "--kh-reveal-delay": `${Math.max(0, Math.min(1000, delayMs))}ms` };

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    node.dataset.motionReady = motion.enabled && document.body.dataset.khSectionReveal !== "off" ? "true" : "false";
    if (!motion.enabled || document.body.dataset.khSectionReveal === "off") node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khSectionReveal === "off") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.motionVisible = "true";
          if (once) observer.disconnect();
        } else if (!once) {
          node.dataset.motionVisible = "false";
        }
      },
      { threshold: Math.max(0.01, Math.min(0.8, amount)), rootMargin: "0px 0px -7% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, motion.enabled, motion.ready, once]);

  return (
    <Tag ref={ref as never} id={id} className={`kh-reveal ${className}`.trim()} style={style} data-motion-visible="false">
      {children}
    </Tag>
  );
}
