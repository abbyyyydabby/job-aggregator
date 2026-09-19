"use client";

import { useState } from "react";
import { BookmarkIcon } from "./icons";

export function SaveJobButton() {
  const [showNotice, setShowNotice] = useState(false);

  function handleClick() {
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 2200);
  }

  return (
    <span className="relative inline-flex">
      <button
        onClick={handleClick}
        className="flex items-center justify-center rounded-lg"
        style={{
          width: 30,
          height: 30,
          border: "1px solid var(--line)",
          color: "var(--muted)",
        }}
        aria-label="Save job (not yet available)"
      >
        <BookmarkIcon size={14} />
      </button>
      {showNotice && (
        <span
          role="status"
          className="absolute right-0 top-full mt-1.5 px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap z-10"
          style={{
            background: "var(--panel-light)",
            border: "1px solid var(--line)",
            color: "var(--cream)",
          }}
        >
          Saving individual jobs isn't built yet — save the search instead
        </span>
      )}
    </span>
  );
}
