-- Termino: aanvullende contractcategorieen (software/apps, abonnementen, telecom, lease)
-- Plak dit script in Supabase Dashboard -> SQL Editor -> Run

alter table public.contracts drop constraint contracts_type_check;

alter table public.contracts
  add constraint contracts_type_check check (type in (
    'Huurcontract',
    'Leasecontract',
    'Onderhoudscontract',
    'Leverancierscontract',
    'Verzekering',
    'Nutsvoorzieningen',
    'Telecom',
    'Software & apps',
    'Abonnement',
    'Schoonmaakcontract',
    'Beveiligingscontract',
    'Overig'
  ));
