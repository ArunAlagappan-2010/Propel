"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

/**
 * Live message thread. Subscribes to Supabase Realtime postgres_changes
 * (INSERT on messages for this conversation) — genuinely push-based, no
 * polling. RLS limits both the subscription and the insert to
 * participants.
 */
export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    const { data, error: insertError } = await supabaseRef.current
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body,
      })
      .select("id, body, sender_id, created_at")
      .single();
    setSending(false);

    if (insertError) {
      setError("Message failed to send. Please try again.");
      return;
    }
    setDraft("");
    if (data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data]
      );
    }
  }

  return (
    <>
      <div
        className="flex-1 space-y-3 overflow-y-auto py-4"
        role="log"
        aria-label="Messages"
      >
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    mine
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {format(new Date(m.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            No messages yet. Say hello!
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t pt-3">
        {error && (
          <p className="mb-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={5000}
            placeholder="Type a message…"
            aria-label="Message"
            className="min-h-11 flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <SendHorizonal className="size-4" aria-hidden />
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
