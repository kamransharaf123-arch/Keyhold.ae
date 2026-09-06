import Link from "next/link";
import { Logo } from "@/components/logo";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="site-container flex min-h-screen flex-col justify-center py-20">
          <div className="animate-rise">
            <Logo />
            <p className="eyebrow mt-10">404</p>
            <h1 className="font-display mt-4 text-5xl tracking-[-0.04em] sm:text-6xl">This address is not part of the collection.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-stone)]">Return to KeyHold or continue browsing Dubai projects.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="button button-dark">Home</Link>
              <Link href="/projects" className="button border border-black/10">Projects</Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
