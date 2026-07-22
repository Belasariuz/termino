# Briefing: marketingwebsite Conq

Deze briefing is voor de AI agent die de publieke marketingwebsite van Conq bouwt
(los van de bestaande app op `/`, `/login`, `/contracts/...` etc.). De vormgeving
(kleuren, fonts, componentstijl) ligt al vast in de app — dit document beschrijft
**structuur en content-elementen**, niet de visuele stijl. Bouw de site zodat hij
naadloos aanvoelt als voorportaal van de bestaande app.

## 1. Wat is Conq

Conq is een micro-SaaS voor het beheren van zakelijke contracten. Kernbelofte:
nooit meer een contract missen dat stilzwijgend verlengt. Belangrijkste features
in de bestaande app:

- **PDF-upload met AI-extractie**: gebruiker sleept een contract-PDF, AI haalt
  automatisch partij, type, begin-/einddatum, opzegtermijn, verlengingswijze en
  contractwaarde eruit — inclusief een betrouwbaarheidsscore en toelichting per
  veld ("AI-verantwoording").
- **Automatische opzegdeadline-berekening** met urgentie-status: *Deadline
  verstreken*, *Binnen 30 dagen*, *Binnen 90 dagen*, *Ruim op tijd* (rood/oranje/
  groen).
- **Dashboard met overzicht**: totaal aantal contracten, totale contractwaarde,
  aantal nog te valideren, aantal dat actie vraagt, plus een uitsplitsing per
  categorie.
- **Validatieworkflow**: AI-ingevulde contracten moeten expliciet worden
  gecontroleerd/gevalideerd door de gebruiker.
- **Zelf in te richten categorieën** per gebruiker.
- **Automatische deadline-reminders** (cron-job / e-mail via Resend).

Doelgroep: office managers, ondernemers, finance/ops-mensen bij kleine en
middelgrote bedrijven (NL-markt, site en app zijn in het Nederlands) die contracten
nu in een spreadsheet of mailbox bijhouden en al eens een dure stilzwijgende
verlenging hebben gemist.

Toon: professioneel, nuchter, vertrouwenwekkend — geen overdreven marketingtaal.
Nadruk op *rust*, *controle* en *tijd besparen*, niet op hype.

## 2. Bestaand design-systeem (hergebruiken, niet opnieuw uitvinden)

- **Kleuren**: achtergrond `#F7F8FB` met een zachte paarse radial-gradient
  linksboven; primaire accentkleur paars-violet (`#6D5EF5` → `#5847E0` gradient);
  tekst `#12141C` (donker) / `#6B7383` (secundair) / `#8A93A3` (tertiair, labels).
  Statuskleuren: rood `#DC2648` (urgent/verlopen), amber `#B4740E` (aandacht),
  groen `#16A34A` (rustig/oké).
- **Typografie**: `Inter` voor body-tekst, `Space Grotesk` (`font-display`) voor
  koppen, `JetBrains Mono` (`font-mono`) voor labels/badges/datavelden — dit
  mono-accent voor kleine uppercase labels is een herkenbaar merkelement, gebruik
  het ook op de marketingsite (bv. voor sectie-eyebrows, stat-labels).
  Bold/tight tracking voor koppen.
- **Vorm**: veel afgeronde hoeken (12–16px), dunne borders (`#E4E7EF`/`#E7E9F0`),
  zeer subtiele shadows — nooit zware drop-shadows. Cards zijn wit op de lichte
  achtergrond.
- **Componenten om te hergebruiken/consistent te stijlen**:
  - `Logo`/`LogoMark`: paars gradient vierkant met wit schild-icoon + wordmark
    "Conq" in Space Grotesk bold. Gebruik deze exacte logo-component in de navbar.
  - Primary button: paarse gradient, wit, subtiele shadow, hover = iets lichter.
  - Secondary button: witte achtergrond, dunne grijze border.
  - Card: witte rounded-2xl container met dunne border en micro-shadow.
  - Status/urgentie-badges: pill-vormig, lichte tint-achtergrond + gekleurde tekst.
  - Dashed-border upload/empty-state box met paars icoon in vierkant met afgeronde
    hoeken — kan als visueel motief terugkomen bij "zo werkt het"-stappen.
