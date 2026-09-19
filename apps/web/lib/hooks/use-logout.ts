"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return { logout, loggingOut };
}
