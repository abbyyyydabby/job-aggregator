"use client";

import { useLogout } from "@/lib/hooks/use-logout";
import { LogoutIcon } from "./icons";

export function LogoutButton() {
  const { logout, loggingOut } = useLogout();
  return (
    <button
      onClick={logout}
      disabled={loggingOut}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
      style={{ border: "1px solid var(--line)", color: "#f1a27c" }}
    >
      <LogoutIcon size={15} />
      {loggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}
