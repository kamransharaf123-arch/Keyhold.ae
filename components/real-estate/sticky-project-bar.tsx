"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type StickyProjectBarProps = {
  title: string;
  price: string;
  enquireHref: string;
  enquireLabel: string;
};

export function StickyProjectBar({ title, price, enquireHref, enquireLabel }: StickyProjectBarProps) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {visible ? (
        <div className="kh-float-in fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[color:rgba(252,251,248,0.96)] shadow-[0_-12px_34px_rgba(36,49,47,0.08)] backdrop-blur">
          <div className="site-container flex items-center justify-between gap-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-graphite)]">{title}</p>
              <p className="font-display text-lg text-[var(--color-teal-deep)]">{price}</p>
            </div>
            <Link href={enquireHref} className="button button-dark shrink-0 text-xs">
              {enquireLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
