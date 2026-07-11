# TODO

## Monetizzazione: pubblicità non invasiva o donazioni

Obiettivo: coprire i costi di hosting/mantenimento, target indicativo ~20€/mese. Due strade, non necessariamente alternative:

- **Pubblicità non invasiva** — valutare provider ad-friendly (es. EthicalAds, Carbon Ads) che non richiedono banner pesanti/popup e si adattano al tema del sito; evitare qualunque cosa impatti Core Web Vitals o l'esperienza di lettura.
- **Richiesta donazioni** — link a Ko-fi/Buy Me a Coffee/GitHub Sponsors o simili, probabilmente in footer o in una pagina dedicata.

Da decidere: quale delle due (o entrambe), dove posizionarle nel layout, e se serve una pagina `/supporta` o basta un widget nel footer.

## Verify `hand` layout against a live magic.wizards.com session

`magic-cards`' `layout: hand` is only partially reverse-engineered — 2 of 5 card slot positions were captured live (from "Design Files: Urza's Destiny, Part 3", the one article found using `config="hand"`), the rest is extrapolated. Unverified: the other 3 slot positions, and whether hovering a hand card repositions siblings the way `fan` does. See `docs/2026-07-10-magic-cards-component-research.md` for what's confirmed vs. assumed.

## Set up Nuxt Studio authentication

`/editor` currently fails with:

```
[error] [nuxt-studio] In order to authenticate users, you need to set up a GITHUB OAuth application.
```

Nuxt Studio needs OAuth credentials to authenticate editors — this is a Studio requirement, unrelated to Nuxt UI.

**Steps** (GitHub, since that's the configured repository provider):

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set the callback URL to `https://blog.pauperwave.org/editor` (production) — a separate app is needed for local dev with a `http://localhost:3000/editor` callback
3. Copy the generated Client ID and Client Secret
4. Set as environment variables:
   - Production: add `STUDIO_GITHUB_CLIENT_ID` / `STUDIO_GITHUB_CLIENT_SECRET` to Vercel
   - Local dev: add the same two to `.env`

Alternative: Google OAuth is also supported (`STUDIO_GOOGLE_CLIENT_ID` / `STUDIO_GOOGLE_CLIENT_SECRET`), combined with `STUDIO_GITHUB_TOKEN` to allow Studio to push changes to the repo. See the [Nuxt Studio docs](https://nuxt.studio/) for details — out of scope for this project's own docs.
