-- Concq: alerts-tabel voor 90/60/30-dagen e-mailherinneringen
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  trigger_datum date not null,
  type integer not null check (type in (90, 60, 30)),
  verzonden_op timestamptz,
  created_at timestamptz not null default now(),
  unique (contract_id, type)
);

create index if not exists alerts_contract_id_idx on public.alerts(contract_id);

alter table public.alerts enable row level security;

-- Een gebruiker mag alleen alerts zien van zijn eigen contracten
create policy "Users can view alerts for their own contracts"
  on public.alerts for select
  using (
    exists (
      select 1 from public.contracts
      where contracts.id = alerts.contract_id
      and contracts.user_id = auth.uid()
    )
  );
