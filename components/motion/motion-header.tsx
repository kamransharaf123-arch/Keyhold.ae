"use client";

import { useEffect, useState, type ReactNode } from "react";

type MotionHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function MotionHeader({ children, className = "" }: MotionHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 18);
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

  return <header className={`kh-site-header ${className}`.trim()} data-scrolled={scrolled ? "true" : "false"}>{children}</header>;
}
