import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils";

export type SwapStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED";

type Person = { id: string; name: string; avatarUrl: string | null };

export type SwapRowData = {
  id: string;
  status: SwapStatus;
  createdAt: Date;
  message: string;
  fromUserId: string;
  fromUser: Person;
  toUser: Person;
  requestedSkill: { name: string };
  offeredSkill: { name: string };
};

const statusTone: Record<SwapStatus, "brand" | "accent" | "success" | "danger" | "neutral"> = {
  PENDING: "accent",
  ACCEPTED: "brand",
  COMPLETED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral",
};

const statusLabel: Record<SwapStatus, string> = {
  PENDING: "Awaiting reply",
  ACCEPTED: "In progress",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export function SwapStatusBadge({ status }: { status: SwapStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}

export function SwapRow({
  swap,
  viewerId,
  children,
}: {
  swap: SwapRowData;
  viewerId: string;
  children?: React.ReactNode;
}) {
  const outgoing = swap.fromUserId === viewerId;
  const other = outgoing ? swap.toUser : swap.fromUser;

  // Framed from the viewer's side of the trade.
  const youLearn = outgoing ? swap.requestedSkill.name : swap.offeredSkill.name;
  const youTeach = outgoing ? swap.offeredSkill.name : swap.requestedSkill.name;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start gap-3">
        <Avatar name={other.name} src={other.avatarUrl} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/members/${other.id}`} className="font-medium hover:text-brand">
              {other.name}
            </Link>
            <span className="text-xs text-muted">
              {outgoing ? "you asked" : "asked you"} &middot; {formatRelative(swap.createdAt)}
            </span>
          </div>

          <p className="mt-1.5 text-sm">
            <span className="text-muted">You learn</span>{" "}
            <span className="font-medium">{youLearn}</span>
            <span className="text-muted"> &nbsp;·&nbsp; You teach </span>
            <span className="font-medium">{youTeach}</span>
          </p>
        </div>

        <SwapStatusBadge status={swap.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <Link href={`/swaps/${swap.id}`} className="text-sm font-medium text-brand hover:underline">
          Open swap &rarr;
        </Link>
        <div className="flex flex-wrap gap-2">{children}</div>
      </div>
    </Card>
  );
}
