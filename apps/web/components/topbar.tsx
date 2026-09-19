import Link from "next/link";
import { BellIcon, ChevronRightIcon } from "./icons";

export type TopbarProps = {
  section: string;
  initials: string;
  alertCount: number;
};

export function Topbar({ section, initials, alertCount }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-8 shrink-0"
      style={{ height: 56, borderBottom: "1px solid var(--line)" }}
    >
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--muted)" }}
      >
        <span>Workspace</span>
        <ChevronRightIcon size={14} />
        <span style={{ color: "var(--cream)" }}>{section}</span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--muted)",
          }}
        >
          Quick search
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: "var(--panel-light)", color: "var(--muted)" }}
          >
            ⌘K
          </kbd>
        </div>

        <Link
          href="/alerts"
          className="relative flex items-center justify-center rounded-lg"
          style={{ width: 34, height: 34, color: "var(--muted)" }}
          aria-label={`Alerts${alertCount > 0 ? `, ${alertCount} unread` : ""}`}
        >
          <BellIcon size={18} />
          {alertCount > 0 && (
            <span
              className="absolute rounded-full"
              style={{
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                background: "var(--lime)",
              }}
            />
          )}
        </Link>

        <Link
          href="/preferences"
          className="flex items-center justify-center rounded-full"
          style={{
            width: 30,
            height: 30,
            background: "var(--panel-light)",
            color: "var(--muted)",
          }}
          aria-label="Account"
        >
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--cream)" }}
          >
            {initials}
          </span>
        </Link>
      </div>
    </header>
  );
}
