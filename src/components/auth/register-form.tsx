"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validation/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [grade, setGrade] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = registerSchema.safeParse({
      fullName: raw.fullName,
      email: raw.email,
      password: raw.password,
      confirmPassword: raw.confirmPassword,
      role,
      schoolName: raw.schoolName || undefined,
      grade: grade || undefined,
      parentalConsent: raw.parentalConsent === "on",
      parentGuardianName: raw.parentGuardianName || undefined,
      parentGuardianContact: raw.parentGuardianContact || undefined,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
        data: {
          full_name: parsed.data.fullName,
          role: parsed.data.role,
          school_name: parsed.data.schoolName ?? "",
          grade: parsed.data.grade ?? "",
          parental_consent: parsed.data.parentalConsent,
          parent_guardian_name: parsed.data.parentGuardianName ?? "",
          parent_guardian_contact: parsed.data.parentGuardianContact ?? "",
        },
      },
    });

    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <MailCheck className="size-12 text-primary" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to your email address. Click
            it to activate your account, then sign in.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const err = (key: string) =>
    fieldErrors[key] ? (
      <p className="text-sm text-destructive" role="alert">
        {fieldErrors[key]}
      </p>
    ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Join Propel as a student participant or a volunteer mentor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="role-select">I am a</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "student" | "mentor")}
            >
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student (grade 8–9)</SelectItem>
                <SelectItem value="mentor">Mentor / specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full name <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
            {err("fullName")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            {err("email")}
          </div>

          {role === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="schoolName">
                  School name{" "}
                  <span aria-hidden className="text-destructive">*</span>
                </Label>
                <Input id="schoolName" name="schoolName" required />
                {err("schoolName")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade-select">
                  Grade <span aria-hidden className="text-destructive">*</span>
                </Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="grade-select" className="w-full">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                  </SelectContent>
                </Select>
                {err("grade")}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
            {err("password")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm password{" "}
              <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
            {err("confirmPassword")}
          </div>

          {role === "student" && (
            <fieldset className="space-y-3 rounded-lg border p-4">
              <legend className="px-1 text-sm font-medium">
                Parent / guardian consent
              </legend>
              <div className="flex items-start gap-3">
                <input
                  id="parentalConsent"
                  name="parentalConsent"
                  type="checkbox"
                  required
                  className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]"
                />
                <Label
                  htmlFor="parentalConsent"
                  className="text-sm font-normal leading-snug text-muted-foreground"
                >
                  I confirm that my parent or guardian is aware of and
                  consents to my registration on Propel, including the
                  processing of my data as described in the Privacy Policy.
                </Label>
              </div>
              {err("parentalConsent")}
              <div className="space-y-2">
                <Label htmlFor="parentGuardianName">
                  Parent/guardian name{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="parentGuardianName" name="parentGuardianName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentGuardianContact">
                  Parent/guardian contact{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="parentGuardianContact"
                  name="parentGuardianContact"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </fieldset>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
