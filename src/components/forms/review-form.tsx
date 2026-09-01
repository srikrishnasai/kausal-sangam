"use client";

import { useActionState } from "react";

import { submitReviewAction } from "@/app/actions/reviews";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

export function ReviewForm({
  swapRequestId,
  subjectName,
  skillLearned,
}: {
  swapRequestId: string;
  subjectName: string;
  skillLearned?: string;
}) {
  const [state, formAction] = useActionState(submitReviewAction, emptyFormState);
  const values = state.values ?? {};

  if (state.ok) {
    return (
      <p className="rounded-lg border border-border bg-success-soft px-3 py-2 text-sm font-medium text-success">
        Thanks — your review is live on {subjectName}&apos;s profile.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="swapRequestId" value={swapRequestId} />
      <FormError>{state.error}</FormError>

      <Field
        label={`How was your swap with ${subjectName}?`}
        htmlFor="rating"
        error={state.fieldErrors?.rating}
      >
        <Select id="rating" name="rating" defaultValue={values.rating ?? "5"}>
          <option value="5">★★★★★ — Excellent</option>
          <option value="4">★★★★ — Good</option>
          <option value="3">★★★ — Fine</option>
          <option value="2">★★ — Below par</option>
          <option value="1">★ — Poor</option>
        </Select>
      </Field>

      <Field
        label={skillLearned ? `What did you learn about ${skillLearned}?` : "Comment"}
        htmlFor="comment"
        error={state.fieldErrors?.comment}
        hint="Optional."
      >
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          defaultValue={values.comment ?? ""}
          placeholder={
            skillLearned
              ? `Share what you picked up, or what went well with ${subjectName}.`
              : "What went well?"
          }
        />
      </Field>

      <SubmitButton size="sm" pendingLabel="Posting…">
        Post review
      </SubmitButton>
    </form>
  );
}
