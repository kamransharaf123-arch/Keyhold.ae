import Link from "next/link";
import type { ProjectDocument } from "@/types/real-estate";

function statusLabel(status: ProjectDocument["availability"]) {
  if (status === "available") return "Open document";
  if (status === "request-only") return "Request document";
  return "Coming soon";
}

export function ProjectDocuments({ documents, projectTitle }: { documents: ProjectDocument[]; projectTitle: string }) {
  if (documents.length === 0) {
    return <p className="text-sm text-[var(--color-stone)]">No verified project documents are currently displayed.</p>;
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
              <a className="text-link mt-5" href={document.href} target="_blank" rel="noreferrer">{statusLabel(document.availability)}</a>
            ) : document.availability === "request-only" ? (
              <Link className="text-link mt-5" href={`/contact?project=${encodeURIComponent(projectTitle)}&document=${encodeURIComponent(document.label)}`}>{statusLabel(document.availability)}</Link>
            ) : (
              <span className="mt-5 text-xs text-[var(--color-stone)]">{statusLabel(document.availability)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
