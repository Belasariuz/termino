"use client";

import { Logo } from "@/components/logo";
import { primaryButtonClass } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo />
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#12141C]">
        Er ging iets mis
      </h1>
      <p className="max-w-sm text-sm text-[#6B7383]">
        Er is een onverwachte fout opgetreden. Probeer het opnieuw, of ga terug naar
        het dashboard.
      </p>
      {error.message && (
        <p className="max-w-md rounded-[11px] bg-[rgba(220,38,72,0.1)] px-3.5 py-2.5 text-xs text-[#DC2648]">
          {error.message}
        </p>
      )}
      <button onClick={() => reset()} className={primaryButtonClass}>
        Probeer opnieuw
      </button>
    </main>
  );
}
