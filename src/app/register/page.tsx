import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { RegisterForm } from "@/components/forms/register-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Join" };

export default async function RegisterPage() {
  if (await currentUser()) redirect("/dashboard");

  return (
    <div className="page-shell flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Join Kausal Sangam</h1>
        <p className="mt-1.5 text-sm text-muted">
          Free, always. List a skill you can teach and one you want to learn.
        </p>

        <Card className="mt-6">
          <RegisterForm />
        </Card>

        <p className="mt-5 text-center text-sm text-muted">
          Already a member?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
