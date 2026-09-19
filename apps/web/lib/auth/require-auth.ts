import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";

type AuthResult =
  | { authenticated: true; userId: string; email: string }
  | { authenticated: false; response: NextResponse };

export function requireAuth(request: NextRequest): AuthResult {
  const cookieToken = request.cookies.get("accessToken")?.value;
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Missing or invalid authentication" },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = verifyAccessToken(token);
    return {
      authenticated: true,
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}
