import Link from "next/link";
import type { ProjectDocument } from "@/types/real-estate";
import { localizedHref } from "@/lib/i18n/locale";
import type { KeyHoldLocale } from "@/types/localization";

const STATUS_LABEL: Record<KeyHoldLocale, Record<ProjectDocument["availability"], string>> = {
  en: { available: "Open document", "request-only": "Request document", "coming-soon": "Coming soon" },
  fr: { available: "Ouvrir le document", "request-only": "Demander le document", "coming-soon": "Bientôt disponible" },
};

const COPY = {
  en: { empty: "No verified project documents are currently displayed." },
  fr: { empty: "Aucun document de projet vérifié n’est actuellement affiché." },
} as const;

export function ProjectDocuments({ documents, projectTitle, locale = "en" }: { documents: ProjectDocument[]; projectTitle: string; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const statusLabel = STATUS_LABEL[locale];
  if (documents.length === 0) {
    return <p className="text-sm text-[var(--color-stone)]">{copy.empty}</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => {
        const canOpen = document.availability === "available" && Boolean(document.href);
        return (
          <div key={document.id} className="flex min-h-36 flex-col justify-between border border-black/10 p-5">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{document.kind}</p>
              <h3 className="mt-3 text-lg font-medium">{document.label}</h3>
            </div>
            {canOpen ? (
              <a className="text-link mt-5" href={document.href} target="_blank" rel="noreferrer">{statusLabel[document.availability]}</a>
            ) : document.availability === "request-only" ? (
              <Link className="text-link mt-5" href={`${localizedHref("/contact", locale)}?project=${encodeURIComponent(projectTitle)}&document=${encodeURIComponent(document.label)}`}>{statusLabel[document.availability]}</Link>
            ) : (
              <span className="mt-5 text-xs text-[var(--color-stone)]">{statusLabel[document.availability]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
