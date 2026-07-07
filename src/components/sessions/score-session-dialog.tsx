"use client";

import { useActionState, useEffect, useState } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { submitSessionScore } from "@/lib/actions/scores";
import type { ActionResult } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rubric = [
  { name: "creativityScore", label: "Creativity" },
  { name: "executionScore", label: "Execution" },
  { name: "presentationScore", label: "Presentation" },
] as const;

export function ScoreSessionDialog({
  bookingId,
  studentId,
  studentName,
}: {
  bookingId: string;
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    submitSessionScore,
    undefined
  );

  useEffect(() => {
    if (submitted && !pending && !state?.error) {
      setOpen(false);
      setSubmitted(false);
    }
  }, [submitted, pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ClipboardCheck className="mr-1.5 size-4" aria-hidden />
          Submit feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session feedback for {studentName}</DialogTitle>
          <DialogDescription>
            Rate each area 1 (needs work) to 5 (outstanding). The student
            and program admins can see this.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="space-y-4"
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="studentId" value={studentId} />

          {rubric.map((r) => (
            <div key={r.name} className="space-y-2">
              <Label htmlFor={r.name}>{r.label}</Label>
              <Select name={r.name} defaultValue="3">
                <SelectTrigger id={r.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} —{" "}
                      {["Needs work", "Developing", "Good", "Strong", "Outstanding"][n - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="feedbackText">
              Written feedback{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="feedbackText"
              name="feedbackText"
              rows={3}
              maxLength={5000}
              placeholder="What went well? What should they focus on next?"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save feedback"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
