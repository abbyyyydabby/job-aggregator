import type { ReactNode } from "react";

type Tint = "green" | "amber" | "blue" | "orange" | "purple";

type StatCardProps = {
  icon: ReactNode;
  tint: Tint;
  label: string;
  value: string;
  delta?: string;
  caption: string;
};

export function StatCard({
  icon,
  tint,
  label,
  value,
  delta,
  caption,
}: StatCardProps) {
  return (
    <div
      className="p-5 rounded-xl flex-1 min-w-[200px]"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <span
        className="flex items-center justify-center mb-4"
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--r-sm)",
          background: `var(--tint-${tint}-bg)`,
          color: `var(--tint-${tint}-fg)`,
        }}
      >
        {icon}
      </span>
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="flex items-baseline gap-2 mb-3">
        <span
          className="text-2xl font-semibold"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            color: "var(--cream)",
          }}
        >
          {value}
        </span>
        {delta && (
          <span
            className="text-xs font-medium"
            style={{ color: "var(--lime)" }}
          >
            {delta}
          </span>
        )}
      </p>
      <p
        className="flex items-center gap-1.5 text-[11px]"
        style={{ color: "var(--muted-dim)" }}
      >
        <MiniSparkline tint={tint} />
        {caption}
      </p>
    </div>
  );
}

function MiniSparkline({ tint }: { tint: Tint }) {
  const heights = [4, 7, 5, 9];
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4.5}
          y={10 - h}
          width="3"
          height={h}
          rx="1"
          fill={`var(--tint-${tint}-fg)`}
          opacity={0.55 + i * 0.12}
        />
      ))}
    </svg>
  );
}
