import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import type { ProjectPreview } from "@/data/site";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

type ProjectCardProps = {
  project: ProjectPreview;
  locale?: KeyHoldLocale;
};

const COPY = { en: "Explore", fr: "Découvrir" } as const;

export function ProjectCard({ project, locale = "en" }: ProjectCardProps) {
  return (
    <article className="kh-motion-card group">
      <Link href={localizedHref(`/projects/${project.slug}`, locale)} className="block" aria-label={`${COPY[locale]} ${project.title}`}>
        <div className="kh-motion-image relative aspect-[4/5] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute left-4 top-4 bg-[color:rgba(234,240,230,0.94)] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-sage-deep)] backdrop-blur">
            {project.category}
          </div>
          <div className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-[var(--color-teal)] text-[var(--color-soft-white)]">
            <ArrowUpRightIcon className="kh-motion-arrow size-5" />
          </div>
        </div>
        <div className="pt-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-stone)]">{project.location}</p>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-[var(--color-graphite)]">{project.title}</h3>
            </div>
            <p className="shrink-0 text-sm font-medium text-[var(--color-graphite)]">{project.price}</p>
          </div>
          <p className="mt-2 text-sm text-[var(--color-stone)]">{project.meta}</p>
        </div>
      </Link>
    </article>
  );
}
