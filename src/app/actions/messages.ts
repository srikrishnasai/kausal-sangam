"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, valuesOf, type FormState } from "@/lib/form";
import { messageSchema } from "@/lib/validators";

export async function sendMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = valuesOf(formData);
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { swapRequestId, body } = parsed.data;

  const swap = await prisma.swapRequest.findFirst({
    where: {
      id: swapRequestId,
      status: { in: ["ACCEPTED", "COMPLETED"] },
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    select: { id: true },
  });
  if (!swap) return { values, error: "You can only message on an accepted swap." };

  await prisma.message.create({ data: { swapRequestId, senderId: userId, body } });

  revalidatePath(`/swaps/${swapRequestId}`);
  return { ok: true };
}
