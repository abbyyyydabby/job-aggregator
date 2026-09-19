import { prisma } from "@job-aggregator/db";
import { fetchAdzunaJobs, type RawJob } from "./sources/adzuna.js";
import { fetchJoobleJobs } from "./sources/jooble.js";
import { computeFingerprint } from "./normalize.js";

// Orchestrates one full ingestion run: call every source, normalize +
// fingerprint each listing, insert with dedup handling. Per ADR-001,
// each source is isolated in its own try/catch — one source failing
// (rate limit, downtime, bad response) must not stop the others or
// crash the whole run.

type IngestResult = {
  source: string;
  fetched: number;
  inserted: number;
  skippedDuplicates: number;
  error: string | null;
};

async function ingestFromSource(
  sourceName: string,
  fetchFn: () => Promise<RawJob[]>
): Promise<IngestResult> {
  try {
    const jobs = await fetchFn();
    let inserted = 0;
    let skippedDuplicates = 0;

    for (const job of jobs) {
      const fingerprint = computeFingerprint(
        job.title,
        job.company,
        job.location
      );

      // skipDuplicates relies on the DB-level UNIQUE constraint on
      // fingerprint (ADR-002) — this is what makes concurrent workers
      // safe: a race between two inserts of the same fingerprint
      // resolves to one row, not a crash and not a silent duplicate.
      const result = await prisma.job.createMany({
        data: [
          {
            fingerprint,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            url: job.url,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            remote: job.remote,
            source: job.source,
            sourceId: job.sourceId,
            postedAt: job.postedAt,
          },
        ],
        skipDuplicates: true,
      });

      if (result.count === 1) {
        inserted++;
      } else {
        skippedDuplicates++;
      }
    }

    return {
      source: sourceName,
      fetched: jobs.length,
      inserted,
      skippedDuplicates,
      error: null,
    };
  } catch (err) {
    // Caught here, not re-thrown — this is the actual isolation
    // ADR-001 calls for. The caller (runIngestion) still gets a
    // result object back for this source, just with an error noted,
    // and other sources proceed unaffected.
    const message = err instanceof Error ? err.message : String(err);
    return {
      source: sourceName,
      fetched: 0,
      inserted: 0,
      skippedDuplicates: 0,
      error: message,
    };
  }
}

export async function runIngestion(query: string): Promise<IngestResult[]> {
  const results = await Promise.all([
    ingestFromSource("adzuna", () => fetchAdzunaJobs(query)),
    ingestFromSource("jooble", () => fetchJoobleJobs(query)),
  ]);

  return results;
}
