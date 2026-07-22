import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(request: Request) {
  const { email, wachtwoord } = await request.json().catch(() => ({}));

  if (!email || typeof email !== "string" || !wachtwoord || typeof wachtwoord !== "string") {
    return NextResponse.json(
      { error: "Vul een e-mailadres en wachtwoord in." },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", normalizedEmail)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return NextResponse.json(
      {
        error: `Te veel mislukte inlogpogingen. Probeer het over ${WINDOW_MINUTES} minuten opnieuw.`,
      },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: wachtwoord,
  });

  if (error) {
    // Oude pogingen van dit e-mailadres opruimen zodat de tabel niet
    // onbeperkt blijft groeien; alleen het venster is relevant.
    await admin.from("login_attempts").delete().eq("email", normalizedEmail).lt("created_at", windowStart);
    await admin.from("login_attempts").insert({ email: normalizedEmail });

    return NextResponse.json(
      { error: "E-mailadres of wachtwoord onjuist." },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
