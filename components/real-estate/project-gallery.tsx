import Image from "next/image";
import type { ProjectImage } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = { en: "Project gallery", fr: "Galerie du projet" } as const;

export function ProjectGallery({ images, locale = "en" }: { images: ProjectImage[]; locale?: KeyHoldLocale }) {
  if (images.length === 0) return null;

  const [lead, ...rest] = images;
  const secondary = rest.slice(0, 3);

  return (
    <section aria-label={COPY[locale]} className="site-container pb-14 lg:pb-20">
      <div className="grid gap-2 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-warm-grey)]">
          <Image src={lead.src} alt={lead.alt} fill priority sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" />
          <span className="absolute bottom-4 left-4 bg-[color:rgba(252,251,248,0.9)] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-graphite)] backdrop-blur">
            {lead.category}
          </span>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-2 lg:grid-cols-1">
          {secondary.map((image) => (
            <div key={`${image.src}-${image.category}`} className="relative aspect-[4/3] overflow-hidden bg-[var(--color-warm-grey)] lg:aspect-auto lg:min-h-0">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 33vw, 30vw" className="object-cover" />
              <span className="absolute bottom-2 left-2 bg-[color:rgba(252,251,248,0.88)] px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-graphite)] backdrop-blur">
                {image.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
