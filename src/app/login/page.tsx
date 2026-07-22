"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth-shell";
import { GoogleAuthSection } from "@/components/google-auth-section";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";

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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, wachtwoord }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setErrorMessage(data.error ?? "Inloggen is mislukt.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welkom terug"
      subtitle="Log in met je e-mailadres en wachtwoord."
      footer={
        <>
          Nog geen account?{" "}
          <Link href="/register" className="font-semibold text-[#12141C] hover:underline">
            Meld je aan
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass + " !mb-0"}>Wachtwoord</label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#6B7383] hover:text-[#12141C] hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
          <input
            type="password"
            required
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={status === "sending"} className={primaryButtonClass + " w-full"}>
          {status === "sending" ? "Bezig met inloggen..." : "Inloggen"}
        </button>
        {status === "error" && errorMessage && (
          <p className="text-sm text-[#DC2648]">{errorMessage}</p>
        )}
      </form>

      <GoogleAuthSection />
    </AuthShell>
  );
}
