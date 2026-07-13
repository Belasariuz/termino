import Link from "next/link";
import { Logo } from "@/components/logo";
import { primaryButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo />
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#12141C]">
        Pagina niet gevonden
      </h1>
      <p className="max-w-sm text-sm text-[#6B7383]">
        Deze pagina bestaat niet, of het contract dat je zoekt is niet (meer)
        beschikbaar.
      </p>
      <Link href="/" className={primaryButtonClass}>
        Terug naar dashboard
      </Link>
    </main>
  );
}
