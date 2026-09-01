"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, valuesOf, type FormState } from "@/lib/form";
import { reviewSchema } from "@/lib/validators";

export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = valuesOf(formData);
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { swapRequestId, rating, comment } = parsed.data;

  const swap = await prisma.swapRequest.findFirst({
    where: {
      id: swapRequestId,
      status: "COMPLETED",
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    select: { id: true, fromUserId: true, toUserId: true },
  });
  if (!swap) return { values, error: "You can only review a completed swap you took part in." };

  const subjectId = swap.fromUserId === userId ? swap.toUserId : swap.fromUserId;

  const existing = await prisma.review.findUnique({
    where: { swapRequestId_authorId: { swapRequestId, authorId: userId } },
    select: { id: true },
  });
  if (existing) return { values, error: "You have already reviewed this swap." };

  await prisma.review.create({
    data: { swapRequestId, authorId: userId, subjectId, rating, comment: comment || null },
  });

  revalidatePath(`/swaps/${swapRequestId}`);
  revalidatePath(`/members/${subjectId}`);
  return { ok: true };
}
