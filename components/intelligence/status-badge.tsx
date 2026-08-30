import { getStatusLabel } from "@/lib/intelligence";
import type { IntelligenceDataStatus, SourceStatus } from "@/types/intelligence";

export function StatusBadge({ status }: { status: IntelligenceDataStatus | SourceStatus }) {
  return (
    <span className="inline-flex min-h-7 items-center border border-black/10 bg-[var(--color-bone)] px-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-stone)]">
      {getStatusLabel(status)}
    </span>
  );
}
