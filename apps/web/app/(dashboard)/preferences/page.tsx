import {
  getCurrentUser,
  displayNameFromEmail,
  initialsFromEmail,
} from "@/lib/auth/current-user";
import { UserIcon, MailIcon } from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";

export default async function PreferencesPage() {
  const user = await getCurrentUser();
  const displayName = displayNameFromEmail(user.email);
  const initials = initialsFromEmail(user.email);

  return (
    <div className="px-8 py-8 max-w-[640px]">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--cream)",
        }}
      >
        Preferences
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Account details for this workspace.
      </p>

      <div
        className="p-5 rounded-xl flex items-center gap-4 mb-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <span
          className="flex items-center justify-center shrink-0 text-base font-semibold"
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--r-md)",
            background: "var(--lime-dim)",
            color: "var(--lime)",
          }}
        >
          {initials}
        </span>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--cream)" }}
          >
            {displayName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Personal workspace
          </p>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <MailIcon size={16} style={{ color: "var(--muted)" }} />
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Email
            </p>
            <p className="text-sm" style={{ color: "var(--cream)" }}>
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <UserIcon size={16} style={{ color: "var(--muted)" }} />
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Display name
            </p>
            <p className="text-sm" style={{ color: "var(--cream)" }}>
              {displayName}{" "}
              <span style={{ color: "var(--muted-dim)" }}>
                (derived from email — no name field exists yet)
              </span>
            </p>
          </div>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
