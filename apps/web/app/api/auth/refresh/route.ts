import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@job-aggregator/db";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken || typeof refreshToken !== "string") {
    return NextResponse.json(
      { error: "refreshToken is required" },
      { status: 400 }
    );
  }

  // Two independent checks, both required: the JWT signature itself
  // must be valid, AND the token must exist as a real, non-revoked
  // row in the database. The DB check is what makes logout actually
  // work — a signature-valid token that's been revoked must still
  // be rejected, which a JWT-only check could never catch on its own.
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (
    !storedToken ||
    storedToken.revokedAt !== null ||
    storedToken.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "Refresh token has been revoked or is invalid" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const newAccessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return NextResponse.json({ accessToken: newAccessToken });
}
