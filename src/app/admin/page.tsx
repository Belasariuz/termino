import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning" ? "text-[#B4740E]" : tone === "danger" ? "text-[#DC2648]" : "text-[#12141C]";
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-[#8A93A3]">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function thirtyDaysAgoIso() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const thirtyDaysAgo = thirtyDaysAgoIso();

  const [{ count: totalContracts }, { data: recentAlerts }, { count: unresolvedErrors }] =
    await Promise.all([
      supabase.from("contracts").select("*", { count: "exact", head: true }),
      supabase.from("alerts").select("status").gte("created_at", thirtyDaysAgo),
      supabase
        .from("error_log")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false),
    ]);

  const verzonden = recentAlerts?.filter((a) => a.status === "verzonden").length ?? 0;
  const mislukt = recentAlerts?.filter((a) => a.status === "mislukt").length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatTile label="Totaal aantal contracten" value={totalContracts ?? 0} />
      <StatTile label="Meldingen verzonden (30d)" value={verzonden} />
      <StatTile
        label="Meldingen mislukt (30d)"
        value={mislukt}
        tone={mislukt > 0 ? "danger" : "default"}
      />
      <StatTile
        label="Onopgeloste foutmeldingen"
        value={unresolvedErrors ?? 0}
        tone={(unresolvedErrors ?? 0) > 0 ? "danger" : "default"}
      />
    </div>
  );
}
