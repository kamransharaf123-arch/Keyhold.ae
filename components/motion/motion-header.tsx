"use client";

import { useEffect, useState, type ReactNode } from "react";

type MotionHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function MotionHeader({ children, className = "" }: MotionHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 18);
      const delta = y - lastY;
      if (y < 96) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY = y;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={`kh-site-header ${className}`.trim()}
      data-scrolled={scrolled ? "true" : "false"}
      data-nav-hidden={hidden ? "true" : "false"}
    >
      {children}
    </header>
  );
}
