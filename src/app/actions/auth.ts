"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, valuesOf, type FormState } from "@/lib/form";
import { loginSchema, registerSchema } from "@/lib/validators";

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData);
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { values, fieldErrors: { email: "That email is already registered" } };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: { email, name: parsed.data.name, passwordHash },
  });

  // Throws NEXT_REDIRECT on success — intentionally not caught.
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/dashboard/profile",
  });

  return {};
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const callbackUrl = String(formData.get("callbackUrl") ?? "") || "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { values, error: "Those credentials did not match any account." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
