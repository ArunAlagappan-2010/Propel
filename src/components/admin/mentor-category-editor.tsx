"use client";

import { useTransition } from "react";
import { adminToggleMentorCategory } from "@/lib/actions/admin-mentors";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

/** Admin "change option with categories": click chips to retag a mentor —
 * changes reflect immediately in the student-facing /mentors filter. */
export function MentorCategoryEditor({
  mentorId,
  allCategories,
  activeCategoryIds,
}: {
  mentorId: string;
  allCategories: Category[];
  activeCategoryIds: string[];
}) {
  const [pending, startTransition] = useTransition();
  const active = new Set(activeCategoryIds);

  return (
    <div className="flex flex-wrap gap-1.5">
      {allCategories.map((c) => {
        const on = active.has(c.id);
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                adminToggleMentorCategory(mentorId, c.id, !on)
              )
            }
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
