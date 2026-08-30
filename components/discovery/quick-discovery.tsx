import { areas } from "@/data/real-estate";

export function QuickDiscovery() {
  return (
    <section className="border-b border-black/[0.08] bg-[var(--color-bone)]">
      <form action="/discover" method="get" className="site-container grid gap-3 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.7fr)_minmax(11rem,0.8fr)_auto] md:items-end">
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Search Dubai property</span>
          <input name="q" type="search" placeholder="Project, area, developer or lifestyle" className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-4 text-base outline-none focus:border-[var(--color-champagne)]" />
        </label>
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Route</span>
          <select name="categories" defaultValue="" className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">All property</option>
            <option value="Off-Plan">Off-Plan</option>
            <option value="Ready">Ready</option>
            <option value="Short-Term">Short-Term</option>
            <option value="Long-Term">Long-Term</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Area</span>
          <select name="areaSlugs" defaultValue="" className="min-h-12 w-full border border-black/10 bg-[var(--color-soft-white)] px-3 text-base md:text-sm">
            <option value="">All Dubai areas</option>
            {areas.map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
          </select>
        </label>
        <button type="submit" className="button button-dark min-h-12">Search</button>
      </form>
    </section>
  );
}
