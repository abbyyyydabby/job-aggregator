import { prisma } from "@job-aggregator/db";

export async function findMatchingJobs(savedSearch: {
  id: string;
  keyword: string;
  location: string | null;
  remoteOnly: boolean;
  minSalary: number | null;
}) {
  const tsQuery = savedSearch.keyword.trim() || null;
  const locationFilter = savedSearch.location?.trim() || null;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM jobs
    WHERE
      (${tsQuery}::text IS NULL OR search_vector @@ plainto_tsquery('english', ${tsQuery}))
      AND (${locationFilter}::text IS NULL OR location ILIKE '%' || ${locationFilter} || '%')
      AND (${savedSearch.remoteOnly}::boolean IS NOT TRUE OR remote = TRUE)
      AND (${savedSearch.minSalary}::int IS NULL OR "salaryMax" >= ${savedSearch.minSalary})
  `;

  return rows.map((r) => r.id);
}

// Runs matching for one saved search and records genuinely NEW
// matches only. Relies on SearchMatch's @@unique([savedSearchId, jobId])
// constraint (schema, day one) the same way ingestion relies on
// Job.fingerprint's uniqueness — skipDuplicates makes a second run
// against the same data a safe no-op, not a re-alert.
export async function recordNewMatches(savedSearch: {
  id: string;
  keyword: string;
  location: string | null;
  remoteOnly: boolean;
  minSalary: number | null;
}) {
  const matchingJobIds = await findMatchingJobs(savedSearch);

  if (matchingJobIds.length === 0) {
    return { checked: 0, newMatches: 0 };
  }

  const result = await prisma.searchMatch.createMany({
    data: matchingJobIds.map((jobId) => ({
      savedSearchId: savedSearch.id,
      jobId,
    })),
    skipDuplicates: true,
  });

  return { checked: matchingJobIds.length, newMatches: result.count };
}
