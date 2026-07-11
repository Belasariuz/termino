import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { getUrgencyStatus, URGENCY_STYLES, type Contract } from "@/lib/contracts";

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

function computeStats(contracts: Contract[]) {
  const totalCount = contracts.length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.contractwaarde ?? 0), 0);
  const needsValidation = contracts.filter((c) => !c.gevalideerd).length;
  const needsAttention = contracts.filter((c) => {
    const status = getUrgencyStatus(c.opzegdeadline);
    return status === "urgent" || status === "verlopen";
  }).length;

  const byCategory = new Map<string, { count: number; value: number }>();
  for (const c of contracts) {
    const key = c.type || "Onbekend";
    const entry = byCategory.get(key) ?? { count: 0, value: 0 };
    entry.count += 1;
    entry.value += c.contractwaarde ?? 0;
    byCategory.set(key, entry);
  }
  const categories = Array.from(byCategory.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.value - a.value);

  return { totalCount, totalValue, needsValidation, needsAttention, categories };
}

function StatsOverview({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Totaal aantal contracten</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Totale contractwaarde</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatBedrag(stats.totalValue)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Nog te valideren</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              stats.needsValidation > 0 ? "text-amber-600" : "text-gray-900"
            }`}
          >
            {stats.needsValidation}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Vragen om actie (≤ 30 dagen)</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              stats.needsAttention > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {stats.needsAttention}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Per categorie</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Categorie</th>
              <th className="px-4 py-2 font-medium">Aantal</th>
              <th className="px-4 py-2 font-medium">Totale waarde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.categories.map((category) => (
              <tr key={category.type}>
                <td className="px-4 py-2 text-gray-900">{category.type}</td>
                <td className="px-4 py-2 text-gray-600">{category.count}</td>
                <td className="px-4 py-2 text-gray-600">{formatBedrag(category.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

      {contracts && contracts.length > 0 && (
        <StatsOverview stats={computeStats(contracts)} />
      )}

      {!contracts || contracts.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📄
          </div>
          <h2 className="mb-1 text-base font-semibold text-gray-900">
            Nog geen contracten
          </h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            Voeg je eerste contract toe door een PDF te uploaden — Termino haalt de
            belangrijkste velden er automatisch uit, of vul ze handmatig in.
          </p>
          <Link
            href="/contracts/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            + Eerste contract toevoegen
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
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
              {contracts.map((contract) => {
                const status = getUrgencyStatus(contract.opzegdeadline);
                const style = URGENCY_STYLES[status];

                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        {contract.partij}
                        {!contract.gevalideerd && (
                          <span title="Nog niet gevalideerd" aria-label="Nog niet gevalideerd">
                            ⚠️
                          </span>
                        )}
                      </Link>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
