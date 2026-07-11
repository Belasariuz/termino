-- Termino: door de gebruiker beheerde categorieen (i.p.v. vaste lijst)
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

-- De oude vaste lijst-constraint vervalt: categorieen worden nu per
-- gebruiker beheerd, niet meer centraal vastgelegd in code.
alter table public.contracts drop constraint if exists contracts_type_check;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naam text not null,
  created_at timestamptz not null default now(),
  unique (user_id, naam)
);

-- Voorkomt "Software" en "software" als twee losse categorieen
create unique index if not exists categories_user_naam_lower_idx
  on public.categories (user_id, lower(naam));

alter table public.categories enable row level security;

create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Vul de bestaande vaste lijst als startpunt voor bestaande gebruikers
insert into public.categories (user_id, naam)
select u.id, c.naam
from auth.users u
cross join (values
  ('Huurcontract'), ('Leasecontract'), ('Onderhoudscontract'), ('Leverancierscontract'),
  ('Verzekering'), ('Nutsvoorzieningen'), ('Telecom'), ('Software & apps'), ('Abonnement'),
  ('Schoonmaakcontract'), ('Beveiligingscontract'), ('Overig')
) as c(naam)
on conflict (user_id, naam) do nothing;

-- Nieuwe gebruikers krijgen automatisch dezelfde startlijst
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, naam)
  values
    (new.id, 'Huurcontract'), (new.id, 'Leasecontract'), (new.id, 'Onderhoudscontract'),
    (new.id, 'Leverancierscontract'), (new.id, 'Verzekering'), (new.id, 'Nutsvoorzieningen'),
    (new.id, 'Telecom'), (new.id, 'Software & apps'), (new.id, 'Abonnement'),
    (new.id, 'Schoonmaakcontract'), (new.id, 'Beveiligingscontract'), (new.id, 'Overig')
  on conflict (user_id, naam) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_categories on auth.users;
create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row execute function public.seed_default_categories();
