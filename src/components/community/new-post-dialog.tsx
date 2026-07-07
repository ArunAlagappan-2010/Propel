"use client";

import { useActionState, useState } from "react";
import { Loader2, PenSquare } from "lucide-react";
import { createPost, type ActionResult } from "@/lib/actions/community";
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

export function NewPostDialog({
  categoryId,
  categorySlug,
  categoryName,
}: {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createPost.bind(null, categorySlug),
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PenSquare className="mr-2 size-4" aria-hidden />
          New post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New post in {categoryName}</DialogTitle>
          <DialogDescription>
            Keep it relevant, respectful, and never share personal contact
            details.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="categoryId" value={categoryId} />
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="What's your post about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-body">Post</Label>
            <Textarea
              id="post-body"
              name="body"
              required
              minLength={10}
              maxLength={20000}
              rows={6}
              placeholder="Share your idea, question, or progress…"
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
                Publishing…
              </>
            ) : (
              "Publish post"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
