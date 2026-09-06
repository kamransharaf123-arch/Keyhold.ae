"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type PageIntroProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The layout that wraps this persists across client-side navigation, so a plain
 * `animation` on <main> only ever plays once (on the first hard load). Replaying it
 * per navigation needs the class removed and re-added on the same DOM node — never a
 * remount — so route content keeps its own component state intact.
 */
export function PageIntro({ children, className = "" }: PageIntroProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const node = ref.current;
    if (!node) return;
    node.classList.remove("kh-page-intro");
    void node.offsetWidth;
    node.classList.add("kh-page-intro");
  }, [pathname]);

  return (
    <main ref={ref} className={`kh-page-intro ${className}`.trim()}>
      {children}
    </main>
  );
}
