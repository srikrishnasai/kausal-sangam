"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/actions/profile";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

type Profile = {
  name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  availability: string | null;
  avatarUrl: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, emptyFormState);

  // A rejected save comes back with what was typed; anything else falls back to
  // the stored profile.
  const values = state.values ?? {};
  const value = (field: keyof Profile) => values[field] ?? profile[field] ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {state.ok ? (
        <p className="rounded-lg border border-border bg-success-soft px-3 py-2 text-sm font-medium text-success">
          Profile saved.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" required defaultValue={value("name")} />
        </Field>

        <Field
          label="Headline"
          htmlFor="headline"
          error={state.fieldErrors?.headline}
          hint="One line people see first."
        >
          <Input
            id="headline"
            name="headline"
            defaultValue={value("headline")}
            placeholder="Backend engineer who bakes"
          />
        </Field>
      </div>

      <Field label="About you" htmlFor="bio" error={state.fieldErrors?.bio}>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={value("bio")}
          placeholder="What you enjoy teaching, how you like to learn, anything that helps someone decide to reach out."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor="city" error={state.fieldErrors?.city}>
          <Input id="city" name="city" defaultValue={value("city")} placeholder="Pune" />
        </Field>

        <Field label="Country" htmlFor="country" error={state.fieldErrors?.country}>
          <Input id="country" name="country" defaultValue={value("country")} placeholder="India" />
        </Field>
      </div>

      <Field
        label="Availability"
        htmlFor="availability"
        error={state.fieldErrors?.availability}
        hint="When are you usually free to swap?"
      >
        <Input
          id="availability"
          name="availability"
          defaultValue={value("availability")}
          placeholder="Weekday evenings and Sunday mornings"
        />
      </Field>

      <Field
        label="Avatar URL"
        htmlFor="avatarUrl"
        error={state.fieldErrors?.avatarUrl}
        hint="Optional. Leave blank to use your initials."
      >
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={value("avatarUrl")}
          placeholder="https://…"
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
    </form>
  );
}
