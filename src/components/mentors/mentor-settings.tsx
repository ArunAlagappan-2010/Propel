"use client";

import { useActionState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import {
  setCalUsername,
  setOwnBio,
  toggleOwnCategory,
} from "@/lib/actions/mentor-settings";
import type { ActionResult } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export function MentorSettings({
  bio,
  calUsername,
  allCategories,
  activeCategoryIds,
}: {
  bio: string;
  calUsername: string;
  allCategories: Category[];
  activeCategoryIds: string[];
}) {
  const [bioState, bioAction, bioPending] = useActionState<
    ActionResult,
    FormData
  >(setOwnBio, undefined);
  const [calState, calAction, calPending] = useActionState<
    ActionResult,
    FormData
  >(setCalUsername, undefined);
  const [pending, startTransition] = useTransition();
  const active = new Set(activeCategoryIds);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Your mentor settings</CardTitle>
        <CardDescription>
          Only you (and program admins) can change these.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={bioAction} className="space-y-2">
          <Label htmlFor="mentor-bio">Bio</Label>
          <Textarea
            id="mentor-bio"
            name="bio"
            defaultValue={bio}
            rows={4}
            maxLength={2000}
            placeholder="Your field, experience, and what you can help students with…"
          />
          {bioState?.error && (
            <p className="text-sm text-destructive" role="alert">
              {bioState.error}
            </p>
          )}
          <Button type="submit" size="sm" variant="outline" disabled={bioPending}>
            {bioPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="mr-1.5 size-4" aria-hidden />
            )}
            Save bio
          </Button>
        </form>

        <form action={calAction} className="space-y-2">
          <Label htmlFor="cal-username">Cal.com username</Label>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-md border bg-muted/50 pl-3">
              <span className="text-sm text-muted-foreground">cal.com/</span>
              <Input
                id="cal-username"
                name="calUsername"
                defaultValue={calUsername}
                className="border-0 bg-transparent pl-0.5 shadow-none focus-visible:ring-0"
                placeholder="your-username"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={calPending} className="h-9 self-center">
              {calPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Save"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Create a free account at cal.com, connect your Google Calendar
            (Settings → Apps → Google Calendar / Google Meet), then enter
            your username here so students can book you.
          </p>
          {calState?.error && (
            <p className="text-sm text-destructive" role="alert">
              {calState.error}
            </p>
          )}
        </form>

        <div>
          <p className="text-sm font-medium">Your specialties</p>
          <p className="text-xs text-muted-foreground">
            Students filter the mentor directory by these.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allCategories.map((c) => {
              const on = active.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => toggleOwnCategory(c.id, !on))
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
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
        </div>
      </CardContent>
    </Card>
  );
}
