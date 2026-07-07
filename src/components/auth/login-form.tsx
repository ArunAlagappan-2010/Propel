"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const confirmed = params.get("confirmed") === "true";
  const redirectTo = params.get("redirect") ?? "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (authError) {
      setSubmitting(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : authError.message === "Email not confirmed"
            ? "Please confirm your email first — check your inbox for the confirmation link."
            : authError.message
      );
      return;
    }

    // Only allow internal redirect targets.
    router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Welcome back to Propel. Enter your details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {confirmed && (
          <p
            className="mb-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary"
            role="status"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Email confirmed! You can sign in now.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to Propel?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
