import type { RawJob } from "./adzuna.js";

type JoobleJob = {
  id: number; // Jooble returns this as a JSON number, not a string
  title: string;
  location: string;
  snippet: string;
  link: string;
  company: string;
  salary?: string;
  updated: string;
};

type JoobleResponse = {
  jobs: JoobleJob[];
};

export async function fetchJoobleJobs(
  query: string,
  location = ""
): Promise<RawJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    throw new Error("JOOBLE_API_KEY is not set");
  }

  const response = await fetch(`https://jooble.org/api/${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: query, location }),
  });

  if (!response.ok) {
    throw new Error(
      `Jooble API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as JoobleResponse;

  return data.jobs.map((job) => ({
    title: job.title,
    company: job.company || "Unknown",
    location: job.location || "Unknown",
    // Jooble calls this field "snippet" (usually truncated/HTML-ish),
    // not a full description — genuinely a shorter/rougher field than
    // Adzuna's, not a bug in this adapter.
    description: job.snippet,
    url: job.link,
    // Jooble gives salary as a free-text string ("£40,000 - £50,000"),
    // not structured min/max numbers like Adzuna — we don't have a
    // reliable way to parse that into numbers without real risk of
    // misreading currency/format variations, so both stay null here
    // rather than guessing. Flagged as a real limitation, not silently
    // dropped.
    salaryMin: null,
    salaryMax: null,
    remote: /remote/i.test(job.title) || /remote/i.test(job.snippet),
    source: "jooble",
    sourceId: String(job.id),
    postedAt: job.updated ? new Date(job.updated) : null,
  }));
}
