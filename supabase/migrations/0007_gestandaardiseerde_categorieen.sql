-- Conq: gestandaardiseerde contractcategorieen
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

-- Bestaande vrije-tekst types omzetten naar de nieuwe vaste categorieen
-- (best-effort, op basis van trefwoorden)
update public.contracts
set type = case
  when type ilike '%huur%' then 'Huurcontract'
  when type ilike '%onderhoud%' then 'Onderhoudscontract'
  when type ilike '%leverancier%' then 'Leverancierscontract'
  when type ilike '%verzeker%' then 'Verzekering'
  when type ilike '%nuts%' or type ilike '%energie%' or type ilike '%gas%'
    or type ilike '%water%' or type ilike '%elektr%' then 'Nutsvoorzieningen'
  when type ilike '%schoonmaak%' then 'Schoonmaakcontract'
  when type ilike '%beveilig%' then 'Beveiligingscontract'
  else 'Overig'
end;

alter table public.contracts
  add constraint contracts_type_check check (type in (
    'Huurcontract',
    'Onderhoudscontract',
    'Leverancierscontract',
    'Verzekering',
    'Nutsvoorzieningen',
    'Schoonmaakcontract',
    'Beveiligingscontract',
    'Overig'
  ));
