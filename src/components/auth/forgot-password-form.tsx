"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const email = new FormData(e.currentTarget).get("email");
    if (typeof email !== "string" || !email) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/confirm` }
    );
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <MailCheck className="size-12 text-primary" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for that address, we&apos;ve sent a link to
            reset your password.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your account email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
