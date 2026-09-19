import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

import { ingestionQueue } from "@job-aggregator/queue";

// ADR-001: per-source repeatable jobs with staggered start times.
// Using upsertJobScheduler — BullMQ's current, documented API for
// repeatable work (the older queue.add + repeat option pattern is
// legacy and has had real, documented reliability issues).
async function main() {
  await ingestionQueue.upsertJobScheduler(
    "software-engineer-scheduler",
    {
      every: 4 * 60 * 60 * 1000, // every 4 hours
    },
    {
      name: "scheduled-ingest",
      data: { query: "software engineer" },
    }
  );

  console.log("Repeatable ingestion job scheduler registered");
  process.exit(0);
}

main();
