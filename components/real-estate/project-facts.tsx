export function ProjectFacts({ facts }: { facts: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0 border-b border-r border-black/10 p-5 lg:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{fact.label}</p>
          <p className="mt-3 break-words text-lg font-medium text-[var(--color-graphite)]">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}
