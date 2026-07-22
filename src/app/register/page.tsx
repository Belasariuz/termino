"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { GoogleAuthSection } from "@/components/google-auth-section";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { TERMS_VERSION } from "@/lib/terms";

export default function RegisterPage() {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestigen, setWachtwoordBevestigen] = useState("");
  const [akkoord, setAkkoord] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (wachtwoord !== wachtwoordBevestigen) {
      setErrorMessage("De wachtwoorden komen niet overeen.");
      return;
    }
    if (wachtwoord.length < 6) {
      setErrorMessage("Het wachtwoord moet minimaal 6 tekens lang zijn.");
      return;
    }
    if (!akkoord) {
      setErrorMessage("Je moet akkoord gaan met de algemene voorwaarden.");
      return;
    }

    setStatus("sending");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: wachtwoord,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          naam,
          bedrijfsnaam: bedrijfsnaam || null,
          algemene_voorwaarden_geaccepteerd: true,
          algemene_voorwaarden_geaccepteerd_op: new Date().toISOString(),
          algemene_voorwaarden_versie: TERMS_VERSION,
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    // Als e-mailbevestiging in Supabase uitstaat, is er meteen een sessie
    // en kunnen we direct doorsturen naar het dashboard.
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setStatus("sent");
  }

  return (
    <AuthShell
      title="Aanmelden bij Conq"
      subtitle="Maak een account aan met een e-mailadres en wachtwoord."
      footer={
        <>
          Heb je al een account?{" "}
          <Link href="/login" className="font-semibold text-[#12141C] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {status === "sent" ? (
        <p className="rounded-[11px] bg-[rgba(22,163,74,0.1)] p-3.5 text-sm text-[#16A34A]">
          Check je inbox — we hebben een bevestigingslink gestuurd naar {email}.
          Klik erop om je account te activeren.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Naam</label>
            <input
              type="text"
              required
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bedrijfsnaam (optioneel)</label>
            <input
              type="text"
              value={bedrijfsnaam}
              onChange={(e) => setBedrijfsnaam(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>E-mailadres</label>
            <input
              type="email"
              required
              placeholder="jij@bedrijf.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Wachtwoord</label>
            <input
              type="password"
              required
              minLength={6}
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Wachtwoord bevestigen</label>
            <input
              type="password"
              required
              minLength={6}
              value={wachtwoordBevestigen}
              onChange={(e) => setWachtwoordBevestigen(e.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-[#6B7383]">
            <input
              type="checkbox"
              required
              checked={akkoord}
              onChange={(e) => setAkkoord(e.target.checked)}
              className="mt-0.5 accent-[#6D5EF5]"
            />
            <span>
              Ik ga akkoord met de{" "}
              <a
                href="https://conq.nl/algemene-voorwaarden.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#12141C] hover:underline"
              >
                algemene voorwaarden
              </a>{" "}
              van Conq, inclusief het gebruik van mijn gegevens.
            </span>
          </label>

          <button type="submit" disabled={status === "sending"} className={primaryButtonClass + " w-full"}>
            {status === "sending" ? "Bezig met aanmelden..." : "Account aanmaken"}
          </button>
          {errorMessage && <p className="text-sm text-[#DC2648]">{errorMessage}</p>}
        </form>
      )}

      {status !== "sent" && <GoogleAuthSection />}
    </AuthShell>
  );
}
