-- Termino: kolom voor AI-verantwoording per veld
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.contracts
  add column if not exists ai_reasoning jsonb;
