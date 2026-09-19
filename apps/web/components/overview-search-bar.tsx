"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, PinIcon, SlidersIcon } from "./icons";

export function OverviewSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Remote");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/discover?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 py-3 rounded-xl flex-wrap"
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

      <div
        className="flex items-center gap-1.5 text-sm"
        style={{ color: "var(--cream)" }}
      >
        <PinIcon size={15} style={{ color: "var(--muted)" }} />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="bg-transparent outline-none w-24 text-sm font-medium"
          style={{ color: "var(--cream)" }}
        />
      </div>

      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{
          background: "var(--panel-light)",
          border: "1px solid var(--line)",
          color: "var(--cream)",
        }}
        onClick={() => router.push("/discover")}
      >
        <SlidersIcon size={14} />
        Filters
      </button>

      <button
        type="submit"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: "var(--lime)", color: "#172018" }}
      >
        <SearchIcon size={14} />
        Search jobs
      </button>
    </form>
  );
}
