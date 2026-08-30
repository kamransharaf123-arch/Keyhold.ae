"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/components/motion/use-motion-preference";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  durationMs?: number;
  locale?: string;
  className?: string;
};

export function CountUp({ value, prefix = "", suffix = "", decimals = 0, durationMs = 850, locale = "en-AE", className = "" }: CountUpProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(value);
  const motion = useMotionPreference();
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeDecimals = Math.max(0, Math.min(4, Math.trunc(decimals)));
  const formatter = new Intl.NumberFormat(locale, { minimumFractionDigits: safeDecimals, maximumFractionDigits: safeDecimals });

  useLayoutEffect(() => {
    if (!motion.ready) return;
    const active = motion.enabled && document.body.dataset.khCountUp !== "off";
    if (!active || hasAnimatedRef.current) setDisplayValue(safeValue);
    else setDisplayValue(0);
  }, [motion.enabled, motion.ready, safeValue]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !motion.ready || !motion.enabled || document.body.dataset.khCountUp === "off" || hasAnimatedRef.current) {
      setDisplayValue(safeValue);
      return;
    }
    let animationFrame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      const startedAt = performance.now();
      const duration = Math.max(180, Math.min(2200, durationMs * motion.motionScale));
      const from = 0;
      const delta = safeValue - from;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setDisplayValue(from + delta * eased);
        if (t < 1) animationFrame = requestAnimationFrame(tick);
        else hasAnimatedRef.current = true;
      };
      animationFrame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [durationMs, motion.enabled, motion.motionScale, motion.ready, safeValue]);

  return <span ref={rootRef} className={className}>{prefix}{formatter.format(displayValue)}{suffix}</span>;
}
