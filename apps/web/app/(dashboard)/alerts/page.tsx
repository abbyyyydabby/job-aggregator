import { prisma } from "@job-aggregator/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { BellIcon, TargetIcon, LinkOutIcon } from "@/components/icons";
import Link from "next/link";

export default async function AlertsPage() {
  const user = await getCurrentUser();

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
  const savedSearchIds = savedSearches.map((s) => s.id);

  const allMatches =
    savedSearchIds.length === 0
      ? []
      : await prisma.searchMatch.findMany({
          where: { savedSearchId: { in: savedSearchIds } },
          orderBy: { matchedAt: "desc" },
          include: { job: true },
        });

  const matchesBySearch = new Map<string, typeof allMatches>();
  for (const m of allMatches) {
    const list = matchesBySearch.get(m.savedSearchId) ?? [];
    list.push(m);
    matchesBySearch.set(m.savedSearchId, list);
  }

  const groups = savedSearches.map((search) => ({
    search,
    matches: (matchesBySearch.get(search.id) ?? []).slice(0, 20),
  }));

  const totalMatches = allMatches.length;

  return (
    <div className="px-8 py-8 max-w-[900px]">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--cream)",
        }}
      >
        Alerts
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {savedSearches.length === 0
          ? "Save a search to start receiving alerts."
          : `${totalMatches} matches across ${savedSearches.length} ${savedSearches.length === 1 ? "watch" : "watches"}.`}
      </p>

      {savedSearches.length === 0 ? (
        <EmptyAlerts />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(({ search, matches }) => (
            <div
              key={search.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4"
                style={{
                  borderBottom:
                    matches.length > 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--r-sm)",
                      background: "var(--lime-dim)",
                      color: "var(--lime)",
                    }}
                  >
                    <TargetIcon size={16} />
                  </span>
                  <div className="min-w-0">
                    <h2
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--cream)" }}
                    >
                      {search.keyword}
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {matches.length}{" "}
                      {matches.length === 1 ? "match" : "matches"}
                    </p>
                  </div>
                </div>
                <BellIcon size={16} style={{ color: "var(--muted)" }} />
              </div>

              {matches.length === 0 ? (
                <p
                  className="px-5 py-4 text-xs"
                  style={{ color: "var(--muted-dim)" }}
                >
                  No matches yet — this watch is still waiting for a hit.
                </p>
              ) : (
                <div className="px-5">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-4 py-3.5"
                      style={{ borderBottom: "1px solid var(--line-soft)" }}
                    >
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--cream)" }}
                        >
                          {m.job.title}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {m.job.company} ·{" "}
                          {m.job.remote ? "Remote" : m.job.location}
                        </p>
                      </div>
                      <a
                        href={m.job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold shrink-0"
                        style={{ color: "var(--lime)" }}
                      >
                        View
                        <LinkOutIcon size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyAlerts() {
  return (
    <div
      className="p-10 rounded-xl text-center"
      style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
    >
      <p className="text-sm font-medium mb-1" style={{ color: "var(--cream)" }}>
        No alerts yet.
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        Alerts are generated from your saved searches — save one to start
        watching for matches.
      </p>
      <Link
        href="/saved-jobs"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
        style={{ background: "var(--lime)", color: "#172018" }}
      >
        Go to Saved jobs
      </Link>
    </div>
  );
}
