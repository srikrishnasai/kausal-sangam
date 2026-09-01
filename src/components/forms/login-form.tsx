"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { emptyFormState } from "@/lib/form";
import { Field, FormError, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useActionState(loginAction, emptyFormState);
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />
      <FormError>{state.error}</FormError>

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

      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
