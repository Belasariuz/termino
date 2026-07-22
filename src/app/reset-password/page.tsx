"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { PASSWORD_MIN_LENGTH, validatePassword } from "@/lib/password";

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
    const wachtwoordFout = validatePassword(wachtwoord);
    if (wachtwoordFout) {
      setError(wachtwoordFout);
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
            minLength={PASSWORD_MIN_LENGTH}
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-[#8A93A3]">
            Minimaal {PASSWORD_MIN_LENGTH} tekens, met hoofdletters, kleine letters en een cijfer.
          </p>
        </div>
        <div>
          <label className={labelClass}>Wachtwoord bevestigen</label>
          <input
            type="password"
            required
            minLength={PASSWORD_MIN_LENGTH}
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
