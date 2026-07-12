import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { opzegAlertHtml, opzegAlertOnderwerp } from "@/lib/contract-mail";
import type { Contract } from "@/lib/contracts";

export const runtime = "nodejs";

const ALERT_TYPES = [90, 60, 30] as const;

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isAuthorized(authHeader: string | null) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const actual = Buffer.from(authHeader);
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!isAuthorized(authHeader)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select("*")
    .returns<Contract[]>();

  if (contractsError) {
    return NextResponse.json({ error: contractsError.message }, { status: 500 });
  }

  const results: { contract_id: string; type: number; status: string }[] = [];

  for (const contract of contracts ?? []) {
    const remaining = daysUntil(contract.opzegdeadline);
    const type = ALERT_TYPES.find((t) => t === remaining);
    if (!type) continue;

    const { data: existingAlert } = await supabase
      .from("alerts")
      .select("id, verzonden_op")
      .eq("contract_id", contract.id)
      .eq("type", type)
      .maybeSingle();

    if (existingAlert?.verzonden_op) {
      results.push({ contract_id: contract.id, type, status: "al verzonden" });
      continue;
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(contract.user_id);

    if (authError || !authUser?.user?.email) {
      results.push({ contract_id: contract.id, type, status: "geen e-mailadres" });
      continue;
    }

    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Concq <onboarding@resend.dev>",
      to: authUser.user.email,
      subject: opzegAlertOnderwerp(contract.partij, type),
      html: opzegAlertHtml({
        partij: contract.partij,
        type,
        opzegdeadline: contract.opzegdeadline,
        einddatum: contract.einddatum,
        contractType: contract.type,
      }),
    });

    if (sendError) {
      results.push({ contract_id: contract.id, type, status: `fout: ${sendError.message}` });
      continue;
    }

    if (existingAlert) {
      await supabase
        .from("alerts")
        .update({ verzonden_op: new Date().toISOString() })
        .eq("id", existingAlert.id);
    } else {
      await supabase.from("alerts").insert({
        contract_id: contract.id,
        trigger_datum: contract.opzegdeadline,
        type,
        verzonden_op: new Date().toISOString(),
      });
    }

    results.push({ contract_id: contract.id, type, status: "verzonden" });
  }

  return NextResponse.json({ checked: contracts?.length ?? 0, results });
}
