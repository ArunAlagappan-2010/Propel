import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/chat/chat-thread";
import { Badge } from "@/components/ui/badge";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS returns nothing unless the current user is a participant —
  // a non-member probing this URL gets a 404, not someone else's chat.
  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, conversation_participants(profile:profiles(id, full_name, role))"
    )
    .eq("id", conversationId)
    .single();
  if (!conversation) notFound();

  const other = conversation.conversation_participants
    .map((p) => (Array.isArray(p.profile) ? p.profile[0] : p.profile))
    .find((p) => p && p.id !== user.id);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col md:h-[calc(100dvh-6rem)]">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link
          href="/chat"
          className="flex size-9 items-center justify-center rounded-md hover:bg-muted"
          aria-label="Back to chat list"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 font-semibold">
            {other?.full_name ?? "Member"}
            {other?.role === "mentor" && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Mentor
              </Badge>
            )}
          </h1>
        </div>
      </div>

      <ChatThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
