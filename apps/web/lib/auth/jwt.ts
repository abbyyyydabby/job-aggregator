import jwt from "jsonwebtoken";

// ADR-005: short JWT expiry with a refresh flow, not long-lived
// tokens. Access tokens are what the API actually checks on every
// request — short-lived so a leaked one has a small window of harm.
// Refresh tokens are longer-lived and stored server-side (a real DB
// row, added next), so a specific session can be revoked without
// forcing every device to log out.

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

type AccessTokenPayload = {
  userId: string;
  email: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  // jwt.verify throws on expiry or tampering — callers are expected
  // to catch this, not treat every token as automatically valid.
  return jwt.verify(token, secret) as AccessTokenPayload;
}

export function signRefreshToken(payload: { userId: string }): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  return jwt.sign(payload, secret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyRefreshToken(token: string): { userId: string } {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }
  return jwt.verify(token, secret) as { userId: string };
}
