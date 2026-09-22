# Strata. Audit-ready infra from your repo.

Landing page for Strata, an Internal Developer Platform. It sells the
customer-visible loop: analyze a GitHub repo, review an evidence-backed plan,
provision with guardrails, and keep desired / actual / proof in sync.

## What it covers

- **Problem:** managed-platform trap vs DIY / hire trap for post-traction teams.
- **How it works:** paste repo → review plan → approve → dashboard.
- **Tiers:** Lightweight $500 / Standard $2,500 / Enterprise $10K+.
- **Review form:** name, work email, company, optional repo, cloud provider.

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

- Sign-up forms POST `{ name, email, company, cloud, source, pageUrl }` to
  `SIGNUP_ENDPOINT` in `js/main.js`. Set that to the Apps Script web-app URL
  (see the `_IDP` repo `docs/LEADS.md`). Until it is set, submit shows an error.
- Product name ("Strata") is a placeholder.
