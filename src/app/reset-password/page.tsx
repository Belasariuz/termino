"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestigen, setWachtwoordBevestigen] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (wachtwoord !== wachtwoordBevestigen) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }
    if (wachtwoord.length < 6) {
      setError("Het wachtwoord moet minimaal 6 tekens lang zijn.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: wachtwoord,
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Nieuw wachtwoord instellen
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Kies een nieuw wachtwoord voor je Concq-account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nieuw wachtwoord
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
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Bezig met opslaan..." : "Wachtwoord instellen"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  );
}
