import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export const QUEUE_NAMES = {
  INGESTION: "ingestion",
  MATCHING: "matching",
  ALERTS: "alerts",
} as const;

export function createQueue(name: string) {
  return new Queue(name, { connection: redisConnection });
}
