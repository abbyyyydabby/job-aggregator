import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, email: payload.email };
  } catch {
    redirect("/login");
  }
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function initialsFromEmail(email: string): string {
  const name = displayNameFromEmail(email);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
