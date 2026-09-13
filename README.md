# Strata. You ship, we scale.

Landing page for Strata, an Internal Developer Platform (IDP). It's a
customer-facing sign-up page that explains the problem, the solution, how the
platform works end to end, and how the business model splits infrastructure
ownership from control-plane ownership.

## What it covers

- **Problem / solution:** why manual provisioning and untested scaling are
  risky, and how Strata addresses it.
- **How it works:** the sign up → scan project → identify managed infra →
  provision → load test & scale flow.
- **How we work together:** client keeps their own cloud account; Strata
  owns the control plane (provisioning engine, Terraform/OpenTofu state
  files, scaling policies).
- **Sign-up form:** captures name, work email, company, and cloud provider.

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
