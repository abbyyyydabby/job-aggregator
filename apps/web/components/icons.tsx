import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function GridIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function CompassIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  );
}

export function BookmarkIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 4.5A1.5 1.5 0 017.5 3h9A1.5 1.5 0 0118 4.5V21l-6-4-6 4z" />
    </svg>
  );
}

export function BellIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 10a6 6 0 1112 0c0 4.5 1.5 6 1.5 6h-15S6 14.5 6 10z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

export function LinkOutIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
    </svg>
  );
}

export function SettingsIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 7h11M18 7h2M6 12h2M11 12h7M4 17h13M20 17h0" />
      <circle cx="17" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function DatabaseIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
      <path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

export function PinIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 105 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

export function SlidersIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M5 6h14M5 12h14M5 18h14" />
      <circle cx="9" cy="6" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BriefcaseIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function TargetIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function TrendUpIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M4 16l5.5-6 4 4L20 6" />
      <path d="M14 6h6v6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function MoreIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props} fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export function LogoutIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function SparkleIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props} fill="currentColor" stroke="none">
      <path d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4z" />
    </svg>
  );
}

export function MailIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function UserIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3L16 10" />
    </svg>
  );
}