- Bestaande bestanden om als stijlreferentie te lezen: `src/app/globals.css`,
  `src/components/ui.tsx`, `src/components/logo.tsx`, `src/app/page.tsx`.

## 3. Sitestructuur

Publieke marketingsite, los van de ingelogde app. Navigatie linkt naar
`/login` en `/register` voor de bestaande auth-flow (niet opnieuw bouwen).

```
/                    Homepage (zie sectie-indeling hieronder)
/functies            Features-overzicht (uitgebreider dan homepage-samenvatting)
/prijzen             Pricing
/zo-werkt-het         (optioneel, kan ook als sectie op homepage) Onboarding-uitleg
/over-ons            Kort: missie, waarom Conq bestaat (optioneel voor MVP)
/contact             Contactformulier / e-mail
/login, /register    Bestaat al — alleen linken, niet herbouwen
/privacybeleid
/algemene-voorwaarden
```

Voor een micro-SaaS MVP-site is `/` + `/prijzen` + `/contact` + de juridische
pagina's het minimum; `/functies` en `/over-ons` zijn aan te raden maar niet
kritiek. Geen blog/resources-sectie in de eerste versie tenzij expliciet gevraagd.

### Globale navbar
- Logo (Conq) links.
- Nav-links: Functies, Prijzen, (optioneel Over ons).
- Rechts: "Inloggen" (secondary/tekstlink) + "Gratis proberen" of "Account
  aanmaken" (primary button) → linkt naar `/register`.
- Sticky, transparant tot lichte scroll, altijd leesbaar boven de achtergrond-gradient.

### Globale footer
- Logo + korte pay-off zin.
- Kolommen: Product (Functies, Prijzen), Bedrijf (Over ons, Contact), Juridisch
  (Privacybeleid, Voorwaarden).
- Copyright-regel onderaan.
- Geen social-icon-overkill — alleen kanalen die echt bestaan.

## 4. Homepage — sectie-indeling

1. **Hero**
   - Mono uppercase eyebrow-label (bv. "CONTRACTBEHEER, GEAUTOMATISEERD") boven de
     kop, in stijl van de bestaande `font-mono uppercase tracking-wide` labels.
   - Grote H1 in Space Grotesk: belofte gericht op "nooit meer een contract
     missen" / stilzwijgende verlenging voorkomen.
   - Subtekst (1-2 zinnen): wat Conq doet, in gewone taal.
   - Twee CTA's: primary "Gratis proberen" → `/register`, secondary "Zo werkt het"
     → anchor of `/zo-werkt-het`.
   - Visueel: product-screenshot of gestileerde mockup van het dashboard
     (stat-tiles + contractenlijst met status-badges) rechts of eronder — dit is
     het sterkste bewijs dat het product echt bestaat en overzichtelijk is.

2. **Social proof / vertrouwen strip** (optioneel bij launch)
   - Alleen invullen met echte klantlogo's of cijfers; anders overslaan i.p.v.
     nepdata tonen.

3. **Probleem → oplossing**
   - Korte sectie die het herkenbare pijnpunt benoemt (contracten in mailboxen/
     spreadsheets, gemiste opzegtermijnen, onverwachte verlengingen/kosten) en
     hoe Conq dat oplost.

4. **Kernfuncties (grid van 3-4 feature cards)**
   Gebruik de card-stijl uit `ui.tsx`. Elke card: icoon-tegel (vierkant met
   afgeronde hoeken, accentkleur) + korte titel + 1-2 zin uitleg. Suggesties op
   basis van de bestaande app:
   - **AI-extractie uit PDF** — upload een contract, Conq leest partij, data,
     opzegtermijn en waarde automatisch uit.
   - **Automatische deadline-tracking** — altijd zicht op welke contracten
     binnenkort opzegbaar zijn, met duidelijke urgentiestatus.
   - **Validatie & verantwoording** — AI-voorstellen worden pas actief na jouw
     controle; per veld zie je de betrouwbaarheidsscore en onderbouwing.
   - **Overzicht per categorie** — totale waarde en aantal contracten per type,
     in één dashboard.

