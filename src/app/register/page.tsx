"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Aanmelden bij Termino
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Maak een account aan met een e-mailadres en wachtwoord.
        </p>

        {status === "sent" ? (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Check je inbox — we hebben een bevestigingslink gestuurd naar{" "}
            {email}. Klik erop om je account te activeren.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Naam
              </label>
              <input
                type="text"
                required
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bedrijfsnaam (optioneel)
              </label>
              <input
                type="text"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                E-mailadres
              </label>
              <input
                type="email"
                required
                placeholder="jij@bedrijf.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Wachtwoord bevestigen
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={wachtwoordBevestigen}
                onChange={(e) => setWachtwoordBevestigen(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                required
                checked={akkoord}
                onChange={(e) => setAkkoord(e.target.checked)}
                className="mt-0.5"
              />
              <span>Ik ga akkoord met het gebruik van mijn gegevens door Termino.</span>
            </label>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {status === "sending" ? "Bezig met aanmelden..." : "Account aanmaken"}
            </button>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Heb je al een account?{" "}
          <Link href="/login" className="font-medium text-gray-900 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
