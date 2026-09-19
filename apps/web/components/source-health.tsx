import Link from "next/link";
import { ChevronRightIcon } from "./icons";

export type SourceCount = { source: string; count: number };

const SOURCE_META: Record<string, { label: string; bg: string; fg: string }> = {
  adzuna: { label: "Adzuna", bg: "#e0a86a", fg: "#241705" },
  jooble: { label: "Jooble", bg: "#7aa8e7", fg: "#0e1a2b" },
};

function metaFor(source: string) {
  return (
    SOURCE_META[source.toLowerCase()] ?? {
      label: source.charAt(0).toUpperCase() + source.slice(1),
      bg: "var(--panel-light)",
      fg: "var(--muted)",
    }
  );
}

export function SourceHealth({ sources }: { sources: SourceCount[] }) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <h2
        className="text-sm font-semibold mb-0.5"
        style={{ color: "var(--cream)" }}
      >
        Source health
      </h2>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        {sources.length === 0
          ? "No jobs ingested yet."
          : "Real counts from every ingested job."}
      </p>

      <div className="flex flex-col gap-3.5 mb-4">
        {sources.length === 0 && (
          <p className="text-xs" style={{ color: "var(--muted-dim)" }}>
            Run the worker's ingestion job to populate this.
          </p>
        )}
        {sources.map((s) => {
          const meta = metaFor(s.source);
          return (
            <div key={s.source} className="flex items-center gap-3">
              <span
                className="flex items-center justify-center shrink-0 text-xs font-semibold"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--r-sm)",
                  background: meta.bg,
                  color: meta.fg,
                }}
                aria-hidden="true"
              >
                {meta.label.slice(0, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--cream)" }}
                >
                  {meta.label}
                </p>
                <p
                  className="text-[11px]"
                  style={{
                    color:
                      s.count > 0 ? "var(--lime)" : "var(--tint-orange-fg)",
                  }}
                >
                  {s.count > 0 ? "Healthy" : "No jobs yet"}
                </p>
              </div>
              <p
                className="text-sm font-medium shrink-0"
                style={{ color: "var(--cream)" }}
              >
                {s.count.toLocaleString()}{" "}
                <span
                  className="text-xs font-normal"
                  style={{ color: "var(--muted)" }}
                >
                  jobs
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <Link
        href="/sources"
        className="flex items-center gap-1 text-xs font-semibold"
        style={{ color: "var(--lime)" }}
      >
        Manage sources
        <ChevronRightIcon size={13} />
      </Link>
    </div>
  );
}
