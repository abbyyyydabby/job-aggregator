import type { ReactNode } from "react";
import { prisma } from "@job-aggregator/db";
import {
  getCurrentUser,
  displayNameFromEmail,
  initialsFromEmail,
} from "@/lib/auth/current-user";
import { Sidebar } from "@/components/sidebar";
import { TopbarClient } from "@/components/topbar-client";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  const alertCount = await prisma.savedSearch.count({
    where: { userId: user.userId },
  });

  const displayName = displayNameFromEmail(user.email);
  const initials = initialsFromEmail(user.email);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        email={user.email}
        displayName={displayName}
        initials={initials}
        alertCount={alertCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopbarClient initials={initials} alertCount={alertCount} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
