import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { cancelSwapAction, completeSwapAction, respondToSwapAction } from "@/app/actions/swaps";
import { MessageForm } from "@/components/forms/message-form";
import { ReviewForm } from "@/components/forms/review-form";
import { Stars } from "@/components/stars";
import { SwapStatusBadge, type SwapStatus } from "@/components/swap-row";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Card, EmptyState, SectionTitle } from "@/components/ui/card";
import { InviteNudge } from "@/components/invite-nudge";
import { appUrl } from "@/lib/mailer";
import { markSwapMessagesRead, unmetWant } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Swap" };

export default async function SwapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await currentUser();
  if (!viewer) redirect(`/login?callbackUrl=/swaps/${id}`);

  const swap = await prisma.swapRequest.findFirst({
    where: { id, OR: [{ fromUserId: viewer.id }, { toUserId: viewer.id }] },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      completedAt: true,
      fromUserId: true,
      toUserId: true,
      fromUser: { select: { id: true, name: true, avatarUrl: true } },
      toUser: { select: { id: true, name: true, avatarUrl: true } },
      requestedSkill: { select: { name: true } },
      offeredSkill: { select: { name: true } },
      messages: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderId: true,
          sender: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          authorId: true,
          author: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!swap) notFound();

  // Opening the thread is the read receipt. The header badge still counts these
  // on this render — layout and page render concurrently — and clears on the
  // next navigation.
  await markSwapMessagesRead(swap.id, viewer.id);

  const status = swap.status as SwapStatus;
  const outgoing = swap.fromUserId === viewer.id;
  const other = outgoing ? swap.toUser : swap.fromUser;
  const requester = swap.fromUser;

  const youLearn = outgoing ? swap.requestedSkill.name : swap.offeredSkill.name;
  const youTeach = outgoing ? swap.offeredSkill.name : swap.requestedSkill.name;

  const canChat = status === "ACCEPTED" || status === "COMPLETED";
  const alreadyReviewed = swap.reviews.some((review) => review.authorId === viewer.id);
  const wantNobodyTeaches = status === "COMPLETED" ? await unmetWant(viewer.id) : null;

  return (
    <div className="page-shell max-w-3xl py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-fg">
        &larr; Back to dashboard
      </Link>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={other.name} src={other.avatarUrl} size={48} />
            <div>
              <p className="text-xs text-muted">
                {outgoing ? "Your request to" : "Request from"}
              </p>
              <Link href={`/members/${other.id}`} className="text-lg font-semibold hover:text-brand">
                {other.name}
              </Link>
            </div>
          </div>
          <SwapStatusBadge status={status} />
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
            <dt className="text-xs tracking-wide text-muted uppercase">You learn</dt>
            <dd className="mt-0.5 font-medium">{youLearn}</dd>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
            <dt className="text-xs tracking-wide text-muted uppercase">You teach</dt>
            <dd className="mt-0.5 font-medium">{youTeach}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-muted">
            {requester.name} wrote on {formatDate(swap.createdAt)}
          </p>
          <p className="mt-1.5 text-pretty whitespace-pre-line">{swap.message}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {status === "PENDING" && !outgoing ? (
            <>
              <form action={respondToSwapAction}>
                <input type="hidden" name="swapRequestId" value={swap.id} />
                <input type="hidden" name="decision" value="ACCEPTED" />
                <button type="submit" className={buttonClass("primary", "md")}>
                  Accept swap
                </button>
              </form>
              <form action={respondToSwapAction}>
                <input type="hidden" name="swapRequestId" value={swap.id} />
                <input type="hidden" name="decision" value="DECLINED" />
                <button type="submit" className={buttonClass("secondary", "md")}>
                  Decline
                </button>
              </form>
            </>
          ) : null}

          {status === "PENDING" && outgoing ? (
            <form action={cancelSwapAction}>
              <input type="hidden" name="swapRequestId" value={swap.id} />
              <button type="submit" className={buttonClass("secondary", "md")}>
                Withdraw request
              </button>
            </form>
          ) : null}

          {status === "ACCEPTED" ? (
            <form action={completeSwapAction}>
              <input type="hidden" name="swapRequestId" value={swap.id} />
              <button type="submit" className={buttonClass("primary", "md")}>
                Mark as completed
              </button>
            </form>
          ) : null}

          {status === "COMPLETED" && swap.completedAt ? (
            <p className="text-sm text-muted">Completed on {formatDate(swap.completedAt)}.</p>
          ) : null}

          {status === "DECLINED" ? (
            <p className="text-sm text-muted">This request was declined.</p>
          ) : null}

          {status === "CANCELLED" ? (
            <p className="text-sm text-muted">This request was withdrawn.</p>
          ) : null}
        </div>
      </Card>

      <section className="mt-10">
        <SectionTitle
          title="Conversation"
          description={
            canChat
              ? "Agree times, places and what each session covers."
              : "Chat opens once the request is accepted."
          }
        />

        {swap.messages.length ? (
          <ul className="mb-5 space-y-3">
            {swap.messages.map((message) => {
              const mine = message.senderId === viewer.id;
              return (
                <li key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div className="flex max-w-[85%] items-end gap-2">
                    {!mine ? (
                      <Avatar name={message.sender.name} src={message.sender.avatarUrl} size={28} />
                    ) : null}
                    <div
                      className={
                        mine
                          ? "rounded-2xl rounded-br-sm bg-brand px-3.5 py-2 text-brand-fg"
                          : "rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2"
                      }
                    >
                      <p className="text-sm whitespace-pre-line">{message.body}</p>
                      <p className={mine ? "mt-1 text-[11px] opacity-70" : "mt-1 text-[11px] text-muted"}>
                        {formatRelative(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : canChat ? (
          <EmptyState title="No messages yet" description="Say hello and suggest a first session." />
        ) : null}

        {canChat ? <MessageForm swapRequestId={swap.id} /> : null}
      </section>

      {status === "COMPLETED" ? (
        <section className="mt-10">
          <SectionTitle title="Reviews" />

          {swap.reviews.length ? (
            <ul className="mb-5 space-y-3">
              {swap.reviews.map((review) => (
                <li key={review.id}>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.author.name} src={review.author.avatarUrl} size={32} />
                      <div>
                        <p className="text-sm font-medium">{review.author.name}</p>
                        <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                      </div>
                      <span className="ml-auto">
                        <Stars rating={review.rating} />
                      </span>
                    </div>
                    {review.comment ? <p className="mt-3 text-sm">{review.comment}</p> : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : null}

          {alreadyReviewed ? null : (
            <Card>
              <ReviewForm swapRequestId={swap.id} subjectName={other.name} skillLearned={youLearn} />
            </Card>
          )}

          {wantNobodyTeaches ? (
            <InviteNudge
              skillName={wantNobodyTeaches}
              message={[
                `I have been trading skills on Kausal Sangam — just learned ${youLearn} from ${other.name}.`,
                `Nobody there teaches ${wantNobodyTeaches} yet. If you can, come and join:`,
                appUrl("/"),
              ].join(" ")}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
