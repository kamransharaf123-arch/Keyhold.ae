"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type ProgressStyle = CSSProperties & { "--kh-progress-value": string };

type AnimatedProgressProps = {
  value: number;
  label: string;
  className?: string;
  showValue?: boolean;
};

export function AnimatedProgress({ value, label, className = "", showValue = false }: AnimatedProgressProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const motion = useMotionPreference();
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const style: ProgressStyle = { "--kh-progress-value": `${safe}%` };

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready) return;
    const active = motion.enabled && document.body.dataset.khProgressMotion !== "off";
    node.dataset.motionReady = active ? "true" : "false";
    if (!active) node.dataset.motionVisible = "true";
  }, [motion.enabled, motion.ready]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khProgressMotion === "off") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.motionVisible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [motion.enabled, motion.ready]);

  return (
    <div ref={ref} className={`kh-progress ${className}`.trim()} style={style} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safe)} data-motion-visible="false">
      <div className="kh-progress-track"><span className="kh-progress-fill" /></div>
      {showValue ? <span className="kh-progress-value">{Math.round(safe)}%</span> : null}
    </div>
  );
}
