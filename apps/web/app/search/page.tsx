import { redirect } from "next/navigation";

export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") usp.set(key, value);
  }
  const qs = usp.toString();
  redirect(`/discover${qs ? `?${qs}` : ""}`);
}
