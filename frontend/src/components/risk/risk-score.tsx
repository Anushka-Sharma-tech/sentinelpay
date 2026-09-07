import type { RiskLevel } from "@/lib/types/risk";

export function RiskScore({
  score,
  level,
  compact = false,
}: {
  score: number;
  level: RiskLevel;
  compact?: boolean;
}) {
  const colorMap = {
    LOW: "text-emerald-400",
    MEDIUM: "text-amber-400",
    HIGH: "text-rose-500",
  };

  const bgMap = {
    LOW: "bg-emerald-400",
    MEDIUM: "bg-amber-400",
    HIGH: "bg-rose-500",
  };

  const activeColor = colorMap[level] || colorMap.MEDIUM;
  const activeBg = bgMap[level] || bgMap.MEDIUM;

  return (
    <div className={`relative flex flex-col w-full ${compact ? "gap-2" : "gap-3"}`}>
      <div className="flex items-baseline gap-1">
        <span 
          className={`font-serif tracking-tight ${compact ? "text-3xl" : "text-6xl"} ${activeColor}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </span>
        <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">
          / 100
        </span>
      </div>
      
      {/* Sleek, contained linear gauge replacing the broken SVG circle */}
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${activeBg} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%`, boxShadow: `0 0 10px var(--tw-shadow-color)` }} 
        />
      </div>
    </div>
  );
}