import type { ReactNode } from "react";

export function ClientCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-black/8 bg-[var(--color-soft-white)] p-5 sm:p-6 ${className}`.trim()}>{children}</section>;
}

export function ClientMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[var(--color-warm-ivory)] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-stone)]">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold text-[var(--color-graphite)] sm:text-2xl">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">{note}</p> : null}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-dashed border-black/15 bg-[var(--color-warm-ivory)] p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--color-graphite)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-stone)]">{text}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function formatAed(value: number): string {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(value);
}
