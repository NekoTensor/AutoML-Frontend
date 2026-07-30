export default function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden my-3">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent transition-[width] duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}
