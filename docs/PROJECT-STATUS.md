# Project status — as of 3 August 2026

Snapshot of where energy.bm stands, what is deployed, and what is outstanding.

---

## Current live state

| Thing | State |
|---|---|
| Public site `energy.bm` | **Hidden** behind a pre-launch holding page (deliberate — awaiting launch date) |
| CMS `/cms-admin.html` | **DOWN** — see `INCIDENT-backend-down-20260803.md` |
| API `/api/*` | **DOWN** — same incident |
| Database `energybm-db` | Healthy, `available`, untouched |
| Backend version | `cms-gis-rename-20260803` |

**Two things need doing when work resumes** — both are single commands, documented:

1. Restore the backend → `INCIDENT-backend-down-20260803.md`
2. Restore the public site at launch → `TAKE-SITE-OFFLINE.md`

---

## Architecture, in one place

```
energy.bm ──> CloudFront E2ZZLN3BWN7ABT
                ├── /api/*, /uploads/*, /cms-admin.html, /app.js, /styles.css
                │     └──> Elastic Beanstalk  energybm-prod  (Express, server.cjs)
                │            └──> RDS  energybm-db  (PostgreSQL, external to EB)
                │            └──> S3   energybm-uploads-794528
                └── everything else
                      └──> S3  energybm-frontend-794528  (the React build)
```

The S3 bucket uses `index.html` as **both** index and error document, so every
unmatched path serves `index.html`. That is why swapping that one object hides
or restores the entire public site.

### ⚠️ `portal/` is the deployed front end, not `src/`

The repository contains two React trees. **`portal/` is what ships.** `src/` is a
parallel tree that is ahead on some pages but whose `InstallerCard` cannot render
a logo at all.

Deploying `src/` by mistake once took the installer logos off the live site and
deleted their image files from the bucket via `s3 sync --delete`. Build and
deploy from `portal/`. Consolidating the two trees is real, deliberate work that
deserves a staging check — not something to fold into another task.

---

## Deploying

**Backend** — bundle the runtime files only (no `src/`, `public/`, `docs/`):

```bash
# server.cjs db.cjs migrate.cjs package*.json app.js styles.css cms-admin.html
# logo.png Procfile .npmrc .nvmrc ecosystem.config.json nginx.conf .platform/ server/
aws s3 cp <bundle>.zip s3://elasticbeanstalk-us-east-2-794528240735/energybm/<ver>.zip
aws elasticbeanstalk create-application-version --application-name energybm \
  --version-label <ver> --source-bundle S3Bucket=...,S3Key=...
aws elasticbeanstalk update-environment --environment-name energybm-prod --version-label <ver>
```

**Frontend** — must build with `VITE_API_URL` **empty** so the SPA calls relative
`/api` paths through CloudFront:

```bash
cd portal && VITE_API_URL= npm run build
aws s3 sync dist/ s3://energybm-frontend-794528/ \
  --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/index.html s3://energybm-frontend-794528/index.html \
  --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
aws cloudfront create-invalidation --distribution-id E2ZZLN3BWN7ABT --paths "/*"
```

Prefer sync **without** `--delete`: assets are content-hashed, so stale ones are
harmless, and `--delete` has already removed live images once.

Node 20+ is required (`vite` 8 needs it). Verify with `npm run lint` (clean) and
`npm test` (93 passing).

---

## Data

- **Solar registry**: 785 permits imported from
  `Solar Panel Applications 23.07.2026 matched.xlsx`. 659 count as live —
  **15,416 kW (15.42 MW)**. A permit counts only if its status is
  Complete/Issued/Under Construction **and** its expiry date has not passed.
  One 6,000 kW "Airport" permit is 39% of that total and is worth verifying.
- The Department's own figure is 15.3 MW; ours is 116 kW above it and the cause
  of the difference is not yet identified. Stable across cut-off dates.
- Re-import at any time via CMS → Data & Tools → Solar Registry.

---

## Outstanding

| Priority | Item |
|---|---|
| **High** | Backend is down — one command to restore |
| **High** | The seeded admin password is published in this repo's history and is still live. Rotate via CMS → Staff Accounts |
| Medium | 29 of 48 media library records store absolute URLs to a retired EB hostname; the files are fine at `/uploads/`, the stored URL is stale |
| Medium | `src/` vs `portal/` consolidation |
| Low | Home page YoY percentages ("+9%", "+12%") are hardcoded and do not move with the real figures |
| Low | The uploaded Renewable Dashboard tile image reads "120+ Solar PV Systems · 25+ MW", contradicting the live 659 / 15.4 MW |
| Low | Add EB application-version lifecycle + disk alarm (see incident doc) |
