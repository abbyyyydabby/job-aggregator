export type RawJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salaryMin: number | null;
  salaryMax: number | null;
  remote: boolean;
  source: string;
  sourceId: string;
  postedAt: Date | null;
};

type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name?: string };
  location: { display_name?: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
};

type AdzunaResponse = {
  results: AdzunaJob[];
};

export async function fetchAdzunaJobs(
  query: string,
  country = "gb"
): Promise<RawJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("ADZUNA_APP_ID or ADZUNA_APP_KEY is not set");
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Adzuna API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as AdzunaResponse;

  return data.results.map((job) => ({
    title: job.title,
    company: job.company.display_name ?? "Unknown",
    location: job.location.display_name ?? "Unknown",
    description: job.description,
    url: job.redirect_url,
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    remote: /remote/i.test(job.title) || /remote/i.test(job.description),
    source: "adzuna",
    sourceId: job.id,
    postedAt: job.created ? new Date(job.created) : null,
  }));
}
