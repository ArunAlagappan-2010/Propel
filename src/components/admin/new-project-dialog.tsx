"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createProject,
    undefined
  );

  // Close on success (action returns undefined and pending flips off).
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted && !pending && !state?.error) {
      setOpen(false);
      setSubmitted(false);
    }
  }, [submitted, pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" aria-hidden />
          New project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project team</DialogTitle>
          <DialogDescription>
            The 5 Innovation Tank stages are created automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              name="name"
              required
              minLength={2}
              maxLength={200}
              placeholder="e.g. Clean Water for Ward 12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-school">
              School <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="project-school" name="schoolName" maxLength={200} />
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
                Creating…
              </>
            ) : (
              "Create project"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
