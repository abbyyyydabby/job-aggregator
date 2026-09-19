import { NextRequest, NextResponse } from "next/server";
import { PostgresSearchProvider } from "@job-aggregator/search";

const searchProvider = new PostgresSearchProvider();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const keyword = searchParams.get("keyword") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const remoteOnly = searchParams.get("remoteOnly") === "true";
  const minSalaryParam = searchParams.get("minSalary");
  const minSalary = minSalaryParam ? Number(minSalaryParam) : undefined;

  const results = await searchProvider.search({
    keyword,
    location,
    remoteOnly,
    minSalary,
  });

  return NextResponse.json(results);
}
