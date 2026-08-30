import { getStatusLabel } from "@/lib/intelligence";
import type { IntelligenceDataStatus, SourceStatus } from "@/types/intelligence";

export function StatusBadge({ status }: { status: IntelligenceDataStatus | SourceStatus }) {
  const tone = getTone(status);
  return (
    <span className={`inline-flex min-h-7 items-center border px-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${tone}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function getTone(status: IntelligenceDataStatus | SourceStatus) {
  if (status === "verified") {
    return "border-[var(--color-sage)]/35 bg-[var(--color-sage-soft)] text-[var(--color-sage-deep)]";
  }
  if (status === "pending-verification") {
    return "border-[var(--color-champagne)]/40 bg-[var(--color-champagne-soft)] text-[var(--color-champagne-ink)]";
  }
  return "border-[var(--color-teal)]/25 bg-[var(--color-teal-soft)] text-[var(--color-teal-deep)]";
}
