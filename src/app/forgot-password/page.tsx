"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Wachtwoord vergeten
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord
          in te stellen.
        </p>

        {status === "sent" ? (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {status === "sending" ? "Bezig met versturen..." : "Stuur resetlink"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">
                Er ging iets mis. Probeer het opnieuw.
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-gray-900 hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </main>
  );
}
