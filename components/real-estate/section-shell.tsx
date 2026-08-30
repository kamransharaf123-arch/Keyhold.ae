import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";

export function ProjectSection({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <Reveal as="section" id={id} className="site-container border-t border-black/10 py-14 lg:py-20 [scroll-margin-top:6rem]">
      <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:gap-14">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="font-display mt-3 text-3xl leading-tight lg:text-4xl">{title}</h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </Reveal>
  );
}
