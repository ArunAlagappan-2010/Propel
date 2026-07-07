"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { recordFinalResult } from "@/lib/actions/scores";
import type { ActionResult } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function RecordResultDialog({
  projectId,
  projectName,
  existing,
}: {
  projectId: string;
  projectName: string;
  existing?: {
    placement: number | null;
    final_score: number | null;
  } | null;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    recordFinalResult,
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
          <Trophy className="mr-1.5 size-4" aria-hidden />
          {existing ? "Edit result" : "Record result"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Final result — {projectName}</DialogTitle>
          <DialogDescription>
            From judging day. Leave placement empty for non-placing teams.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="space-y-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`placement-${projectId}`}>Placement</Label>
              <Input
                id={`placement-${projectId}`}
                name="placement"
                type="number"
                min={1}
                max={100}
                defaultValue={existing?.placement ?? ""}
                placeholder="e.g. 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`score-${projectId}`}>Final score</Label>
              <Input
                id={`score-${projectId}`}
                name="finalScore"
                type="number"
                step="0.01"
                min={0}
                defaultValue={existing?.final_score ?? ""}
                placeholder="e.g. 87.5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`notes-${projectId}`}>
              Judges&apos; notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id={`notes-${projectId}`}
              name="judgeNotes"
              rows={3}
              maxLength={5000}
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
              "Save result"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
