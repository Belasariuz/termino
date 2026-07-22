import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const consent = searchParams.get("consent") === "1";
  const consentVersie = searchParams.get("consent_versie");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Alleen bij de eerste keer akkoord vastleggen (bv. via Google), nooit
      // een bestaande acceptatie overschrijven bij een volgende login.
      if (user && consent && consentVersie && !user.user_metadata?.algemene_voorwaarden_geaccepteerd) {
        await supabase.auth.updateUser({
          data: {
            algemene_voorwaarden_geaccepteerd: true,
            algemene_voorwaarden_geaccepteerd_op: new Date().toISOString(),
            algemene_voorwaarden_versie: consentVersie,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
