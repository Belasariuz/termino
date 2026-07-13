import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "./delete-account-button";
import { BackLink, Card, secondaryButtonClass } from "@/components/ui";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naam = user?.user_metadata?.naam as string | undefined;
  const bedrijfsnaam = user?.user_metadata?.bedrijfsnaam as string | undefined;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-8">
      <BackLink href="/">Terug naar dashboard</BackLink>

      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-[#12141C]">
        Mijn account
      </h1>

      <Card className="mb-6 space-y-3 p-5 text-sm">
        <div>
          <span className="text-[#8A93A3]">Naam: </span>
          <span className="font-medium text-[#12141C]">{naam ?? "-"}</span>
        </div>
        <div>
          <span className="text-[#8A93A3]">Bedrijfsnaam: </span>
          <span className="font-medium text-[#12141C]">{bedrijfsnaam ?? "-"}</span>
        </div>
        <div>
          <span className="text-[#8A93A3]">E-mailadres: </span>
          <span className="font-medium text-[#12141C]">{user?.email}</span>
        </div>
      </Card>

      <Card className="mb-6 p-5">
        <h2 className="mb-1 font-display text-sm font-bold text-[#12141C]">
          Categorieën
        </h2>
        <p className="mb-3 text-sm text-[#6B7383]">
          Beheer de contractcategorieën die je bij het invoeren van contracten kunt
          kiezen.
        </p>
        <Link href="/categories" className={secondaryButtonClass + " inline-block !px-4 !py-2 text-sm"}>
          Categorieën beheren
        </Link>
      </Card>

      <div className="rounded-2xl border border-[#F3C6D0] bg-[rgba(220,38,72,0.05)] p-5">
        <h2 className="mb-1 font-display text-sm font-bold text-[#DC2648]">
          Gevarenzone
        </h2>
        <p className="mb-4 text-sm text-[#B23A55]">
          Hiermee verwijder je je account en alle bijbehorende contracten
          permanent. Dit kan niet ongedaan worden gemaakt.
        </p>
        <DeleteAccountButton />
      </div>
    </main>
  );
}
