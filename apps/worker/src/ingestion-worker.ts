import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

import { Worker } from "@job-aggregator/queue";
import { QUEUE_NAMES, redisConnection } from "@job-aggregator/queue";
import { runIngestion } from "./ingest.js";
import { recordNewMatches } from "./matching.js";
import { prisma } from "@job-aggregator/db";

export const ingestionWorker = new Worker(
  QUEUE_NAMES.INGESTION,
  async (job) => {
    const query = job.data.query as string;
    console.log(`[ingestion-worker] Starting ingestion for query: "${query}"`);

    const ingestionResults = await runIngestion(query);
    console.log(
      `[ingestion-worker] Ingestion complete:`,
      JSON.stringify(ingestionResults)
    );

    // Per ADR-001's queue design: matching runs as a follow-up step
    // after ingestion, checking every saved search against whatever
    // was just inserted.
    console.log(
      `[ingestion-worker] Running matching against all saved searches...`
    );
    const savedSearches = await prisma.savedSearch.findMany();
    const matchingResults = [];
    for (const search of savedSearches) {
      const result = await recordNewMatches(search);
      matchingResults.push({
        savedSearchId: search.id,
        keyword: search.keyword,
        ...result,
      });
    }
    console.log(
      `[ingestion-worker] Matching complete:`,
      JSON.stringify(matchingResults)
    );

    return { ingestion: ingestionResults, matching: matchingResults };
  },
  { connection: redisConnection }
);

ingestionWorker.on("completed", (job) => {
  console.log(`[ingestion-worker] Job ${job.id} completed`);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`[ingestion-worker] Job ${job?.id} failed:`, err.message);
});
