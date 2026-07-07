"use client";

import { useTransition } from "react";
import { Pin, PinOff, EyeOff, Eye, Loader2 } from "lucide-react";
import { setPostPinned, setPostHidden } from "@/lib/actions/moderation";
import { Button } from "@/components/ui/button";

/** Admin-only pin/hide controls rendered on a post page. */
export function ModerationControls({
  postId,
  isPinned,
  isHidden,
}: {
  postId: string;
  isPinned: boolean;
  isHidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2"
      aria-label="Admin moderation"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
        Admin
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(() => setPostPinned(postId, !isPinned))
        }
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : isPinned ? (
          <>
            <PinOff className="mr-1 size-4" aria-hidden /> Unpin
          </>
        ) : (
          <>
            <Pin className="mr-1 size-4" aria-hidden /> Pin
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(() => setPostHidden(postId, !isHidden))
        }
      >
        {isHidden ? (
          <>
            <Eye className="mr-1 size-4" aria-hidden /> Unhide
          </>
        ) : (
          <>
            <EyeOff className="mr-1 size-4" aria-hidden /> Hide
          </>
        )}
      </Button>
    </div>
  );
}
