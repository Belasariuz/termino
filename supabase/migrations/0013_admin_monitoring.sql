-- Conq: admin-monitoring - uitgebreide alerts-status + error_log
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.alerts
  add column if not exists status text not null default 'verzonden'
    check (status in ('verzonden', 'mislukt', 'geen_email')),
  add column if not exists foutmelding text,
  add column if not exists ontvanger text;

create table if not exists public.error_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  message text not null,
  details jsonb,
  resolved boolean not null default false
);

create index if not exists error_log_created_at_idx on public.error_log(created_at desc);
create index if not exists error_log_resolved_idx on public.error_log(resolved);

alter table public.error_log enable row level security;
-- Geen policies: tabel is alleen bereikbaar via de service-role client
-- (admin dashboard, cron/API routes). RLS staat aan als default-deny vangnet.
