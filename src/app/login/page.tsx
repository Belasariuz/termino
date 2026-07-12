"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      setStatus("error");
      setErrorMessage("E-mailadres of wachtwoord onjuist.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Concq</h1>
        <p className="mb-6 text-sm text-gray-500">
          Log in met je e-mailadres en wachtwoord.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-500 hover:text-gray-900 hover:underline"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
            <input
              type="password"
              required
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {status === "sending" ? "Bezig met inloggen..." : "Inloggen"}
          </button>
          {status === "error" && errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nog geen account?{" "}
          <Link href="/register" className="font-medium text-gray-900 hover:underline">
            Meld je aan
          </Link>
        </p>
      </div>
    </main>
  );
}
