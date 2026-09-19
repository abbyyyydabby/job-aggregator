import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

import { ingestionQueue } from "@job-aggregator/queue";

async function main() {
  const queries = ["software engineer", "frontend developer", "data scientist"];
  for (const query of queries) {
    const job = await ingestionQueue.add("ingest", { query });
    console.log(`Triggered: "${query}" (job ${job.id})`);
  }
  process.exit(0);
}

main();
