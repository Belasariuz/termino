-- Termino: contracts-tabel + Row Level Security
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  partij text not null,
  type text not null,
  begindatum date not null,
  einddatum date not null,
  opzegtermijn_dagen integer not null,
  verlengingswijze text not null check (verlengingswijze in ('stilzwijgend', 'actief')),
  contractwaarde numeric,
  opzegdeadline date generated always as (einddatum - opzegtermijn_dagen) stored,
  status text not null default 'actief',
  pdf_url text,
  ai_confidence jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contracts_user_id_idx on public.contracts(user_id);
create index if not exists contracts_opzegdeadline_idx on public.contracts(opzegdeadline);

alter table public.contracts enable row level security;

-- Elke gebruiker mag alleen zijn eigen contracten zien en beheren
create policy "Users can view their own contracts"
  on public.contracts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own contracts"
  on public.contracts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contracts"
  on public.contracts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own contracts"
  on public.contracts for delete
  using (auth.uid() = user_id);
