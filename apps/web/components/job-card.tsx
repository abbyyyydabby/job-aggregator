import { LinkOutIcon } from "./icons";
import { SaveJobButton } from "./save-job-button";

export type FeedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  source: string;
  url: string;
  postedAt: string | null;
  matchedAt: string;
  matchedKeyword: string | null;
};

const AVATAR_TINTS = [
  { bg: "#b8f35b", fg: "#172018" },
  { bg: "#7aa8e7", fg: "#0e1a2b" },
  { bg: "#e0a86a", fg: "#241705" },
  { bg: "#a88bfa", fg: "#1a1230" },
  { bg: "#e07a5f", fg: "#210d07" },
];

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function JobCard({ job }: { job: FeedJob }) {
  const tint = tintFor(job.company);
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  const metaParts = [
    job.company,
    job.remote ? "Remote" : job.location,
    timeAgo(job.matchedAt),
  ].filter(Boolean);

  return (
    <div
      className="flex items-start gap-4 py-4"
      style={{ borderBottom: "1px solid var(--line-soft)" }}
    >
      <span
        className="flex items-center justify-center shrink-0 text-sm font-semibold"
        style={{
          width: 38,
          height: 38,
          borderRadius: "var(--r-sm)",
          background: tint.bg,
          color: tint.fg,
        }}
        aria-hidden="true"
      >
        {job.company.slice(0, 1).toUpperCase()}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold" style={{ color: "var(--cream)" }}>
            {job.title}
          </h3>
          {job.matchedKeyword && (
            <span
              className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ background: "var(--lime-dim)", color: "var(--lime)" }}
              title={`Matched your saved search "${job.matchedKeyword}"`}
            >
              matched: {job.matchedKeyword}
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {metaParts.join(" · ")}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0 text-right">
        <div>
          {salary && (
            <p className="text-sm font-medium" style={{ color: "var(--cream)" }}>
              {salary}
            </p>
          )}
          <p className="text-[11px]" style={{ color: "var(--muted-dim)" }}>
            via {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaveJobButton />
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "var(--lime)", color: "#172018" }}
          >
            View role
            <LinkOutIcon size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}