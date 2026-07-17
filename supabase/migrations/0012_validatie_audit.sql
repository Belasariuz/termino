-- Conq: audit trail voor validatie van AI-geextraheerde contractgegevens
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.contracts
  add column if not exists gevalideerd_op timestamptz,
  add column if not exists gevalideerd_door uuid references auth.users(id) on delete set null;

-- Bestaande contracten zijn niet met terugwerkende kracht te herleiden
-- naar een concreet bevestigingsmoment of -persoon; deze blijven leeg.
