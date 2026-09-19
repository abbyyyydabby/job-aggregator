import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@job-aggregator/db";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(savedSearches);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const body = await request.json();
  const { keyword, location, remoteOnly, minSalary } = body;

  if (!keyword || typeof keyword !== "string") {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: auth.userId,
      keyword,
      location: location ?? null,
      remoteOnly: remoteOnly ?? false,
      minSalary: minSalary ?? null,
    },
  });

  return NextResponse.json(savedSearch, { status: 201 });
}
