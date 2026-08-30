"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type AnimatedHeadlineProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function AnimatedHeadline({ text, className = "", as = "h1" }: AnimatedHeadlineProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const motion = useMotionPreference();
  const Tag = as;
  const words = text.trim().split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    const active = motion.enabled && document.body.dataset.khHeadlineReveal !== "off";
    node.dataset.motionReady = active ? "true" : "false";
    if (!active) node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khHeadlineReveal === "off") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.motionVisible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion.enabled, motion.ready]);

  return (
    <Tag ref={ref as never} className={`kh-headline-reveal ${className}`.trim()} aria-label={text} data-motion-visible="false">
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span className="kh-headline-word" style={{ "--kh-word-index": index } as CSSProperties} key={`${word}-${index}`}>
            {word}{index < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}
