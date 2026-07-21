import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { wachtwoord } = await request.json().catch(() => ({ wachtwoord: undefined }));

  if (!wachtwoord || typeof wachtwoord !== "string") {
    return NextResponse.json(
      { error: "Voer je wachtwoord in om de verwijdering te bevestigen." },
      { status: 400 },
    );
  }

  // Herauthenticatie op een los client-instantie (geen cookies), zodat een
  // gekaapte sessie een account niet kan laten verwijderen zonder het
  // wachtwoord van de gebruiker te kennen.
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: authError } = await verifyClient.auth.signInWithPassword({
    email: user.email!,
    password: wachtwoord,
  });

  if (authError) {
    return NextResponse.json({ error: "Wachtwoord onjuist." }, { status: 401 });
  }

  const admin = createAdminClient();

  // Alleen lezen tot hier — nog geen enkele wijziging aangebracht. De
  // contractgegevens moeten worden opgehaald vóórdat het account (en dus,
  // via cascade, de contracten) verdwijnt.
  const { data: contracts } = await admin
    .from("contracts")
    .select("id, partij, type, gevalideerd, gevalideerd_op, gevalideerd_door, created_at")
    .eq("user_id", user.id);

  // Het account verwijderen is de onomkeerbare stap. Die gebeurt eerst en
  // los van de opschoning hierna: als deze call faalt, stoppen we meteen en
  // blijft het account volledig intact en bruikbaar — er is dan nog niets
  // verwijderd of weggeschreven (geen wees-audit-record, geen kwijtgeraakte
  // bestanden terwijl het account blijft bestaan).
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Alles hieronder is opschoning/nazorg ná een geslaagde verwijdering. Het
  // account bestaat dan al niet meer; fouten hier zijn geen reden om dat
  // terug te draaien (kan ook niet) en worden gelogd voor een beheerder.
  await admin.from("account_deletion_audit").insert({
    user_id: user.id,
    email: user.email,
    algemene_voorwaarden_geaccepteerd:
      user.user_metadata?.algemene_voorwaarden_geaccepteerd ?? null,
    algemene_voorwaarden_geaccepteerd_op:
      user.user_metadata?.algemene_voorwaarden_geaccepteerd_op ?? null,
    algemene_voorwaarden_versie:
      user.user_metadata?.algemene_voorwaarden_versie ?? null,
    contracts: contracts ?? [],
  });

  const storageErrors: string[] = [];
  const paths: string[] = [];
  const pageSize = 100;

  for (let offset = 0; ; offset += pageSize) {
    const { data: files, error: listError } = await admin.storage
      .from("contracts")
      .list(user.id, { limit: pageSize, offset });

    if (listError) {
      storageErrors.push(`list (offset ${offset}): ${listError.message}`);
      break;
    }
    if (!files || files.length === 0) break;

    paths.push(...files.map((file) => `${user.id}/${file.name}`));
    if (files.length < pageSize) break;
  }

  if (paths.length > 0) {
    const { error: removeError } = await admin.storage.from("contracts").remove(paths);
    if (removeError) {
      storageErrors.push(`remove: ${removeError.message}`);
    }
  }

  if (storageErrors.length > 0) {
    await admin.from("error_log").insert({
      source: "account-delete-storage",
      message: `Opruimen van contract-bestanden is deels mislukt voor gebruiker ${user.id}.`,
      details: { user_id: user.id, errors: storageErrors },
    });
  }

  await admin.from("customer_events").insert({
    signed_up_at: user.created_at,
    had_contracts: (contracts?.length ?? 0) > 0,
  });

  return NextResponse.json({ success: true });
}
