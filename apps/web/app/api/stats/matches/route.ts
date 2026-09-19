import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@job-aggregator/db";
import { requireAuth } from "@/lib/auth/require-auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Real counts, scoped to this user's own saved searches only —
  // matches belong to a SavedSearch, which belongs to a User, so we
  // join through that relation rather than trusting any client-
  // provided userId.
  const [last24h, previous24h] = await Promise.all([
    prisma.searchMatch.count({
      where: {
        matchedAt: { gte: oneDayAgo },
        savedSearch: { userId: auth.userId },
      },
    }),
    prisma.searchMatch.count({
      where: {
        matchedAt: { gte: twoDaysAgo, lt: oneDayAgo },
        savedSearch: { userId: auth.userId },
      },
    }),
  ]);

  // Percentage change, guarding against divide-by-zero when there
  // were genuinely zero matches in the prior period — "infinite
  // increase" isn't a meaningful number to show anyone.
  const percentChange =
    previous24h === 0
      ? last24h > 0
        ? 100
        : 0
      : Math.round(((last24h - previous24h) / previous24h) * 100);

  return NextResponse.json({
    newMatches: last24h,
    percentChange,
  });
}
