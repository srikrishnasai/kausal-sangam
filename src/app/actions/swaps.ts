"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, valuesOf, type FormState } from "@/lib/form";
import { sendSwapRequestedEmail } from "@/lib/emails";
import { swapRequestSchema } from "@/lib/validators";

export async function createSwapRequestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const values = valuesOf(formData);
  const parsed = swapRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { toUserId, requestedSkillId, offeredSkillId, message } = parsed.data;
  if (toUserId === userId) return { values, error: "You cannot request a swap with yourself." };

  // Both halves of the trade must actually be on offer.
  const [theirSkill, mySkill] = await Promise.all([
    prisma.userSkill.findFirst({
      where: { userId: toUserId, skillId: requestedSkillId, kind: "OFFER" },
      select: { id: true },
    }),
    prisma.userSkill.findFirst({
      where: { userId, skillId: offeredSkillId, kind: "OFFER" },
      select: { id: true },
    }),
  ]);

  if (!theirSkill) {
    return { values, error: "That member no longer teaches the skill you picked." };
  }
  if (!mySkill) {
    return {
      values,
      fieldErrors: { offeredSkillId: "Add this skill to your teaching list first." },
    };
  }

  const openRequest = await prisma.swapRequest.findFirst({
    where: {
      fromUserId: userId,
      toUserId,
      requestedSkillId,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true },
  });
  if (openRequest) {
    redirect(`/swaps/${openRequest.id}`);
  }

  const created = await prisma.swapRequest.create({
    data: { fromUserId: userId, toUserId, requestedSkillId, offeredSkillId, message },
    select: {
      id: true,
      fromUser: { select: { name: true } },
      toUser: { select: { name: true, email: true } },
      requestedSkill: { select: { name: true } },
      offeredSkill: { select: { name: true } },
    },
  });

  // Never throws — a delivery failure must not lose a swap request that is
  // already committed. Must also run before redirect(), which throws by design.
  await sendSwapRequestedEmail({
    to: created.toUser.email,
    recipientName: created.toUser.name,
    requesterName: created.fromUser.name,
    requestedSkill: created.requestedSkill.name,
    offeredSkill: created.offeredSkill.name,
    message,
    swapRequestId: created.id,
  });

  revalidatePath("/dashboard");
  redirect(`/swaps/${created.id}`);
}

export async function respondToSwapAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("swapRequestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id || (decision !== "ACCEPTED" && decision !== "DECLINED")) return;

  await prisma.swapRequest.updateMany({
    where: { id, toUserId: userId, status: "PENDING" },
    data: { status: decision, respondedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/swaps/${id}`);
}

export async function cancelSwapAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("swapRequestId") ?? "");
  if (!id) return;

  await prisma.swapRequest.updateMany({
    where: { id, fromUserId: userId, status: "PENDING" },
    data: { status: "CANCELLED", respondedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/swaps/${id}`);
}

export async function completeSwapAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("swapRequestId") ?? "");
  if (!id) return;

  await prisma.swapRequest.updateMany({
    where: {
      id,
      status: "ACCEPTED",
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/swaps/${id}`);
}
