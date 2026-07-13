"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { inputClass, primaryButtonClass } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <AuthShell
      title="Wachtwoord vergeten"
      subtitle="Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord in te stellen."
      footer={
        <Link href="/login" className="font-semibold text-[#12141C] hover:underline">
          Terug naar inloggen
        </Link>
      }
    >
      {status === "sent" ? (
        <p className="rounded-[11px] bg-[rgba(22,163,74,0.1)] p-3.5 text-sm text-[#16A34A]">
          Check je inbox — we hebben een link gestuurd naar {email}.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="jij@bedrijf.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={status === "sending"} className={primaryButtonClass + " w-full"}>
            {status === "sending" ? "Bezig met versturen..." : "Stuur resetlink"}
          </button>
          {status === "error" && (
            <p className="text-sm text-[#DC2648]">
              Er ging iets mis. Probeer het opnieuw.
            </p>
          )}
        </form>
      )}
    </AuthShell>
  );
}
