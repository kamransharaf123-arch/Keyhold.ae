import Link from "next/link";

export default function NotFoundFr() {
  return (
    <section className="site-container flex min-h-[60svh] items-center py-20">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-4 text-5xl tracking-[-0.04em] sm:text-6xl">Cette adresse ne fait pas partie de la sélection.</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-stone)]">Retournez à l’accueil KeyHold ou continuez à explorer les projets à Dubaï.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/fr" className="button button-dark">Accueil</Link>
          <Link href="/fr/projects" className="button border border-black/10">Projets</Link>
        </div>
      </div>
    </section>
  );
}
