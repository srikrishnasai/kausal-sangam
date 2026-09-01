import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  if (await currentUser()) redirect("/dashboard");

  const { callbackUrl } = await searchParams;

  return (
    <div className="page-shell flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to manage your swaps.</p>

        <Card className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </Card>

        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
