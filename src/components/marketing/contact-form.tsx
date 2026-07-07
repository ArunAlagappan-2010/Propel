"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/validation/schemas";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const parsed = contactSchema.safeParse(data);
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
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Something went wrong");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border bg-card p-10 text-center"
        role="status"
      >
        <CheckCircle2 className="size-12 text-primary" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Message sent!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name && (
            <p id="name-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.name}
            </p>
          )}
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
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">
            Message <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Tell us about your school, mentoring interest, or sponsorship idea…"
            aria-invalid={!!fieldErrors.message}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
          />
          {fieldErrors.message && (
            <p
              id="message-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {fieldErrors.message}
            </p>
          )}
        </div>

        {/* Honeypot — hidden from real users, bots fill it */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {status === "error" && errorMsg && (
          <p className="text-sm text-destructive" role="alert">
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </Button>
      </div>
    </form>
  );
}
