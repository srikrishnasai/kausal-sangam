import { appUrl, sendEmail } from "@/lib/mailer";

/**
 * One transactional email, sent when a swap is proposed. Deliberately the only
 * one for now — digests and a notification-preferences UI are a later problem,
 * and both need this single send to prove useful first.
 */
export async function sendSwapRequestedEmail(input: {
  to: string;
  recipientName: string;
  requesterName: string;
  /** What the requester wants to learn from the recipient. */
  requestedSkill: string;
  /** What the requester teaches in return. */
  offeredSkill: string;
  message: string;
  swapRequestId: string;
}): Promise<void> {
  const link = appUrl(`/swaps/${input.swapRequestId}`);

  await sendEmail({
    to: input.to,
    subject: `${input.requesterName} wants to swap ${input.offeredSkill} for ${input.requestedSkill}`,
    body: [
      `Hi ${input.recipientName},`,
      "",
      `${input.requesterName} would like to learn ${input.requestedSkill} from you, and offers to teach you ${input.offeredSkill} in return.`,
      "",
      "They wrote:",
      ...input.message.split("\n").map((line) => `  ${line}`),
      "",
      `Accept or decline: ${link}`,
      "",
      "— Kausal Sangam",
    ].join("\n"),
  });
}
