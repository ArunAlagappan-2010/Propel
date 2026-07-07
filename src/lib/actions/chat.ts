"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Opens (or creates) the 1:1 conversation with `otherUserId` and goes
 * there. Creation happens in a SECURITY DEFINER SQL function — clients
 * have no direct insert access to conversations/participants.
 */
export async function messageUser(otherUserId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversationId, error } = await supabase.rpc(
    "find_or_create_conversation",
    { other_user: otherUserId }
  );

  if (error || !conversationId) {
    console.error("find_or_create_conversation failed:", error?.message);
    redirect("/chat");
  }

  redirect(`/chat/${conversationId}`);
}
