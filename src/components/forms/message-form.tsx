"use client";

import { useActionState } from "react";

import { sendMessageAction } from "@/app/actions/messages";
import { emptyFormState } from "@/lib/form";
import { FormError, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

export function MessageForm({ swapRequestId }: { swapRequestId: string }) {
  const [state, formAction] = useActionState(sendMessageAction, emptyFormState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="swapRequestId" value={swapRequestId} />
      <FormError>{state.error ?? state.fieldErrors?.body}</FormError>

      <Textarea
        name="body"
        rows={3}
        required
        aria-label="Message"
        placeholder="Write a message…"
        defaultValue={state.values?.body ?? ""}
      />

      <div className="flex justify-end">
        <SubmitButton size="sm" pendingLabel="Sending…">
          Send
        </SubmitButton>
      </div>
    </form>
  );
}
