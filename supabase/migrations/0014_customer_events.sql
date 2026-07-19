-- Conq: geanonimiseerde registratie dat iemand klant is geweest
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

create table if not exists public.customer_events (
  id uuid primary key default gen_random_uuid(),
  signed_up_at timestamptz not null,
  cancelled_at timestamptz not null default now(),
  had_contracts boolean not null default false
);

create index if not exists customer_events_cancelled_at_idx on public.customer_events(cancelled_at desc);

alter table public.customer_events enable row level security;
-- Geen policies: tabel is alleen bereikbaar via de service-role client
-- (account delete route). RLS staat aan als default-deny vangnet.
-- Bevat bewust geen user_id, naam of e-mailadres: het record mag niet
-- herleidbaar zijn naar de verwijderde persoon (AVG-verwijderverzoek).
