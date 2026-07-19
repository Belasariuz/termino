import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";

type AlertRow = {
  id: string;
  type: number;
  status: "verzonden" | "mislukt" | "geen_email";
  foutmelding: string | null;
  ontvanger: string | null;
  trigger_datum: string;
  verzonden_op: string | null;
  created_at: string;
  contracts: { partij: string } | null;
};

function formatDatum(datum: string | null) {
  if (!datum) return "-";
  return new Date(datum).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<AlertRow["status"], string> = {
  verzonden: "bg-[rgba(22,163,74,0.1)] text-[#16A34A]",
  mislukt: "bg-[rgba(220,38,72,0.1)] text-[#DC2648]",
  geen_email: "bg-[rgba(180,116,14,0.1)] text-[#B4740E]",
};

const STATUS_LABELS: Record<AlertRow["status"], string> = {
  verzonden: "Verzonden",
  mislukt: "Mislukt",
  geen_email: "Geen e-mailadres",
};

export default async function NotificationsPage() {
  const supabase = createAdminClient();
  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, status, foutmelding, ontvanger, trigger_datum, verzonden_op, created_at, contracts(partij)")
    .order("created_at", { ascending: false })
    .returns<AlertRow[]>();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#EEF0F5] px-5 py-3.5">
        <h1 className="font-display text-sm font-bold text-[#12141C]">
          Uitgaande verloopmeldingen
        </h1>
        <p className="mt-0.5 text-xs text-[#8A93A3]">
          Alle 90/60/30-dagen herinneringen die de cron-job heeft verwerkt.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFBFD] text-[#8A93A3]">
            <tr>
              <th className="px-5 py-2.5 font-medium">Contract</th>
              <th className="px-5 py-2.5 font-medium">Drempel</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Ontvanger</th>
              <th className="px-5 py-2.5 font-medium">Foutmelding</th>
              <th className="px-5 py-2.5 font-medium">Deadline</th>
              <th className="px-5 py-2.5 font-medium">Laatst bijgewerkt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF0F5]">
            {(alerts ?? []).map((alert) => (
              <tr key={alert.id}>
                <td className="px-5 py-2.5 text-[#12141C]">
                  {alert.contracts?.partij ?? "-"}
                </td>
                <td className="px-5 py-2.5 text-[#6B7383]">{alert.type} dagen</td>
                <td className="px-5 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[alert.status]}`}
                  >
                    {STATUS_LABELS[alert.status]}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-[#6B7383]">{alert.ontvanger ?? "-"}</td>
                <td className="px-5 py-2.5 text-[#6B7383]">{alert.foutmelding ?? "-"}</td>
                <td className="px-5 py-2.5 text-[#6B7383]">
                  {formatDatum(alert.trigger_datum)}
                </td>
                <td className="px-5 py-2.5 text-[#6B7383]">
                  {formatDatum(alert.verzonden_op ?? alert.created_at)}
                </td>
              </tr>
            ))}
            {(!alerts || alerts.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[#8A93A3]">
                  Nog geen meldingen verwerkt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
