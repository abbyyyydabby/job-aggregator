"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";

const SECTION_LABELS: Record<string, string> = {
  "/overview": "Overview",
  "/discover": "Discover",
  "/saved-jobs": "Saved jobs",
  "/alerts": "Alerts",
  "/sources": "Sources",
  "/preferences": "Preferences",
};

export function TopbarClient({
  initials,
  alertCount,
}: {
  initials: string;
  alertCount: number;
}) {
  const pathname = usePathname();
  const section = SECTION_LABELS[pathname] ?? "Overview";
  return (
    <Topbar section={section} initials={initials} alertCount={alertCount} />
  );
}
