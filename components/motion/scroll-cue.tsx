export function ScrollCue({ label = "Scroll to discover" }: { label?: string }) {
  return (
    <div className="kh-scroll-cue" aria-hidden="true">
      <span className="kh-scroll-cue-line" />
      <span className="kh-scroll-cue-label">{label}</span>
    </div>
  );
}
