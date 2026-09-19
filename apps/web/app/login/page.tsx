"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/overview");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div
        className="w-full max-w-sm p-8 rounded-xl border"
        style={{ background: "var(--panel)", borderColor: "var(--line)" }}
      >
        <h1
          className="text-2xl font-semibold mb-6"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            color: "var(--cream)",
          }}
        >
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg outline-none"
            style={{
              background: "var(--panel-light)",
              color: "var(--cream)",
              border: "1px solid var(--line)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg outline-none"
            style={{
              background: "var(--panel-light)",
              color: "var(--cream)",
              border: "1px solid var(--line)",
            }}
          />

          {error && (
            <p className="text-sm" style={{ color: "#f1a27c" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 rounded-lg font-semibold mt-2 disabled:opacity-50"
            style={{ background: "var(--lime)", color: "#172018" }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
