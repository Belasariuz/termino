import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";

type ErrorLogRow = {
  id: string;
  source: string;
  message: string;
  details: Record<string, unknown> | null;
  resolved: boolean;
  created_at: string;
};

function formatDatum(datum: string) {
  return new Date(datum).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ErrorsPage() {
  const supabase = createAdminClient();
  const { data: errors } = await supabase
    .from("error_log")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<ErrorLogRow[]>();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#EEF0F5] px-5 py-3.5">
        <h1 className="font-display text-sm font-bold text-[#12141C]">Foutmeldingen</h1>
        <p className="mt-0.5 text-xs text-[#8A93A3]">
          Serverfouten uit cron-jobs en API-routes.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFBFD] text-[#8A93A3]">
            <tr>
              <th className="px-5 py-2.5 font-medium">Bron</th>
              <th className="px-5 py-2.5 font-medium">Bericht</th>
              <th className="px-5 py-2.5 font-medium">Details</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Tijdstip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF0F5]">
            {(errors ?? []).map((err) => (
              <tr key={err.id}>
                <td className="px-5 py-2.5 font-mono text-xs text-[#12141C]">{err.source}</td>
                <td className="px-5 py-2.5 text-[#6B7383]">{err.message}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-[#8A93A3]">
                  {err.details ? JSON.stringify(err.details) : "-"}
                </td>
                <td className="px-5 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      err.resolved
                        ? "bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
                        : "bg-[rgba(220,38,72,0.1)] text-[#DC2648]"
                    }`}
                  >
                    {err.resolved ? "Opgelost" : "Open"}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-[#6B7383]">{formatDatum(err.created_at)}</td>
              </tr>
            ))}
            {(!errors || errors.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[#8A93A3]">
                  Geen foutmeldingen geregistreerd.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
