import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { cancelSwapAction, completeSwapAction, respondToSwapAction } from "@/app/actions/swaps";
import { SwapRow, type SwapRowData } from "@/components/swap-row";
import { buttonClass } from "@/components/ui/button";
import { Card, EmptyState, SectionTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

const swapSelect = {
  id: true,
  status: true,
  createdAt: true,
  message: true,
  fromUserId: true,
  fromUser: { select: { id: true, name: true, avatarUrl: true } },
  toUser: { select: { id: true, name: true, avatarUrl: true } },
  requestedSkill: { select: { name: true } },
  offeredSkill: { select: { name: true } },
} as const;

export default async function DashboardPage() {
  const viewer = await currentUser();
  if (!viewer) redirect("/login?callbackUrl=/dashboard");

  const [incoming, outgoing, active, finished, skillCounts] = await Promise.all([
    prisma.swapRequest.findMany({
      where: { toUserId: viewer.id, status: "PENDING" },
      select: swapSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.swapRequest.findMany({
      where: { fromUserId: viewer.id, status: "PENDING" },
      select: swapSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.swapRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ fromUserId: viewer.id }, { toUserId: viewer.id }],
      },
      select: swapSelect,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.swapRequest.findMany({
      where: {
        status: { in: ["COMPLETED", "DECLINED", "CANCELLED"] },
        OR: [{ fromUserId: viewer.id }, { toUserId: viewer.id }],
      },
      select: swapSelect,
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.userSkill.groupBy({
      by: ["kind"],
      where: { userId: viewer.id },
      _count: { _all: true },
    }),
  ]);

  const offerCount = skillCounts.find((row) => row.kind === "OFFER")?._count._all ?? 0;

  return (
    <div className="page-shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Namaste, {viewer.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1.5 text-muted">Your swap requests, conversations and history.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/browse" className={buttonClass("secondary", "md")}>
            Find a swap
          </Link>
          <Link href="/dashboard/profile" className={buttonClass("primary", "md")}>
            Edit profile
          </Link>
        </div>
      </div>

      {offerCount === 0 ? (
        <Card className="mt-6 border-accent/40 bg-accent-soft/50">
          <p className="font-medium">Add a skill you can teach</p>
          <p className="mt-1 text-sm text-muted">
            Swaps go both ways, so you need at least one skill on offer before you can send a
            request.
          </p>
          <Link
            href="/dashboard/profile"
            className={buttonClass("primary", "sm", "mt-3")}
          >
            Add your first skill
          </Link>
        </Card>
      ) : null}

      <div className="mt-10 space-y-10">
        <section>
          <SectionTitle
            title="Requests for you"
            description="People who want to learn something you teach."
          />
          {incoming.length ? (
            <ul className="space-y-3">
              {(incoming as SwapRowData[]).map((swap) => (
                <li key={swap.id}>
                  <SwapRow swap={swap} viewerId={viewer.id}>
                    <form action={respondToSwapAction}>
                      <input type="hidden" name="swapRequestId" value={swap.id} />
                      <input type="hidden" name="decision" value="DECLINED" />
                      <button type="submit" className={buttonClass("ghost", "sm")}>
                        Decline
                      </button>
                    </form>
                    <form action={respondToSwapAction}>
                      <input type="hidden" name="swapRequestId" value={swap.id} />
                      <input type="hidden" name="decision" value="ACCEPTED" />
                      <button type="submit" className={buttonClass("primary", "sm")}>
                        Accept
                      </button>
                    </form>
                  </SwapRow>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No incoming requests"
              description="Listing more skills makes you easier to find."
            />
          )}
        </section>

        <section>
          <SectionTitle title="Waiting on a reply" description="Requests you have sent." />
          {outgoing.length ? (
            <ul className="space-y-3">
              {(outgoing as SwapRowData[]).map((swap) => (
                <li key={swap.id}>
                  <SwapRow swap={swap} viewerId={viewer.id}>
                    <form action={cancelSwapAction}>
                      <input type="hidden" name="swapRequestId" value={swap.id} />
                      <button type="submit" className={buttonClass("ghost", "sm")}>
                        Withdraw
                      </button>
                    </form>
                  </SwapRow>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing pending"
              description="Browse members and propose a trade."
            />
          )}
        </section>

        <section>
          <SectionTitle title="In progress" description="Accepted swaps you are working through." />
          {active.length ? (
            <ul className="space-y-3">
              {(active as SwapRowData[]).map((swap) => (
                <li key={swap.id}>
                  <SwapRow swap={swap} viewerId={viewer.id}>
                    <form action={completeSwapAction}>
                      <input type="hidden" name="swapRequestId" value={swap.id} />
                      <button type="submit" className={buttonClass("secondary", "sm")}>
                        Mark complete
                      </button>
                    </form>
                  </SwapRow>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No active swaps yet" />
          )}
        </section>

        {finished.length ? (
          <section>
            <SectionTitle title="History" />
            <ul className="space-y-3">
              {(finished as SwapRowData[]).map((swap) => (
                <li key={swap.id}>
                  <SwapRow swap={swap} viewerId={viewer.id} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
