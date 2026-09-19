import bcrypt from "bcryptjs";

// ADR-005: bcrypt with an appropriate cost factor, not a weaker/faster
// hash. 12 is a widely-used current default — real brute-force
// resistance without making every login call painfully slow.
const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
