import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Chats" };

export default async function AdminChatsPage() {
  const supabase = await createClient();

  const [{ data: conversations }, { data: stats }] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        "id, created_at, conversation_participants(profile:profiles(id, full_name, role))"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.rpc("admin_conversation_stats"),
  ]);

  const statMap = new Map<
    string,
    { message_count: number; last_activity: string }
  >(
    ((stats as
      | { conversation_id: string; message_count: number; last_activity: string }[]
      | null) ?? []).map((s) => [
      s.conversation_id,
      { message_count: s.message_count, last_activity: s.last_activity },
    ])
  );

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Chats</h1>
      <p className="mt-2 flex items-start gap-2 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          Privacy by default: you can see who is talking and how active a
          conversation is — but not message content. Most participants are
          minors; content access is a deliberate policy decision documented
          in <code className="text-xs">docs/data-model.md</code>.
        </span>
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participants</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(conversations ?? []).map((c) => {
              const participants = c.conversation_participants
                .map((p) => (Array.isArray(p.profile) ? p.profile[0] : p.profile))
                .filter(Boolean);
              const stat = statMap.get(c.id);
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {participants.map((p) => (
                        <span key={p!.id} className="flex items-center gap-1.5">
                          <span className="font-medium">{p!.full_name}</span>
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px] capitalize"
                          >
                            {p!.role}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{stat?.message_count ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {stat?.last_activity
                      ? formatDistanceToNow(new Date(stat.last_activity), {
                          addSuffix: true,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
            {(conversations ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  No conversations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
