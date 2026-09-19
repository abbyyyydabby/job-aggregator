import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (token) {
    try {
      verifyAccessToken(token);
      redirect("/overview");
    } catch {
      // invalid/expired token — fall through to the logged-out landing page below
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 text-center">
      <h1
        className="text-4xl font-semibold tracking-tight mb-4"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Signal-The Job Aggregator
      </h1>
      <p className="max-w-md mb-8" style={{ color: "var(--muted)" }}>
        Dedupes listings across sources and alerts you when new matches appear.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg font-semibold"
          style={{ background: "var(--lime)", color: "#172018" }}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-lg font-semibold border"
          style={{ borderColor: "var(--line)", color: "var(--cream)" }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}
