console.log("Worker starting...");

export {};

// Ingestion, matching, and alert queue processors register here.
// See packages/queue for the BullMQ abstraction, ADR-001 for the design.

async function main() {
  console.log("Worker is running. Waiting for jobs...");
}

try {
  await main();
} catch (err) {
  console.error("Worker failed to start:", err);
  process.exit(1);
}