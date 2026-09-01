import Link from "next/link";

import { getNotifications } from "@/lib/notifications";

export async function NotificationBell({ userId }: { userId: string }) {
  const { total } = await getNotifications(userId);
  const label = total === 0 ? "Notifications" : `Notifications, ${total} waiting`;

  return (
    <Link
      href="/notifications"
      aria-label={label}
      title={label}
      className="relative grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>

      {total > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-bg">
          {total > 9 ? "9+" : total}
        </span>
      ) : null}
    </Link>
  );
}
