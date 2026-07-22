-- Conq: rate limiting op mislukte inlogpogingen
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run
--
-- Supabase Auth (GoTrue) heeft eigen ingebouwde rate limits, maar die zijn
-- niet door de applicatie te configureren. Deze tabel houdt mislukte
-- inlogpogingen per e-mailadres bij zodat de eigen /api/auth/login-route
-- een tijdelijke lockout kan afdwingen tegen brute-force op wachtwoorden.

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_email_created_at_idx
  on public.login_attempts(email, created_at desc);

alter table public.login_attempts enable row level security;
-- Geen policies: tabel is alleen bereikbaar via de service-role client
-- (de login-route). RLS staat aan als default-deny vangnet.
