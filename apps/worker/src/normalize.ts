import { createHash } from "node:crypto";

// ADR-002: normalize company + title + location, then compute a
// fingerprint. Two listings that are the same job worded slightly
// differently should normalize to the same fingerprint, which is
// what makes the database's UNIQUE constraint on Job.fingerprint
// actually catch duplicates rather than treating "Software Engineer"
// and "Software Engineer " (trailing space) as different jobs.

const COMPANY_SUFFIXES = [
  /\bpvt\.?\s*ltd\.?\b/gi,
  /\bprivate\s+limited\b/gi,
  /\bllc\b/gi,
  /\binc\.?\b/gi,
  /\bltd\.?\b/gi,
  /\bcorp\.?\b/gi,
];

export function normalizeText(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Strip common company-suffix noise before general punctuation
  // stripping, since e.g. "Pvt. Ltd." needs the periods intact to
  // match the regexes above.
  for (const suffix of COMPANY_SUFFIXES) {
    normalized = normalized.replace(suffix, "");
  }

  // Strip punctuation, collapse repeated whitespace from removed
  // suffixes/punctuation down to single spaces.
  normalized = normalized
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

export function computeFingerprint(
  title: string,
  company: string,
  location: string
): string {
  const normalizedTitle = normalizeText(title);
  const normalizedCompany = normalizeText(company);
  const normalizedLocation = normalizeText(location);

  const combined = `${normalizedTitle}|${normalizedCompany}|${normalizedLocation}`;

  // SHA-256 rather than storing the raw combined string directly —
  // fixed-length output regardless of input length, and the DB
  // column/index stays efficient either way. We don't need this to
  // be cryptographically secure, just a stable, collision-resistant
  // key, which SHA-256 comfortably is for this purpose.
  return createHash("sha256").update(combined).digest("hex");
}
