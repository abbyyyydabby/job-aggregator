import { createQueue, QUEUE_NAMES } from "./queue-factory.js";

export const ingestionQueue = createQueue(QUEUE_NAMES.INGESTION);
