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
- **Tech stack**: [Eleventy](https://www.11ty.dev/) (lichte static site generator, geen zware build) + **Decap CMS** als admin-paneel op `/admin`. Gekozen boven Wix/Squarespace omdat het gratis blijft hosten en het bestaande custom ontwerp behoudt; gekozen boven "stuur wijzigingen naar developer" omdat Nadia zelfstandig wil kunnen beheren.
- **Hosting**: Netlify (gratis tier, automatische build bij elke wijziging/CMS-save). Domeinnaam registreert de gebruiker zelf.
- **Eigenaarschap**: Nadia maakt haar **eigen** GitHub- en Netlify-account aan, zodat alles volledig in haar beheer staat (niet bij de developer). De developer (Sjoerd) wordt tijdelijk toegevoegd als GitHub-collaborator om de al-geteste code één keer te pushen.

## Wat er al staat (lokaal, werkend en getest)

Projectmap: `/Users/sjoerd/Claude/Nadias website`

```
src/
  _data/settings.yaml      ← alle "losse" teksten (hero, over mij, praktisch, contact, footer, werkwijze-stappen)
  _data/currentYear.js     ← berekent jaartal voor footer
  _includes/base.njk       ← HTML-skelet (head, nav, footer)
  index.njk                ← homepage, leest settings.yaml + collections.diensten/reviews uit
  diensten/*.md             ← 4 losse dienst-bestanden (title, icon, description) — uitbreidbaar
  reviews/*.md               ← 3 losse review-bestanden (quote, author) — uitbreidbaar
  css/style.css, js/main.js
  admin/index.html, admin/config.yml   ← Decap CMS
.eleventy.js                ← build-config (o.a. YAML-parsing via js-yaml v4)
package.json                ← scripts: start, build, cms
.gitignore                  ← node_modules, _site
```

**Lokaal draaien:**
```bash
npm install
npm run start   # site op localhost:8080
```
**CMS lokaal testen** (tweede terminal):
```bash
npm run cms     # decap-server proxy op :8081
```
dan naar `localhost:8080/admin/`.

Alles hierboven is **al getest**: build zonder errors, desktop + mobiel layout gecontroleerd in de browser, CMS-login/opslaan lokaal geverifieerd (test-wijziging opgeslagen en teruggezet).

**Git**: lokale repo is geïnitialiseerd, 1 commit (`8124b79`), branch `main`, working tree clean. **Nog geen remote gekoppeld — nog niet gepusht.**

## Nog open: placeholder-content die ingevuld moet worden

- Bedrijfsnaam "Kraamzorg Nadia" bevestigen (is een aanname op basis van de mapnaam).
- Foto's (nu dashed-border placeholders): hero-foto + portretfoto.
- `[regio]` / werkgebied, jaren ervaring, certificering.
- Echte reviews i.p.v. placeholders.
- E-mailadres en telefoonnummer in `settings.yaml` → `contact:`.
- Contactformulier gebruikt Netlify Forms (`data-netlify="true"`) — werkt automatisch zodra gehost op Netlify, geen extra actie nodig.

## Openstaande stappen (GitHub + Netlify hand-off)

We waren bezig dit **op Nadia's eigen accounts** te zetten, niet die van de developer.

1. **Nadia**: GitHub-account aanmaken.
2. **Nadia**: nieuwe (lege) repo aanmaken, bijv. `kraamzorg-nadia-website`. Niets aanvinken bij "Initialize repository".
3. **Nadia**: Sjoerd toevoegen als collaborator (Settings → Collaborators) zodat hij eenmalig kan pushen.
4. **Sjoerd/Claude**: zodra de repo-URL bekend is → `git remote add origin <url>` + `git push -u origin main`. *(Nog niet gebeurd — wacht op repo-URL.)*
5. **Nadia**: Netlify-account aanmaken via "Sign up with GitHub" (haar eigen account), nieuwe site importeren vanuit haar repo.
   - Build command: `npm run build`
   - Publish directory: `_site`
6. **Claude**: zodra repo-naam/gebruikersnaam bekend is, `src/admin/config.yml` aanpassen:
   - `backend.name` van `git-gateway` → `github`
   - `backend.repo` toevoegen: `<haar-github-gebruikersnaam>/kraamzorg-nadia-website`
   - Reden: Netlify's GitHub-backend voor Decap CMS werkt automatisch zonder aparte OAuth-app-setup, en vermijdt de (deels verouderde) Netlify Identity-dienst. Omdat de repo van Nadia is, kan ze na deze wijziging direct inloggen op `/admin` met haar eigen GitHub-account.
7. **Nadia**: zodra ze een domeinnaam heeft geregistreerd → Netlify → Site settings → Domain management → Add custom domain, DNS-instructies opvolgen (Claude kan helpen met de exacte DNS-records zodra de domeinnaam + registrar bekend zijn).

## Eerstvolgende actie

Wachten op: Nadia's GitHub repo-URL (na stap 1-3 hierboven), dan verder met pushen en CMS-config afronden.
