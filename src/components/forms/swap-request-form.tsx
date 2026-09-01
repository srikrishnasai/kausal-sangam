"use client";

import { useActionState } from "react";

import { createSwapRequestAction } from "@/app/actions/swaps";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

type Option = { id: string; name: string };

export function SwapRequestForm({
  toUserId,
  toUserName,
  theirSkills,
  mySkills,
}: {
  toUserId: string;
  toUserName: string;
  theirSkills: Option[];
  mySkills: Option[];
}) {
  const [state, formAction] = useActionState(createSwapRequestAction, emptyFormState);
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="toUserId" value={toUserId} />
      <FormError>{state.error}</FormError>

      <Field
        label={`What you want to learn from ${toUserName}`}
        htmlFor="requestedSkillId"
        error={state.fieldErrors?.requestedSkillId}
      >
        <Select
          id="requestedSkillId"
          name="requestedSkillId"
          required
          defaultValue={values.requestedSkillId ?? ""}
        >
          <option value="" disabled>
            Choose a skill…
          </option>
          {theirSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="What you will teach in return"
        htmlFor="offeredSkillId"
        error={state.fieldErrors?.offeredSkillId}
      >
        <Select
          id="offeredSkillId"
          name="offeredSkillId"
          required
          defaultValue={values.offeredSkillId ?? ""}
        >
          <option value="" disabled>
            Choose from your teaching list…
          </option>
          {mySkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Your note"
        htmlFor="message"
        error={state.fieldErrors?.message}
        hint="Say what you are after and roughly when you are free."
      >
        <Textarea
          id="message"
          name="message"
          rows={4}
          required
          defaultValue={values.message ?? ""}
          placeholder="Hi! I'd love a couple of sessions on…"
        />
      </Field>

      <SubmitButton pendingLabel="Sending…">Send swap request</SubmitButton>
    </form>
  );
}
