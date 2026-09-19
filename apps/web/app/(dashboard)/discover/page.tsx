"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SearchIcon,
  PinIcon,
  SlidersIcon,
  TargetIcon,
} from "@/components/icons";
import { SaveJobButton } from "@/components/save-job-button";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  score: number;
};

function DiscoverInner() {
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [remoteOnly, setRemoteOnly] = useState(
    searchParams.get("remoteOnly") === "true"
  );
  const [minSalary, setMinSalary] = useState(
    searchParams.get("minSalary") ?? ""
  );
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savingKeyword, setSavingKeyword] = useState<string | null>(null);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  async function runSearch() {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    if (remoteOnly) params.set("remoteOnly", "true");
    const salaryNum = Number(minSalary);
    if (minSalary.trim() && !Number.isNaN(salaryNum)) {
      params.set("minSalary", String(salaryNum));
    }

    try {
      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("keyword") || searchParams.get("location")) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch();
  }

  async function handleSaveThisSearch() {
    if (!keyword.trim()) return;
    setSavingKeyword(keyword.trim());
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          location: location.trim() || null,
          remoteOnly,
          minSalary: minSalary.trim() ? Number(minSalary) : null,
        }),
      });
      if (res.ok) {
        setSaveConfirmed(true);
        setTimeout(() => setSaveConfirmed(false), 2500);
      }
    } finally {
      setSavingKeyword(null);
    }
  }

  return (
    <div className="px-8 py-8 max-w-[1180px]">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--cream)",
        }}
      >
        Discover
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Search every ingested job across all sources.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 px-4 py-3 rounded-xl flex-wrap mb-3"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <SearchIcon size={17} style={{ color: "var(--muted)" }} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, keyword..."
          className="flex-1 min-w-[160px] bg-transparent outline-none text-sm font-medium"
          style={{ color: "var(--cream)" }}
        />
        <span style={{ width: 1, height: 20, background: "var(--line)" }} />
        <div className="flex items-center gap-1.5 text-sm">
          <PinIcon size={15} style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="bg-transparent outline-none w-28 text-sm font-medium"
            style={{ color: "var(--cream)" }}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background: showFilters ? "var(--lime-dim)" : "var(--panel-light)",
            border: "1px solid var(--line)",
            color: showFilters ? "var(--lime)" : "var(--cream)",
          }}
          aria-expanded={showFilters}
        >
          <SlidersIcon size={14} />
          Filters
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--lime)", color: "#172018" }}
        >
          <SearchIcon size={14} />
          {loading ? "Searching..." : "Search jobs"}
        </button>
      </form>

      {showFilters && (
        <div
          className="flex items-center gap-5 px-4 py-3 rounded-xl mb-6 flex-wrap"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--cream)" }}
          >
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              style={{ accentColor: "var(--lime)" }}
            />
            Remote only
          </label>
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--cream)" }}
          >
            Min salary
            <input
              type="number"
              inputMode="numeric"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="e.g. 80000"
              className="w-28 px-2 py-1 rounded-lg outline-none text-sm"
              style={{
                background: "var(--panel-light)",
                border: "1px solid var(--line)",
                color: "var(--cream)",
              }}
            />
          </label>
          {keyword.trim() && (
            <button
              type="button"
              onClick={handleSaveThisSearch}
              disabled={savingKeyword !== null}
              className="flex items-center gap-1.5 ml-auto text-xs font-semibold disabled:opacity-60"
              style={{ color: "var(--lime)" }}
            >
              <TargetIcon size={13} />
              {saveConfirmed
                ? "Saved!"
                : savingKeyword
                  ? "Saving..."
                  : "Save this search as an alert"}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col">
        {!searched && (
          <p className="text-sm py-8" style={{ color: "var(--muted)" }}>
            Search for a role to see live results across every ingested source.
          </p>
        )}
        {searched && !loading && jobs.length === 0 && (
          <p className="text-sm py-8" style={{ color: "var(--muted)" }}>
            No jobs found. Try a broader keyword or clear filters.
          </p>
        )}
        {jobs.map((job) => (
          <DiscoverJobRow key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function DiscoverJobRow({ job }: { job: Job }) {
  return (
    <div
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: "1px solid var(--line-soft)" }}
    >
      <span
        className="flex items-center justify-center shrink-0 text-sm font-semibold"
        style={{
          width: 38,
          height: 38,
          borderRadius: "var(--r-sm)",
          background: "var(--panel-light)",
          color: "var(--cream)",
        }}
        aria-hidden="true"
      >
        {job.company.slice(0, 1).toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--cream)" }}
          >
            {job.title}
          </h3>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: "var(--lime-dim)", color: "var(--lime)" }}
            title="Relevance score from the search provider"
          >
            {job.score.toFixed(2)} relevance
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {job.company} · {job.remote ? "Remote" : job.location}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {job.salaryMin != null && (
          <span
            className="text-sm font-medium mr-2"
            style={{ color: "var(--cream)" }}
          >
            From ${job.salaryMin.toLocaleString()}
          </span>
        )}
        <SaveJobButton />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverInner />
    </Suspense>
  );
}
