"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLogout } from "@/lib/hooks/use-logout";
import {
  GridIcon,
  CompassIcon,
  BookmarkIcon,
  BellIcon,
  DatabaseIcon,
  SettingsIcon,
  ChevronDownIcon,
  LogoutIcon,
  SparkleIcon,
} from "./icons";

type SidebarProps = {
  email: string;
  initials: string;
  displayName: string;
  alertCount: number;
};

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: GridIcon },
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/saved-jobs", label: "Saved jobs", icon: BookmarkIcon },
  {
    href: "/alerts",
    label: "Alerts",
    icon: BellIcon,
    badgeKey: "alerts" as const,
  },
];

const MANAGE_ITEMS = [
  {
    href: "/sources",
    label: "Sources",
    icon: DatabaseIcon,
    statusKey: "live" as const,
  },
  { href: "/preferences", label: "Preferences", icon: SettingsIcon },
];

export function Sidebar({
  email,
  initials,
  displayName,
  alertCount,
}: SidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, loggingOut } = useLogout();

  return (
    <aside
      className="flex flex-col shrink-0 h-screen sticky top-0"
      style={{
        width: 260,
        background: "var(--bg)",
        borderRight: "1px solid var(--line)",
      }}
    >
      <div className="px-5 pt-6 pb-5">
        <Link href="/overview" className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--r-sm)",
              background: "var(--lime)",
              color: "#172018",
            }}
          >
            <SparkleIcon size={16} />
          </span>
          <span
            className="text-lg font-semibold"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              color: "var(--cream)",
            }}
          >
            signal.
          </span>
        </Link>
      </div>

      <div className="px-3 pb-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left"
            style={{ background: "var(--panel)" }}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span
              className="flex items-center justify-center shrink-0 text-xs font-semibold"
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--r-sm)",
                background: "var(--lime-dim)",
                color: "var(--lime)",
              }}
            >
              {initials}
            </span>
            <span className="flex-1 min-w-0">
              <span
                className="block text-sm font-medium truncate"
                style={{ color: "var(--cream)" }}
              >
                {displayName}
              </span>
              <span
                className="block text-xs truncate"
                style={{ color: "var(--muted)" }}
              >
                Personal workspace
              </span>
            </span>
            <ChevronDownIcon size={16} style={{ color: "var(--muted)" }} />
          </button>

          {menuOpen && (
            <div
              className="absolute left-0 right-0 mt-1.5 py-1.5 rounded-lg z-20"
              style={{
                background: "var(--panel-light)",
                border: "1px solid var(--line)",
              }}
              role="menu"
            >
              <div
                className="px-3 py-1.5 text-xs truncate"
                style={{ color: "var(--muted)" }}
              >
                {email}
              </div>
              <button
                onClick={logout}
                disabled={loggingOut}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left disabled:opacity-50"
                style={{ color: "var(--cream)" }}
              >
                <LogoutIcon size={15} />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <p
          className="px-2.5 mb-2 text-[11px] font-medium tracking-wide"
          style={{ color: "var(--muted-dim)" }}
        >
          Workspace
        </p>
        <ul className="flex flex-col gap-0.5 mb-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm"
                  style={{
                    background: active ? "var(--panel)" : "transparent",
                    color: active ? "var(--cream)" : "var(--muted)",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: active ? "var(--lime)" : "var(--muted)" }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badgeKey === "alerts" && alertCount > 0 && (
                    <span
                      className="flex items-center justify-center text-[11px] font-semibold rounded-full"
                      style={{
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        background: "var(--lime)",
                        color: "#172018",
                      }}
                    >
                      {alertCount > 9 ? "9+" : alertCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p
          className="px-2.5 mb-2 text-[11px] font-medium tracking-wide"
          style={{ color: "var(--muted-dim)" }}
        >
          Manage
        </p>
        <ul className="flex flex-col gap-0.5">
          {MANAGE_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm"
                  style={{
                    background: active ? "var(--panel)" : "transparent",
                    color: active ? "var(--cream)" : "var(--muted)",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: active ? "var(--lime)" : "var(--muted)" }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.statusKey === "live" && (
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "var(--lime)" }}
                    >
                      <span
                        className="rounded-full"
                        style={{
                          width: 5,
                          height: 5,
                          background: "var(--lime)",
                        }}
                      />
                      live
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3">
        <div
          className="p-4 rounded-xl"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <span
            className="flex items-center justify-center mb-3"
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--r-sm)",
              background: "var(--lime-dim)",
              color: "var(--lime)",
            }}
          >
            <SparkleIcon size={15} />
          </span>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--cream)" }}
          >
            Make your search work harder.
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            Unlock unlimited alerts and advanced filters.
          </p>
          <Link
            href="/preferences"
            className="text-xs font-semibold inline-flex items-center gap-1"
            style={{ color: "var(--lime)" }}
          >
            See plans
            <ChevronDownIcon
              size={12}
              style={{ transform: "rotate(-90deg)" }}
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
