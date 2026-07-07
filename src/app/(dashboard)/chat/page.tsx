import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/roles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatListPage() {
  const session = await getSessionProfile();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, created_at, conversation_participants(profile:profiles(id, full_name, role))"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Last message per conversation (single query, reduced in JS — fine at
  // pilot scale).
  const ids = (conversations ?? []).map((c) => c.id);
  const lastMessages = new Map<
    string,
    { body: string; created_at: string; sender_id: string }
  >();
  if (ids.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, body, created_at, sender_id")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false })
      .limit(500);
    for (const m of msgs ?? []) {
      if (!lastMessages.has(m.conversation_id)) {
        lastMessages.set(m.conversation_id, m);
      }
    }
  }

  const items = (conversations ?? [])
    .map((c) => {
      const other = c.conversation_participants
        .map((p) => (Array.isArray(p.profile) ? p.profile[0] : p.profile))
        .find((p) => p && p.id !== session?.userId);
      return {
        id: c.id,
        createdAt: c.created_at,
        other,
        last: lastMessages.get(c.id),
      };
    })
    .sort((a, b) => {
      const ta = a.last?.created_at ?? a.createdAt;
      const tb = b.last?.created_at ?? b.createdAt;
      return tb.localeCompare(ta);
    });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Chat</h1>
      <p className="mt-2 text-muted-foreground">
        Direct messages with mentors and teammates.
      </p>

      <ul className="mt-8 space-y-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/chat/${c.id}`}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <Avatar className="size-11">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {(c.other?.full_name ?? "?")
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part: string) => part[0]?.toUpperCase() ?? "")
                    .join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  <span className="truncate">
                    {c.other?.full_name ?? "Member"}
                  </span>
                  {c.other?.role === "mentor" && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      Mentor
                    </Badge>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {c.last
                    ? `${c.last.sender_id === session?.userId ? "You: " : ""}${c.last.body}`
                    : "No messages yet"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDistanceToNow(
                  new Date(c.last?.created_at ?? c.createdAt),
                  { addSuffix: true }
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <MessagesSquare
            className="mx-auto size-10 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-3 font-medium">No conversations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find a mentor and hit &ldquo;Message&rdquo; to start one.
          </p>
          <Link
            href="/mentors"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Browse mentors
          </Link>
        </div>
      )}
    </div>
  );
}
