import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  /** Swap id — one entry per swap, never one per message. */
  id: string;
  href: string;
  title: string;
  detail: string;
  at: Date;
  count: number;
};

export type NotificationSummary = {
  total: number;
  requests: NotificationItem[];
  messages: NotificationItem[];
};

const MAX_PREVIEW = 90;

/**
 * The two things a member needs to hear about without refreshing the dashboard:
 * a swap someone is waiting on them to answer, and messages they have not read.
 *
 * Both are derived from columns that already exist — `SwapRequest.status` and
 * `Message.readAt` — so there is no notification table to keep in step with
 * reality, and nothing to backfill.
 */
export async function getNotifications(userId: string): Promise<NotificationSummary> {
  const [pending, unread] = await Promise.all([
    prisma.swapRequest.findMany({
      where: { toUserId: userId, status: "PENDING" },
      select: {
        id: true,
        createdAt: true,
        fromUser: { select: { name: true } },
        requestedSkill: { select: { name: true } },
        offeredSkill: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.message.findMany({
      where: {
        readAt: null,
        senderId: { not: userId },
        swapRequest: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      },
      select: {
        body: true,
        createdAt: true,
        swapRequestId: true,
        sender: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const requests: NotificationItem[] = pending.map((swap) => ({
    id: swap.id,
    href: `/swaps/${swap.id}`,
    title: `${swap.fromUser.name} proposed a swap`,
    detail: `Wants to learn ${swap.requestedSkill.name}, offers ${swap.offeredSkill.name} in return`,
    at: swap.createdAt,
    count: 1,
  }));

  // Collapse to one entry per conversation. `unread` is newest-first, so the
  // first message seen for a swap is the one worth previewing.
  const threads = new Map<string, NotificationItem>();
  for (const message of unread) {
    const seen = threads.get(message.swapRequestId);
    if (seen) {
      seen.count += 1;
      continue;
    }
    threads.set(message.swapRequestId, {
      id: message.swapRequestId,
      href: `/swaps/${message.swapRequestId}`,
      title: `${message.sender.name} sent a message`,
      detail:
        message.body.length > MAX_PREVIEW
          ? `${message.body.slice(0, MAX_PREVIEW).trimEnd()}…`
          : message.body,
      at: message.createdAt,
      count: 1,
    });
  }

  const messages = [...threads.values()];
  return { total: requests.length + messages.length, requests, messages };
}

/**
 * Marks everything the viewer did not send in this swap as read. Idempotent, so
 * it is safe to call on every render of the swap page.
 */
export async function markSwapMessagesRead(swapRequestId: string, userId: string) {
  await prisma.message.updateMany({
    where: { swapRequestId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}

/**
 * A skill this member still wants that nobody currently teaches. That gap is
 * the only honest reason to ask them to invite someone, so when there is no
 * gap there is no nudge.
 */
export async function unmetWant(userId: string): Promise<string | null> {
  const wants = await prisma.userSkill.findMany({
    where: { userId, kind: "WANT" },
    select: { skill: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (!wants.length) return null;

  const supplied = await prisma.userSkill.findMany({
    where: {
      kind: "OFFER",
      userId: { not: userId },
      skillId: { in: wants.map((want) => want.skill.id) },
    },
    select: { skillId: true },
    distinct: ["skillId"],
  });

  const taught = new Set(supplied.map((row) => row.skillId));
  return wants.find((want) => !taught.has(want.skill.id))?.skill.name ?? null;
}
