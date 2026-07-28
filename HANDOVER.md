# Handover — Website Kraamzorg Nadia

Dit document vat samen waar het project staat, zodat een nieuwe sessie hier direct kan verdergaan. Geef dit bestand (of de inhoud ervan) mee aan Claude bij het hervatten.

## Doel van het project

Website voor een kraamverzorgster (werknaam: **Nadia** — placeholder, nog te bevestigen). Vereisten:
- Eén scrollbare pagina, prettig op zowel telefoon als laptop.
- Makkelijk en goedkoop te hosten.
- Nadia moet later **zelf** teksten/foto's/diensten/reviews kunnen aanpassen, zonder developer erbij te hoeven halen.

## Gemaakte keuzes (met reden)

- **Stijl**: warm & huiselijk. Crème achtergrond (`#FBF6EF`), terracotta accent (`#C97B5A`), salie-groen secundair (`#8A9A7E`), tekstkleur warm bruin-antraciet (`#3A322C`). Typografie: Fraunces (koppen, serif) + Inter (body).
- **Structuur**: Hero → Over mij → Diensten → Werkwijze → Reviews → Praktisch → Contact. Sticky navbar met smooth-scroll ankerlinks, hamburgermenu op mobiel.
- **Tech stack**: [Eleventy](https://www.11ty.dev/) (lichte static site generator) + **Decap CMS** als admin-paneel op `/admin`.
- **Hosting**: Netlify (gratis tier, automatische build bij elke push/CMS-save).
- **CMS-login**: **Netlify Identity + Git Gateway** (backend `git-gateway` in `src/admin/config.yml`). Gekozen boven de `github`-OAuth-backend omdat Identity een simpel e-mail/wachtwoord-login geeft — geen GitHub-account nodig voor Nadia, en geen losse GitHub OAuth-app om te registreren.
- **Eigenaarschap**: Nadia moet uiteindelijk haar **eigen** GitHub- en Netlify-account gebruiken, zodat alles volledig in haar beheer staat (niet bij de developer).

## Status: volledig doorlopen als test op Sjoerds eigen account

We hebben de **hele flow (repo → Netlify → CMS-login) end-to-end getest en werkend gekregen**, maar op **Sjoerds eigen test-repo**, niet die van Nadia:

- Repo: [github.com/sjedde/kraamzorgtest](https://github.com/sjedde/kraamzorgtest) (branch `main`)
- Live site: `https://luxury-griffin-4a4a93.netlify.app`
- CMS: `https://luxury-griffin-4a4a93.netlify.app/admin/` — werkt, ingelogd via Netlify Identity (e-mail/wachtwoord).

**Belangrijk:** dit is puur een test-opzet. Voor Nadia moet dezelfde flow **opnieuw doorlopen worden op haar eigen accounts** (zie "Volgende sessie" hieronder). De code zelf hoeft daarvoor niet aangepast te worden — zie waarom hieronder.

### Onderweg tegengekomen problemen (en de fix, voor volgende keer)

1. **Netlify raadt build-instellingen soms verkeerd** wanneer er geen `netlify.toml` in de repo staat. Bij "Deploy from GitHub" stonden Build command en Publish directory allebei op "Not set" → site gaf 404. Fix: handmatig instellen bij **Project configuration → Build & deploy → Build settings → Configure**:
   - Build command: `npm run build`
   - Publish directory: `_site`
   - **Check dit meteen na het importeren van Nadia's eigen repo in Netlify.**

2. **`github`-backend voor Decap CMS vereist een losse GitHub OAuth-app** (geregistreerd op team/account-niveau in Netlify, callback URL `https://api.netlify.com/auth/done`). Dat is omslachtiger dan nodig voor een niet-technische eindgebruiker. We zijn overgestapt op de `git-gateway`-backend (Netlify Identity), die geen GitHub-account of OAuth-app-setup vereist.
   - Om dit te gebruiken: in Netlify → **Project configuration → Identity** → Identity inschakelen, en onder **Identity → Services → Git Gateway** inschakelen.

3. **Invite/reset-password-link van Netlify Identity deed niks** — hij stuurde naar de homepage van de site met een token in de URL, maar de homepage laadde het Identity-widget-script niet (dat stond alleen op `/admin/`). Fix (al doorgevoerd in `src/_includes/base.njk`): het Netlify Identity widget-script + init-snippet staat nu ook op de hoofdsite, zodat invite/reset-links automatisch de "stel wachtwoord in"-popup tonen en na login doorsturen naar `/admin/`. **Deze fix zit al in de code — hoeft niet opnieuw.**

4. **Git-authenticatie vanaf deze Mac**: HTTPS met wachtwoord werkt niet meer bij GitHub (personal access token nodig), en een kale `git push` in een niet-interactieve sessie kan niet om een token/wachtwoord vragen. Wat wél werkte: de lokale SSH-sleutel (`~/.ssh/id_ed25519.pub`) toevoegen aan het GitHub-account onder **Settings → SSH and GPG keys**, en de git-remote op SSH zetten (`git@github.com:...`) in plaats van HTTPS. **Voor Nadia's repo moet dit opnieuw: óf Sjoerds SSH-key ook aan Nadia's GitHub-account toevoegen (als hij eenmalig voor haar pusht), óf Nadia pusht zelf.**

## Waarom de code zelf niet aangepast hoeft te worden voor Nadia

`src/admin/config.yml` gebruikt de `git-gateway`-backend, die **geen repo-naam of gebruikersnaam hardcoded** heeft (in tegenstelling tot de `github`-backend die we tijdelijk testten). Zodra de site op Netlify draait en Identity/Git Gateway daar is ingeschakeld, praat de CMS automatisch met de juiste (aan die Netlify-site gekoppelde) repo — welke repo dat ook is. Er is dus geen stap meer nodig zoals "pas config.yml aan met haar GitHub-gebruikersnaam".

## Wat er al staat (lokaal, werkend en getest)

Projectmap: `/Users/sjoerd/Claude/Nadias website`

```
src/
  _data/settings.yaml      ← alle "losse" teksten (hero, over mij, praktisch, contact, footer, werkwijze-stappen)
  _data/currentYear.js     ← berekent jaartal voor footer
  _data/meta.js            ← site-URL (leest Netlify's URL env var, valt terug op localhost)
  robots.njk, sitemap.njk  ← genereren /robots.txt en /sitemap.xml
  _includes/base.njk       ← HTML-skelet (head incl. SEO-tags + JSON-LD, nav, footer, Netlify Identity widget)
  index.njk                ← homepage, leest settings.yaml + collections.diensten/reviews uit
  diensten/*.md             ← 4 losse dienst-bestanden (title, icon, description) — uitbreidbaar
  reviews/*.md               ← 3 losse review-bestanden (quote, author) — uitbreidbaar
  css/style.css, js/main.js
  admin/index.html, admin/config.yml   ← Decap CMS (backend: git-gateway)
.eleventy.js                ← build-config (o.a. YAML-parsing via js-yaml v4)
package.json                ← scripts: start, build, cms
.gitignore                  ← node_modules, _site
```

**Lokaal draaien:**
```bash
npm install
npm run start   # site op localhost:8080
```

**Git**: lokale repo `main`, huidige remote `origin` wijst naar de **test-repo** `git@github.com:sjedde/kraamzorgtest.git`. Working tree clean, laatste commit `c6666cf`. **Let op: lokale `main` staat 9 commits vóór op `origin/main` — nog niet gepusht.** Pas pushen als expliciet gevraagd.

## SEO — al gedaan vs. nog te doen

**Al gedaan (technische basis, in de code):**
- `robots.txt` en `sitemap.xml` worden automatisch gegenereerd (`src/robots.njk`, `src/sitemap.njk`), en gebruiken via `src/_data/meta.js` automatisch de juiste site-URL (Netlify's `URL`-omgevingsvariabele) — werkt dus vanzelf goed op zowel de testsite als straks het echte domein, zonder handmatig aanpassen.
- `<link rel="canonical">`, Open Graph- en Twitter-metatags in `<head>` (titel, beschrijving, url, afbeelding indien hero-foto is ingesteld).
- JSON-LD structured data (`schema.org/LocalBusiness`) met naam, beschrijving, e-mail, telefoon en werkgebied — gevuld uit dezelfde velden die Nadia straks in de CMS bewerkt, dus geen aparte SEO-invoer nodig.

**Nog te doen zodra het echte domein en echte content bekend zijn (kan pas dan, niet nu op de testsite):**
- Placeholder-content invullen (zie lijst hieronder) — Google indexeert wel, maar `[regio]`/`[X] jaar ervaring` moet weg voor het echt goed rankt.
- Zodra Nadia's site op haar eigen domein staat: de site aanmelden bij **Google Search Console** (search.google.com/search-console), eigenaarschap verifiëren (kan via DNS-record of via een meta-tag in `base.njk`), en daar de sitemap-URL indienen (`https://<domein>/sitemap.xml`).
- Een echte hero-/portretfoto uploaden via de CMS — dat vult automatisch ook `og:image` in de metatags.
- Overwegen: Google Business Profile aanmaken (belangrijk voor lokale vindbaarheid van een dienst als kraamzorg, telt zwaarder mee dan on-site SEO alleen).

## Nog open: placeholder-content die ingevuld moet worden

- Bedrijfsnaam "Kraamzorg Nadia" bevestigen (is een aanname op basis van de mapnaam).
- Foto's: CMS ondersteunt nu foto-upload voor hero en over-mij (velden toegevoegd), maar er zijn nog geen echte foto's geüpload.
- `[regio]` / werkgebied, jaren ervaring, certificering.
- Echte reviews i.p.v. placeholders.
- E-mailadres en telefoonnummer in `settings.yaml` → `contact:`.
- Contactformulier gebruikt Netlify Forms (`data-netlify="true"`) — werkt automatisch zodra gehost op Netlify.

## Update 2026-07-28: footer-keurmerken, stabiliteit, logo-verkenning

**1. Footer: keurmerken/accreditaties (self-service via CMS)**
Op verzoek van Sjoerd toegevoegd: een lijst-veld `footer.keurmerken` (in `src/_data/settings.yaml`, CMS-veld in `src/admin/config.yml` onder "Footer"). Per item: logo (image-upload), naam (voor alt-tekst) en optionele link. Gerenderd in `src/_includes/base.njk`, gestyled in `src/css/style.css` (`.footer-keurmerken`) — grijstinten (`grayscale`) die inkleuren bij hover/focus, dunne scheidingslijn boven de copyright-regel. **Sectie blijft volledig verborgen zolang de lijst leeg is** — er staat nu geen echt logo in, alleen de lege structuur. Nadia kan dit straks zelf vullen via `/admin/` zonder dat er ooit weer code aangepast hoeft te worden.

**2. Twee stabiliteitsfixes (op expliciet verzoek: "moet vooral stabiel blijven, niet kapot gaan")**
- `src/admin/index.html`: Decap CMS werd geladen via een open versie-range (`decap-cms@^3.0.0` vanaf unpkg-CDN) — een upstream-update kon het CMS-paneel laten breken zonder dat er in deze repo iets veranderde. Vastgezet op een exacte, geteste versie: `decap-cms@3.15.1`.
- `netlify.toml` toegevoegd in de projectroot (`build.command = "npm run build"`, `build.publish = "_site"`). Dit was **probleem 1** uit de "Onderweg tegengekomen problemen"-lijst hierboven (Netlify raadt build-instellingen soms fout als ze alleen handmatig in het dashboard staan) — nu zit die instelling in de repo en gaat hij automatisch mee bij elke nieuwe Netlify-koppeling (dus ook bij de overzet naar Nadia's eigen account, zie hieronder).

**3. CMS-preview is bewust kaal gelaten**
Sjoerd vroeg waarom de preview in `/admin/` alleen kale tekst toont zonder site-opmaak — dat is standaard Decap-gedrag zonder `registerPreviewTemplate`/`registerPreviewStyle`. Bewust **niet** gebouwd: een custom preview is extra onderhoud (moet in sync blijven met `index.njk`/`style.css`) en een extra plek die kan breken bij een Decap-update — dat weegt niet op tegen het cosmetische voordeel, gezien de stabiliteits-prioriteit. Nadia kan gewoon opslaan en de live site checken na de automatische Netlify-build (meestal binnen een minuut).

**4. Logo-verkenning — geen besluit genomen**
Op verzoek is een eerste ronde logo-concepten geschetst (als SVG-schets in de chat, niet in de repo) voor "Kraamzorg Nadia", binnen de bestaande huisstijl (crème/terracotta/salie, Fraunces + Inter): (1) blad-icoon naast een woordmerk, (2) rond beeldmerk (blad + naam in een cirkel, geschikt als profielfoto/favicon), (3) een gekleurde icoontegel met woordmerk ernaast. Sessie is gestopt vóórdat er een richting gekozen werd ("stop maar"). **Bij hervatten: geen van de drie is verwerkt in de site** (`logo_emoji: 🌿` in `settings.yaml` staat nog gewoon op de emoji-placeholder) — eerst een richting kiezen, dan pas als SVG afmaken en verwerken (favicon, header-logo, evt. footer).

## Volgende sessie: dit op Nadia's eigen accounts zetten

1. **Nadia**: GitHub-account aanmaken.
2. **Nadia**: nieuwe (lege) repo aanmaken, bijv. `kraamzorg-nadia-website`. Niets aanvinken bij "Initialize repository".
3. **Nadia**: Sjoerd toevoegen als collaborator (Settings → Collaborators), **of** Sjoerd geeft Nadia de code en zij pusht zelf (bijv. via GitHub Desktop, laagdrempeliger dan terminal-SSH).
4. **Sjoerd/Claude**: zodra de repo-URL bekend is → remote aanpassen (`git remote set-url origin <nieuwe-url>` of een nieuwe remote toevoegen) + pushen. Let op de SSH-auth-issue hierboven — mogelijk moet Sjoerds SSH-key (of een nieuwe) aan haar account gekoppeld worden, of gebruik een Personal Access Token die **de gebruiker zelf** invoert (niet via chat delen — zie vorige sessie).
5. **Nadia**: Netlify-account aanmaken via "Sign up with GitHub" (haar eigen account), nieuwe site importeren vanuit haar repo.
   - Build command: `npm run build`
   - Publish directory: `_site`
   - **Direct handmatig instellen** — Netlify raadt dit soms fout, zie probleem 1 hierboven.
6. **Nadia/Sjoerd**: In Netlify → **Project configuration → Identity** → inschakelen. Dan **Identity → Services → Git Gateway** → inschakelen.
7. **Nadia/Sjoerd**: **Identity → Invite users** → Nadia's eigen e-mailadres uitnodigen. Zij klikt de link in haar mail, stelt een wachtwoord in (moet nu gewoon werken dankzij de widget-fix), en kan daarna inloggen op `/admin/`.
8. **Nadia**: zodra ze een domeinnaam heeft geregistreerd → Netlify → Domain management → Add custom domain, DNS-instructies opvolgen.
9. **Opruimen**: de test-repo `sjedde/kraamzorgtest` en bijbehorende Netlify-site (`luxury-griffin-4a4a93`) kunnen na afloop verwijderd worden — waren alleen voor het testen van deze flow.

## Update 2026-07-28 (later): Nadia's repo-URL is bekend, push nog geblokkeerd op auth

Nadia's echte repo bestaat al: **https://github.com/kraamzorgnadia/kraamzorgnadiawebsite** (stappen 1-2 uit de lijst hierboven zijn dus gedaan). Geprobeerd te pushen vanaf Sjoerds Mac, maar dat faalt nog:

- `git ls-remote` op zowel SSH (`git@github.com:kraamzorgnadia/kraamzorgnadiawebsite.git`) als HTTPS geeft **"Repository not found"** / 404.
- Oorzaak: de lokale SSH-sleutel is bij GitHub geauthenticeerd als **`sjedde`** (Sjoerds eigen account, gebruikt voor de test-repo), en dat account heeft (nog) geen toegang tot Nadia's repo. Een 404 hier betekent typisch "bestaat niet **voor jou**" (privé-repo zonder rechten), niet per se dat de repo niet bestaat.

**Nodig voordat er gepusht kan worden (stap 3 uit de lijst hierboven), één van de twee:**
1. Nadia voegt `sjedde` toe als collaborator op `kraamzorgnadia/kraamzorgnadiawebsite` (Settings → Collaborators), of
2. Nadia voegt Sjoerds SSH-public key toe aan haar eigen GitHub-account (Settings → SSH and GPG keys):
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG7dgGoi3TlEjjeSaQXZvorbayPNhyGo1MhfxeeRvEDh sjoerd@mac-windfarm-ais
   ```

Zodra een van beide geregeld is: `git remote set-url origin git@github.com:kraamzorgnadia/kraamzorgnadiawebsite.git` (of nieuwe remote toevoegen) en dan pushen — **let op: niet force-pushen**, eerst checken of Nadia's repo al commits heeft (bijv. als "Initialize repository" toch aangevinkt is bij het aanmaken) om conflicten te voorkomen.

## Eerstvolgende actie

Wachten op: toegang tot `kraamzorgnadia/kraamzorgnadiawebsite` (collaborator of SSH-key, zie hierboven), dan pushen en verder met Identity/Git Gateway inschakelen op die repo/site. Lokale `main` staat 9 commits vóór op de test-repo (`origin/main`) — die horen niet naar de test-repo gepusht te worden, maar naar Nadia's eigen repo zodra toegang geregeld is.

Los daarvan, geen blokkerende vervolgstap: de logo-verkenning ligt stil in afwachting van een richtingskeuze (zie hierboven), en is verder geen "open" taak totdat iemand erop terugkomt.
