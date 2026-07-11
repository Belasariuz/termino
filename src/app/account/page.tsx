import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "./delete-account-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naam = user?.user_metadata?.naam as string | undefined;
  const bedrijfsnaam = user?.user_metadata?.bedrijfsnaam as string | undefined;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900">
        &larr; Terug naar dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Mijn account</h1>

      <div className="mb-8 space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div>
          <span className="text-gray-500">Naam: </span>
          <span className="font-medium text-gray-900">{naam ?? "-"}</span>
        </div>
        <div>
          <span className="text-gray-500">Bedrijfsnaam: </span>
          <span className="font-medium text-gray-900">{bedrijfsnaam ?? "-"}</span>
        </div>
        <div>
          <span className="text-gray-500">E-mailadres: </span>
          <span className="font-medium text-gray-900">{user?.email}</span>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Categorieën</h2>
        <p className="mb-3 text-sm text-gray-500">
          Beheer de contractcategorieën die je bij het invoeren van contracten kunt
          kiezen.
        </p>
        <Link
          href="/categories"
          className="inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Categorieën beheren
        </Link>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="mb-1 text-sm font-semibold text-red-900">Gevarenzone</h2>
        <p className="mb-4 text-sm text-red-700">
          Hiermee verwijder je je account en alle bijbehorende contracten
          permanent. Dit kan niet ongedaan worden gemaakt.
        </p>
        <DeleteAccountButton />
      </div>
    </main>
  );
}
