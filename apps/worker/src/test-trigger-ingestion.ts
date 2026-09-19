import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

import { ingestionQueue } from "@job-aggregator/queue";

async function main() {
  const job = await ingestionQueue.add("ingest", { query: "product manager" });
  console.log("Triggered ingestion job with ID:", job.id);
  process.exit(0);
}

main();