5. **"Zo werkt het" — stappen (3 stappen)**
   Genummerd of met iconen: 1) Upload je contract-PDF, 2) Controleer de
   automatisch ingevulde gegevens, 3) Krijg tijdig een melding vóór de
   opzegdeadline. Visueel mag het dashed-upload-box motief hier terugkomen.

6. **Productmoment / uitgelicht scherm**
   Eén groter uitgelicht visual (bv. de contractdetailpagina met AI-verantwoording
   per veld) met korte toelichting — laat de diepgang van het product zien, niet
   alleen de lijst.

7. **Pricing-preview**
   Korte samenvatting van 1-2 plannen met link naar volledige `/prijzen`-pagina,
   of de volledige pricing-tabel direct hier als de site geen aparte pricing-pagina
   krijgt.

8. **FAQ**
   Accordion met 5-6 vragen: gegevensbeveiliging, welke bestandsformaten, hoe
   nauwkeurig de AI is, opzegbaarheid van het abonnement, of het NL-specifiek is,
   integraties.

9. **Slot-CTA**
   Volle-breedte sectie met accentkleur-tint achtergrond, herhaling van de hero-CTA
   ("Begin gratis" → `/register`).

10. **Footer** (zie boven).

## 5. Terugkerende elementen / bouwstenen

Bouw deze als herbruikbare componenten zodat ze consistent zijn over de site:

- `Navbar`, `Footer`
- `PrimaryButton` / `SecondaryButton` (of hergebruik `primaryButtonClass`/
  `secondaryButtonClass` uit `src/components/ui.tsx`)
- `FeatureCard` (icoon-tegel + titel + tekst)
- `StatBadge`/urgentiebadge-stijl voor het tonen van voorbeeld-UI in marketing-
  visuals (consistent met `URGENCY_STYLES` in `src/lib/contracts.ts`)
- `SectionEyebrow` — mono uppercase label boven sectiekoppen
- `PricingCard`
- `FaqItem` (accordion)
- Mockup/schermafbeelding-component die het dashboard nabootst (geen losse
  screenshot-afbeelding, maar liefst gecodeerde mini-versie zodat hij scherp
  blijft en met de live merkstijl meebeweegt)

## 6. Copy- en tone-of-voice richtlijnen

- Nederlandstalig, net als de app (`nl-NL`-datumnotatie, "je"-vorm, geen "u").
- Zakelijk-vriendelijk, direct, geen overdreven superlatieven of AI-hype-taal.
- Focus op concrete uitkomsten: tijd besparen, geen gemiste deadlines, controle
  houden — niet op abstracte "innovatie"-praat.
- Gebruik dezelfde terminologie als de app: "contractpartij", "opzegtermijn",
  "opzegdeadline", "verlengingswijze", "gevalideerd" — zodat de taal van website
  naar app-onboarding klopt.

## 7. Technisch

- Zelfde stack: Next.js (App Router), Tailwind v4, dezelfde fonts (Inter, Space
  Grotesk, JetBrains Mono) al geconfigureerd in `src/app/layout.tsx` /
  `globals.css` — hergebruiken, niet opnieuw laden.
  Plaats marketingpagina's als aparte routes naast de bestaande app-routes (of in
  een `(marketing)`-routegroep) zodat de navbar/footer van de marketingsite niet
  botst met de ingelogde app-layout.
- Links naar `/login` en `/register` moeten naar de bestaande, werkende pagina's
  wijzen — deze niet herbouwen.
- Responsive: mobile-first, zelfde breakpoints/spacing-gevoel als de app (`max-w-5xl`/`max-w-3xl` content-breedtes, `px-4 sm:px-8` gutter-patroon).
