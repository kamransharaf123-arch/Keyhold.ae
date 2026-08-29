import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import type { ProjectPreview } from "@/data/site";

type ProjectCardProps = {
  project: ProjectPreview;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group">
      <Link href={`/projects/${project.slug}`} className="block" aria-label={`Explore ${project.title}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image
            src={project.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
          <div className="absolute left-4 top-4 bg-[color:rgba(252,251,248,0.9)] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-graphite)] backdrop-blur">
            {project.category}
          </div>
          <div className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-[var(--color-soft-white)] text-[var(--color-graphite)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
            <ArrowUpRightIcon className="size-5" />
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
