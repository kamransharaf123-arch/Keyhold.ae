import { AnimatedHeadline, Reveal } from "@/components/motion";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="kh-page-hero border-b border-black/[0.07] bg-[linear-gradient(135deg,var(--color-champagne-soft),var(--color-soft-white)_58%,var(--color-teal-soft))]">
      <div className="site-container relative py-20 sm:py-28 lg:py-32">
        <Reveal delayMs={40}>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <AnimatedHeadline
          text={title}
          className="display-title mt-5 max-w-5xl text-5xl sm:text-6xl lg:text-7xl"
        />
        <Reveal delayMs={140}>
          <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--color-stone)] sm:text-lg">
            {description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
