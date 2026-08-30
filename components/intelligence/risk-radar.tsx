import type { IntelligenceRiskDimension } from "@/types/intelligence";

function pointFor(index: number, count: number, value: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  const scaled = radius * (Math.max(0, Math.min(10, value)) / 10);
  return `${center + Math.cos(angle) * scaled},${center + Math.sin(angle) * scaled}`;
}

function ringPoints(count: number, value: number, radius: number, center: number) {
  return Array.from({ length: count }, (_, index) => pointFor(index, count, value, radius, center)).join(" ");
}

export function RiskRadar({ dimensions }: { dimensions: IntelligenceRiskDimension[] }) {
  if (dimensions.length < 3) {
    return <p className="text-sm text-[var(--color-stone)]">Not enough risk dimensions to render the radar.</p>;
  }

  const center = 150;
  const radius = 92;
  const count = dimensions.length;
  const dataPoints = dimensions.map((item, index) => pointFor(index, count, item.risk, radius, center)).join(" ");

  return (
    <div className="space-y-6">
      <svg viewBox="0 0 300 300" role="img" aria-label="Risk radar. Higher values indicate higher modelled risk." className="mx-auto w-full max-w-[18rem]">
        {[2.5, 5, 7.5, 10].map((ring) => (
          <polygon key={ring} points={ringPoints(count, ring, radius, center)} fill="none" stroke="rgba(23,23,23,0.12)" strokeWidth="1" />
        ))}
        {dimensions.map((_, index) => {
          const outer = pointFor(index, count, 10, radius, center).split(",");
          return <line key={index} x1={center} y1={center} x2={outer[0]} y2={outer[1]} stroke="rgba(23,23,23,0.10)" strokeWidth="1" />;
        })}
        <polygon points={dataPoints} fill="rgba(183,154,107,0.20)" stroke="var(--color-champagne)" strokeWidth="2" />
        {dimensions.map((item, index) => {
          const [x, y] = pointFor(index, count, item.risk, radius, center).split(",");
          return <circle key={item.key} cx={x} cy={y} r="4" fill="var(--color-graphite)" />;
        })}
      </svg>

      <div className="space-y-4">
        {dimensions.map((item) => (
          <div key={item.key} className="border-b border-black/10 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="font-display text-xl">{item.risk.toFixed(1)} / 10</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--color-stone)]">{item.rationale}</p>
          </div>
        ))}
        <p className="text-[0.7rem] leading-5 text-[var(--color-stone)]">Risk scale: 0 = lower modelled risk, 10 = higher modelled risk. It is an analytical framework, not a prediction of loss.</p>
      </div>
    </div>
  );
}
