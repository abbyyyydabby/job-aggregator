import { prisma } from "@job-aggregator/db";
import { getCurrentUser, displayNameFromEmail } from "@/lib/auth/current-user";
import { StatCard } from "@/components/stat-card";
import { ActivityChart } from "@/components/activity-chart";
import { SourceHealth } from "@/components/source-health";
import { JobCard, type FeedJob } from "@/components/job-card";
import { OverviewSearchBar } from "@/components/overview-search-bar";
import {
  BriefcaseIcon,
  TargetIcon,
  ClockIcon,
  TrendUpIcon,
} from "@/components/icons";
import Link from "next/link";
import { ChevronRightIcon, MoreIcon } from "@/components/icons";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_WINDOW_DAYS = 7;

export default async function OverviewPage() {
  const user = await getCurrentUser();
  const displayName = displayNameFromEmail(user.email);

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
  const savedSearchIds = savedSearches.map((s) => s.id);

  const since24h = new Date(Date.now() - DAY_MS);
  const activitySince = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * DAY_MS);

  const [newMatchesCount, recentMatches, sourceCounts, activityJobs] =
    await Promise.all([
      savedSearchIds.length === 0
        ? Promise.resolve(0)
        : prisma.searchMatch.count({
            where: {
              savedSearchId: { in: savedSearchIds },
              matchedAt: { gte: since24h },
            },
          }),
      savedSearchIds.length === 0
        ? Promise.resolve([])
        : prisma.searchMatch.findMany({
            where: { savedSearchId: { in: savedSearchIds } },
            orderBy: { matchedAt: "desc" },
            take: 8,
            include: { job: true },
          }),
      prisma.job.groupBy({ by: ["source"], _count: { _all: true } }),
      prisma.job.findMany({
        where: { createdAt: { gte: activitySince } },
        select: { createdAt: true },
      }),
    ]);

  const dayBuckets: { date: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = ACTIVITY_WINDOW_DAYS - 1; i >= 0; i--) {
    // Built entirely in UTC (Date.UTC + getUTC*), matching how
    // Prisma/Postgres store createdAt (always UTC, per the "Z"
    // suffix on every timestamp) — the previous version mixed local
    // browser time for the bucket boundary with UTC for the actual
    // job timestamps, silently dropping every job into no bucket at
    // all whenever the two didn't line up (e.g. IST vs UTC).
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
    );
    dayBuckets.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
      count: 0,
    });
  }
  for (const job of activityJobs) {
    const key = job.createdAt.toISOString().slice(0, 10);
    const bucket = dayBuckets.find((b) => b.date === key);
    if (bucket) bucket.count++;
  }
  const totalActivity = dayBuckets.reduce((sum, b) => sum + b.count, 0);

  const feedJobs: FeedJob[] = recentMatches.map((m) => ({
    id: m.job.id,
    title: m.job.title,
    company: m.job.company,
    location: m.job.location,
    remote: m.job.remote,
    salaryMin: m.job.salaryMin,
    salaryMax: m.job.salaryMax,
    source: m.job.source,
    url: m.job.url,
    postedAt: m.job.postedAt ? m.job.postedAt.toISOString() : null,
    matchedAt: m.matchedAt.toISOString(),
    matchedKeyword:
      savedSearches.find((s) => s.id === m.savedSearchId)?.keyword ?? null,
  }));

  const totalJobs = sourceCounts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <div className="px-8 py-8 max-w-[1180px]">
      <p
        className="flex items-center gap-1.5 text-xs font-medium mb-3"
        style={{ color: "var(--lime)" }}
      >
        <span
          className="rounded-full"
          style={{ width: 6, height: 6, background: "var(--lime)" }}
        />
        Live market pulse
      </p>
      <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
        <div>
          <h1
            className="text-3xl font-semibold mb-1.5"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              color: "var(--cream)",
            }}
          >
            Good morning, {displayName}.
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Your job search, without the noise.
          </p>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <span
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 28,
              height: 28,
              background: "var(--lime-dim)",
              color: "var(--lime)",
            }}
          >
            <ClockIcon size={15} />
          </span>
          <span>
            <span
              className="block text-xs font-semibold"
              style={{ color: "var(--cream)" }}
            >
              Alerts are on
            </span>
            <span
              className="block text-[11px]"
              style={{ color: "var(--muted)" }}
            >
              Watching {savedSearches.length}{" "}
              {savedSearches.length === 1 ? "search" : "searches"}
            </span>
          </span>
        </div>
      </div>

      <OverviewSearchBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        <StatCard
          icon={<BriefcaseIcon size={17} />}
          tint="green"
          label="New matches"
          value={String(newMatchesCount)}
          caption="in the last 24h"
        />
        <StatCard
          icon={<TargetIcon size={17} />}
          tint="amber"
          label="Active watches"
          value={String(savedSearches.length)}
          caption={
            savedSearches.length === 0
              ? "none saved yet"
              : "saved searches running"
          }
        />
        <StatCard
          icon={<TrendUpIcon size={17} />}
          tint="blue"
          label="Jobs indexed"
          value={totalJobs.toLocaleString()}
          caption={`across ${sourceCounts.length} ${sourceCounts.length === 1 ? "source" : "sources"}`}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: "var(--cream)" }}
          >
            New for you
            {feedJobs.length > 0 && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded"
                style={{ background: "var(--lime-dim)", color: "var(--lime)" }}
              >
                {feedJobs.length} new
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--lime)" }}
            >
              View all jobs
              <ChevronRightIcon size={13} />
            </Link>
            <button aria-label="More options" style={{ color: "var(--muted)" }}>
              <MoreIcon size={16} />
            </button>
          </div>
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
          Matches from your saved searches, ranked by recency.
        </p>

        <div
          className="rounded-xl px-5"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          {feedJobs.length === 0 ? (
            <EmptyFeed hasSavedSearches={savedSearches.length > 0} />
          ) : (
            feedJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div
          className="p-5 rounded-xl"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--cream)" }}
            >
              Search activity
            </h2>
            <span
              className="text-xs px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--panel-light)",
                color: "var(--muted)",
              }}
            >
              Last 7 days
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            Jobs ingested per day across all sources.
          </p>
          <p className="flex items-baseline gap-2 mb-2">
            <span
              className="text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                color: "var(--cream)",
              }}
            >
              {totalActivity.toLocaleString()}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              total jobs ingested
            </span>
          </p>
          <ActivityChart days={dayBuckets} total={totalActivity} />
        </div>

        <SourceHealth
          sources={sourceCounts.map((s) => ({
            source: s.source,
            count: s._count._all,
          }))}
        />
      </div>
    </div>
  );
}

function EmptyFeed({ hasSavedSearches }: { hasSavedSearches: boolean }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-medium mb-1" style={{ color: "var(--cream)" }}>
        {hasSavedSearches ? "No matches yet." : "No saved searches yet."}
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        {hasSavedSearches
          ? "The worker checks your saved searches against newly ingested jobs — matches will show up here once it finds one."
          : "Save a search to start getting matches ranked by relevance."}
      </p>
      {!hasSavedSearches && (
        <Link
          href="/saved-jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{ background: "var(--lime)", color: "#172018" }}
        >
          Save a search
        </Link>
      )}
    </div>
  );
}
