import { z } from "zod";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back on failure so a rejected form can be re-rendered with what was typed. */
  values?: Record<string, string>;
};

export const emptyFormState: FormState = {};

/** First error message per field, ready to render next to inputs. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) result[key] = messages[0];
  }
  return result;
}

const SENSITIVE = new Set(["password", "confirmPassword"]);

/** Plain string entries of a submission, minus anything secret. */
export function valuesOf(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !SENSITIVE.has(key) && !key.startsWith("$")) {
      values[key] = value;
    }
  }
  return values;
}
