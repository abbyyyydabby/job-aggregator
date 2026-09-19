import { createQueue } from "./index.js";
import { QUEUE_NAMES } from "./index.js";

export const ingestionQueue = createQueue(QUEUE_NAMES.INGESTION);
