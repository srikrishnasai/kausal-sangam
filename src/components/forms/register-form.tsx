"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, emptyFormState);
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="Full name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" required defaultValue={values.name ?? ""} />
      </Field>

      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.email ?? ""}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={state.fieldErrors?.password}
        hint="At least 8 characters."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <Field
        label="Confirm password"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
