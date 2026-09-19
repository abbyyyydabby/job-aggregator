import { prisma } from "@job-aggregator/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { DatabaseIcon } from "@/components/icons";

const SOURCE_META: Record<
  string,
  { label: string; bg: string; fg: string; description: string }
> = {
  adzuna: {
    label: "Adzuna",
    bg: "#e0a86a",
    fg: "#241705",
    description: "Aggregated job board listings via the Adzuna search API.",
  },
  jooble: {
    label: "Jooble",
    bg: "#7aa8e7",
    fg: "#0e1a2b",
    description: "Aggregated job board listings via the Jooble API.",
  },
};

function metaFor(source: string) {
  return (
    SOURCE_META[source.toLowerCase()] ?? {
      label: source.charAt(0).toUpperCase() + source.slice(1),
      bg: "var(--panel-light)",
      fg: "var(--muted)",
      description: "",
    }
  );
}

function timeAgo(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const hours = Math.round(diffMs / 3600000);
  if (hours < 1) return "less than an hour ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function SourcesPage() {
  await getCurrentUser();

  const [counts, latestPerSource] = await Promise.all([
    prisma.job.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.job.groupBy({ by: ["source"], _max: { createdAt: true } }),
  ]);

  const latestMap = new Map(
    latestPerSource.map((s) => [s.source, s._max.createdAt])
  );
  const totalJobs = counts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <div className="px-8 py-8 max-w-[900px]">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--cream)",
        }}
      >
        Sources
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {totalJobs.toLocaleString()} jobs ingested across {counts.length}{" "}
        {counts.length === 1 ? "source" : "sources"}.
      </p>

      {counts.length === 0 ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--cream)" }}
          >
            No jobs ingested yet.
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Run the worker's ingestion job (<code>schedule-ingestion.ts</code>)
            to start pulling from Adzuna and Jooble.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {counts.map((s) => {
            const meta = metaFor(s.source);
            const latest = latestMap.get(s.source);
            return (
              <div
                key={s.source}
                className="p-5 rounded-xl flex items-center gap-4"
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0 text-sm font-semibold"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--r-sm)",
                    background: meta.bg,
                    color: meta.fg,
                  }}
                  aria-hidden="true"
                >
                  {meta.label.slice(0, 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: "var(--cream)" }}
                  >
                    {meta.label}
                  </h2>
                  {meta.description && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {meta.description}
                    </p>
                  )}
                  {latest && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--muted-dim)" }}
                    >
                      Last job ingested {timeAgo(latest)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-lg font-semibold"
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      color: "var(--cream)",
                    }}
                  >
                    {s._count._all.toLocaleString()}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                    jobs
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        className="mt-6 p-4 rounded-xl flex items-start gap-3"
        style={{
          background: "var(--panel-light)",
          border: "1px solid var(--line)",
        }}
      >
        <DatabaseIcon
          size={16}
          style={{ color: "var(--muted)", marginTop: 2 }}
        />
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Sources are fixed by what the worker's{" "}
          <code>apps/worker/src/sources/</code> adapters support (currently
          Adzuna and Jooble) — this page reflects real ingestion data, not a
          source you can toggle on or off from here yet.
        </p>
      </div>
    </div>
  );
}
