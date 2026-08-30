import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-2 text-4xl tracking-[-0.03em] sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-stone)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({ title, eyebrow, children, id }: { title?: string; eyebrow?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="min-w-0 border border-black/10 bg-[var(--color-soft-white)] p-5 sm:p-7">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="font-display mt-1 text-2xl tracking-[-0.02em]">{title}</h2> : null}
      <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function AdminNotice({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  return (
    <div className={`mb-5 border px-4 py-3 text-sm ${error ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta-soft)] text-[var(--color-terracotta-deep)]" : "border-[var(--color-sage)] bg-[var(--color-sage-soft)] text-[var(--color-sage-deep)]"}`}>
      {error ? decodeURIComponent(error) : decodeURIComponent(notice ?? "Saved")}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone = status === "published" || status === "verified" || status === "available"
    ? "bg-[var(--color-sage-soft)] text-[var(--color-sage-deep)]"
    : status === "archived" || status === "sold"
      ? "bg-[var(--color-sand)] text-[var(--color-stone)]"
      : "bg-[var(--color-champagne-soft)] text-[var(--color-champagne-ink)]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${tone}`}>{status}</span>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 text-sm font-medium">
      <span>{label}</span>
      {hint ? <span className="mt-1 block text-xs font-normal leading-5 text-[var(--color-stone)]">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClass = "min-h-11 w-full min-w-0 border border-black/15 bg-white px-3 py-2 text-base text-[var(--color-graphite)] placeholder:text-black/35";
export const textareaClass = `${inputClass} min-h-28 resize-y`;
export const selectClass = inputClass;
