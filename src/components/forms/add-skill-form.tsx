"use client";

import { useActionState } from "react";

import { addSkillAction } from "@/app/actions/profile";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

export function AddSkillForm({
  kind,
  suggestions,
}: {
  kind: "OFFER" | "WANT";
  suggestions: string[];
}) {
  const [state, formAction] = useActionState(addSkillAction, emptyFormState);
  const values = state.values ?? {};
  const listId = `skills-${kind.toLowerCase()}`;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="kind" value={kind} />
      <FormError>{state.error}</FormError>

      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <Field label="Skill" htmlFor={`skillName-${kind}`} error={state.fieldErrors?.skillName}>
        <Input
          id={`skillName-${kind}`}
          name="skillName"
          list={listId}
          required
          defaultValue={values.skillName ?? ""}
          placeholder={
            kind === "OFFER" ? "Tabla, Python, Bread baking…" : "What do you want to learn?"
          }
        />
      </Field>

      {kind === "OFFER" ? (
        <Field label="Your level" htmlFor={`level-${kind}`} error={state.fieldErrors?.level}>
          <Select
            id={`level-${kind}`}
            name="level"
            defaultValue={values.level ?? "INTERMEDIATE"}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </Select>
        </Field>
      ) : (
        <input type="hidden" name="level" value="" />
      )}

      <Field
        label="Note"
        htmlFor={`description-${kind}`}
        error={state.fieldErrors?.description}
        hint="Optional — one line of detail."
      >
        <Input
          id={`description-${kind}`}
          name="description"
          defaultValue={values.description ?? ""}
          placeholder={
            kind === "OFFER" ? "Can teach up to intermediate theory" : "Complete beginner"
          }
        />
      </Field>

      <SubmitButton variant="secondary" size="sm" pendingLabel="Adding…">
        Add skill
      </SubmitButton>
    </form>
  );
}
