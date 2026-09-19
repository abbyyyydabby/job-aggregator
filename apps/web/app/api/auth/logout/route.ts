import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@job-aggregator/db";
import { requireAuth } from "@/lib/auth/require-auth";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken && storedToken.userId === auth.userId) {
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return response;
}
