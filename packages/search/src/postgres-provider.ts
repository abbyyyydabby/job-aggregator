import { prisma } from "@job-aggregator/db";
import type { SearchProvider, SearchQuery, SearchResult } from "./provider.js";

type SearchRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  rank: number;
};

export class PostgresSearchProvider implements SearchProvider {
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const {
      keyword,
      location,
      remoteOnly,
      minSalary,
      limit = 20,
      offset = 0,
    } = query;

    const tsQuery = keyword?.trim() || null;
    const locationFilter = location?.trim() || null;

    const rows = await prisma.$queryRaw<SearchRow[]>`
      SELECT
        id,
        title,
        company,
        location,
        remote,
        "salaryMin",
        CASE
          WHEN ${tsQuery}::text IS NOT NULL
            THEN ts_rank(search_vector, plainto_tsquery('english', ${tsQuery}))
          ELSE 0
        END AS rank
      FROM jobs
      WHERE
        (${tsQuery}::text IS NULL OR search_vector @@ plainto_tsquery('english', ${tsQuery}))
        AND (${locationFilter}::text IS NULL OR location ILIKE '%' || ${locationFilter} || '%')
        AND (${remoteOnly ?? false}::boolean IS NOT TRUE OR remote = TRUE)
        AND (${minSalary ?? null}::int IS NULL OR "salaryMax" >= ${minSalary ?? null})
      ORDER BY rank DESC, "postedAt" DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      location: r.location,
      remote: r.remote,
      salaryMin: r.salaryMin,
      score: r.rank,
    }));
  }
}
