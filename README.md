# Alineplane. Audit-ready infra from your repo.

Landing page for Alineplane, an Internal Developer Platform. It sells the
customer-visible loop: analyze a GitHub repo, review an evidence-backed plan,
provision with guardrails, and keep desired / actual / proof in sync.

## What it covers

- **Problem:** managed-platform trap vs DIY / hire trap for post-traction teams.
- **How it works:** paste repo → review plan → approve → dashboard.
- **Tiers:** Lightweight $500 / Standard $2,500 / Enterprise $10K+.
- **Review form:** name, work email, company, optional repo, cloud provider.

## Design

Forest / cream / copper, typography-led: Inter Tight for UI, a Fraunces italic
accent word, JetBrains Mono only inside product snippets. Hairline borders, no
shadows-as-decoration, one quiet hero light source, fade-up reveals that respect
`prefers-reduced-motion`. Colour tokens live on `:root`; `.paper` sections
re-declare them, so text colour always follows its surface.

## Stack

Plain HTML/CSS/JS. No build step, no dependencies.

```
index.html
css/styles.css
js/main.js
```

## Running locally

Open the file directly:

```bash
open index.html
```

Or serve it (useful for testing on other devices on the same network):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- The hero "Get my plan" field validates a GitHub URL. With a portal origin set
  (`PORTAL_ORIGIN` in `js/main.js` or `<meta name="alineplane-portal">`) it opens
  `<portal>/analyze?repo=…`; until then it carries the repo into the review form.
- Sign-up forms POST `{ name, email, company, cloud, source, pageUrl }` to
  `SIGNUP_ENDPOINT` in `js/main.js`. Set that to the Apps Script web-app URL
  (see the `_IDP` repo `docs/LEADS.md`). Until it is set, submit shows an error.
- Product name ("Alineplane") was formerly a placeholder.
