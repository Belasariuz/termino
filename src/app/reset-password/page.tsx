"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";

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
    <AuthShell
      title="Nieuw wachtwoord instellen"
      subtitle="Kies een nieuw wachtwoord voor je Conq-account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nieuw wachtwoord</label>
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
        <button type="submit" disabled={saving} className={primaryButtonClass + " w-full"}>
          {saving ? "Bezig met opslaan..." : "Wachtwoord instellen"}
        </button>
        {error && <p className="text-sm text-[#DC2648]">{error}</p>}
      </form>
    </AuthShell>
  );
}
