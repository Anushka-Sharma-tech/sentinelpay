import type { RiskSignal } from "@/lib/types/risk";

export function SignalList({ signals }: { signals: RiskSignal[] }) {
  return (
    <div className="signal-list">
      {signals.map((signal) => (
        <div className="signal-row" key={signal.key}>
          <div className="signal-heading">
            <div>
              <strong>{signal.label}</strong>
              <p>{signal.summary}</p>
            </div>
            <span className="mono">
              {signal.score === null
                ? "Unavailable"
                : Math.round(signal.score * 100)}
            </span>
          </div>
          <div className="signal-track" aria-hidden="true">
            <span
              style={{
                width:
                  signal.score === null
                    ? "0%"
                    : `${Math.round(signal.score * 100)}%`,
              }}
            />
          </div>
          {signal.limitation && (
            <p className="signal-limitation">{signal.limitation}</p>
          )}
        </div>
      ))}
    </div>
  );
}
