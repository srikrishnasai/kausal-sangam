import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, SectionTitle } from "@/components/ui/card";
import { getNotifications, type NotificationItem } from "@/lib/notifications";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

function NotificationRow({ item, tone }: { item: NotificationItem; tone: "brand" | "accent" }) {
  return (
    <Link
      href={item.href}
      className="flex items-start gap-3 rounded-lg px-3 py-3 transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span
        aria-hidden
        className={`mt-2 size-2 shrink-0 rounded-full ${tone === "accent" ? "bg-accent" : "bg-brand"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-medium">{item.title}</span>
          {item.count > 1 ? <Badge tone={tone}>{item.count} new</Badge> : null}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted">{item.detail}</span>
      </span>
      <span className="shrink-0 text-xs text-muted">{formatRelative(item.at)}</span>
    </Link>
  );
}

export default async function NotificationsPage() {
  const viewer = await currentUser();
  if (!viewer) redirect("/login?callbackUrl=/notifications");

  const { total, requests, messages } = await getNotifications(viewer.id);

  return (
    <div className="page-shell max-w-2xl py-10">
      <SectionTitle
        title="Notifications"
        description={
          total === 0
            ? "Anything needing your attention shows up here."
            : `${total} ${total === 1 ? "thing needs" : "things need"} your attention.`
        }
      />

      {total === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="New swap requests and unread messages will appear here."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {requests.length > 0 ? (
            <Card className="p-2">
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
                Waiting on you
              </p>
              <div className="flex flex-col">
                {requests.map((item) => (
                  <NotificationRow key={item.id} item={item} tone="brand" />
                ))}
              </div>
            </Card>
          ) : null}

          {messages.length > 0 ? (
            <Card className="p-2">
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
                Unread messages
              </p>
              <div className="flex flex-col">
                {messages.map((item) => (
                  <NotificationRow key={item.id} item={item} tone="accent" />
                ))}
              </div>
            </Card>
          ) : null}

          <p className="text-sm text-muted">
            Opening a swap marks its messages as read.{" "}
            <Link href="/dashboard" className="underline underline-offset-2 hover:text-fg">
              Go to your dashboard
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
