import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Honeypot tripped — pretend success so bots learn nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (error) {
    console.error("contact_submissions insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
