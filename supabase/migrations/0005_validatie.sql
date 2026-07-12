-- Conq: validatiestatus voor AI-geextraheerde contracten
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.contracts
  add column if not exists gevalideerd boolean not null default true;

-- Bestaande contracten met AI-data die nog niet expliciet gevalideerd zijn
-- blijven op true staan (we kunnen dit achteraf niet meer achterhalen);
-- vanaf nu bepaalt de applicatie deze waarde bij het aanmaken/bewerken.
