-- Conq: status-check + mogelijkheid om een contract als opgezegd te markeren
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.contracts
  add constraint contracts_status_check check (status in ('actief', 'opgezegd'));
