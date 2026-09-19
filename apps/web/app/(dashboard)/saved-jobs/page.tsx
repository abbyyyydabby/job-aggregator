"use client";

import { useState, useEffect } from "react";
import { BookmarkIcon, TargetIcon } from "@/components/icons";

type SavedSearch = {
  id: string;
  keyword: string;
  location: string | null;
  remoteOnly: boolean;
  minSalary: number | null;
  createdAt: string;
};

export default function SavedJobsPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadSearches() {
    const res = await fetch("/api/saved-searches");
    const data = await res.json();
    setSearches(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadSearches();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    setCreating(true);
    await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: keyword.trim() }),
    });
    setKeyword("");
    setCreating(false);
    await loadSearches();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    await loadSearches();
  }

  return (
    <div className="px-8 py-8 max-w-[900px]">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--cream)",
        }}
      >
        Saved jobs
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Watches that alert you when a new job matches.
      </p>

      <form
        onSubmit={handleCreate}
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <TargetIcon size={17} style={{ color: "var(--muted)" }} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword to watch for..."
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: "var(--cream)" }}
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--lime)", color: "#172018" }}
        >
          {creating ? "Saving..." : "Save search"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm py-8" style={{ color: "var(--muted)" }}>
          Loading...
        </p>
      ) : searches.length === 0 ? (
        <div
          className="p-10 rounded-xl text-center"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <BookmarkIcon
            size={20}
            style={{ color: "var(--muted)", margin: "0 auto 10px" }}
          />
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--cream)" }}
          >
            No saved searches yet.
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Save a keyword above to start getting matched.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="p-5 rounded-xl flex items-center justify-between"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--cream)" }}
                >
                  {search.keyword}
                </h3>
                {search.location && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {search.location}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(search.id)}
                className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{ color: "#f1a27c", border: "1px solid var(--line)" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
