import Link from "next/link";

export default function NotFound() {
  return (
    <section className="site-container flex min-h-[60svh] items-center py-20">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-4 text-5xl tracking-[-0.04em] sm:text-6xl">This address is not part of the collection.</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-stone)]">Return to KeyHold or continue browsing Dubai projects.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="button button-dark">Home</Link>
          <Link href="/projects" className="button border border-black/10">Projects</Link>
        </div>
      </div>
    </section>
  );
}
