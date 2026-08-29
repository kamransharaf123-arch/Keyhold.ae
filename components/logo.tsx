import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="KeyHold home"
      className="inline-flex items-center gap-3 text-[0.78rem] font-semibold tracking-[0.34em] text-[var(--color-graphite)]"
    >
      <span className="grid size-8 place-items-center rounded-full border border-[rgba(183,154,107,0.55)] text-[0.65rem] tracking-normal">
        K
      </span>
      <span>KEYHOLD</span>
    </Link>
  );
}
