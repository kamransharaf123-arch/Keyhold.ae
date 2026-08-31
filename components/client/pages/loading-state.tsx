export function AccountLoadingState() {
  return <div className="grid gap-4" aria-label="Loading"><div className="h-10 w-48 animate-pulse motion-reduce:animate-none rounded-xl bg-black/8"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="h-28 animate-pulse motion-reduce:animate-none rounded-2xl bg-black/6"/>)}</div><div className="h-64 animate-pulse motion-reduce:animate-none rounded-[28px] bg-black/6"/></div>;
}
