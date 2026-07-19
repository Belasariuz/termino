import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: files } = await admin.storage.from("contracts").list(user.id);
  if (files && files.length > 0) {
    const paths = files.map((file) => `${user.id}/${file.name}`);
    await admin.storage.from("contracts").remove(paths);
  }

  const { count } = await admin
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  await admin.from("customer_events").insert({
    signed_up_at: user.created_at,
    had_contracts: (count ?? 0) > 0,
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
