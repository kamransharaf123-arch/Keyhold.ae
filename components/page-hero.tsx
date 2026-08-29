type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-black/[0.08] bg-[var(--color-bone)]">
      <div className="site-container py-20 sm:py-28 lg:py-32">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="display-title mt-5 max-w-5xl animate-rise text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-7 max-w-2xl animate-rise text-base leading-8 text-[var(--color-stone)] sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
