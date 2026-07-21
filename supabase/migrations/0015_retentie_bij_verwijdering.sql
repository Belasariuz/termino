-- Conq: bewaring van audit-bewijs bij accountverwijdering
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run
--
-- Contracten (met gevalideerd_door/gevalideerd_op) en het akkoord met de
-- algemene voorwaarden worden bij accountverwijdering hard verwijderd
-- (cascade op auth.users, resp. user_metadata verdwijnt met de user-rij).
-- Dat is precies het bewijs dat nodig is bij een geschil dat vaak juist
-- rond/na afloop van de klantrelatie ontstaat. Deze tabel bewaart een
-- snapshot van dat bewijs, los van het account, voor de duur van de
-- wettelijke verjaringstermijn.

create table if not exists public.account_deletion_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  algemene_voorwaarden_geaccepteerd boolean,
  algemene_voorwaarden_geaccepteerd_op timestamptz,
  algemene_voorwaarden_versie text,
  contracts jsonb not null default '[]'::jsonb,
  deleted_at timestamptz not null default now(),
  retain_until timestamptz not null default (now() + interval '7 years')
);

create index if not exists account_deletion_audit_user_id_idx on public.account_deletion_audit(user_id);
create index if not exists account_deletion_audit_retain_until_idx on public.account_deletion_audit(retain_until);

alter table public.account_deletion_audit enable row level security;
-- Geen policies: tabel is alleen bereikbaar via de service-role client
-- (account delete route). RLS staat aan als default-deny vangnet.
--
-- Bewaartermijn van 7 jaar volgt de gangbare Nederlandse bewaartermijn voor
-- administratie/bewijsvoering; na het verstrijken van retain_until mag deze
-- rij worden opgeschoond (nog geen geautomatiseerde job hiervoor).
