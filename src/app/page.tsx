import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import type { Contract } from "@/lib/contracts";

function formatDatum(datum: string) {
  return new Date(datum).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBedrag(bedrag: number | null) {
  if (bedrag === null) return "-";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag);
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .order("opzegdeadline", { ascending: true })
    .returns<Contract[]>();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Termino</h1>
          <p className="text-sm text-gray-500">
            Ingelogd als {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contracts/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Nieuw contract
          </Link>
          <SignOutButton />
        </div>
      </div>

      {!contracts || contracts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">Je hebt nog geen contracten toegevoegd.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Partij</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Einddatum</th>
                <th className="px-4 py-3 font-medium">Opzegtermijn</th>
                <th className="px-4 py-3 font-medium">Opzegdeadline</th>
                <th className="px-4 py-3 font-medium">Verlenging</th>
                <th className="px-4 py-3 font-medium">Waarde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {contract.partij}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contract.type}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDatum(contract.einddatum)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {contract.opzegtermijn_dagen} dagen
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatDatum(contract.opzegdeadline)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {contract.verlengingswijze === "stilzwijgend"
                      ? "Stilzwijgend"
                      : "Actief"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatBedrag(contract.contractwaarde)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
