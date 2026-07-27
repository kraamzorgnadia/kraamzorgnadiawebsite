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

**Git**: lokale repo `main`, huidige remote `origin` wijst naar de **test-repo** `git@github.com:sjedde/kraamzorgtest.git`. Working tree clean, laatste commit `2bff2e2`.

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

## Eerstvolgende actie

Wachten op: Nadia's GitHub-account + repo-URL (stappen 1-3 hierboven), dan verder met pushen naar haar repo en Identity/Git Gateway daar inschakelen.
