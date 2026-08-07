# Staging URL — internal client testing

A private copy of the public site for the client to review before launch, while
`energy.bm` continues to show the pre-launch holding page to everyone else.

## The link

```
https://d1tw5u3ts6te56.cloudfront.net
```

CloudFront distribution `E3ER4VE9T90K9B`, serving S3 bucket
`energybm-staging-794528` (us-east-2).

## ⚠️ It uses live production data

There is one backend and one database. Staging points at the **same** Elastic
Beanstalk environment and the **same** RDS instance as production:

- The client sees real content — all solar permits, news, projects, settings.
- **Anything edited in the CMS during testing is a real edit.** There is no
  separate staging database to experiment in.
- Uploading an image while testing uploads it to production storage.

If the client needs a sandbox they can freely break, that is a different piece of
work: a second EB environment plus a database restored from a snapshot.

## How it is wired

```
d1tw5u3ts6te56.cloudfront.net
  ├── /api/*, /uploads/*, /cms-admin.html, /app.js, /styles.css
  │     └──> EB  energybm-prod   (same backend as production)
  └── everything else
        └──> S3  energybm-staging-794528   (its own copy of the build)
```

Deliberately mirrors production's behaviour list so the two behave identically.
`404` and `403` both return `/index.html` with a `200`, which is what makes React
Router deep links such as `/gis` work.

`robots.txt` disallows everything, so the staging copy cannot be indexed.

## Updating staging with a new build

```bash
cd portal && VITE_API_URL= npm run build

aws s3 sync dist/ s3://energybm-staging-794528/ \
  --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/index.html s3://energybm-staging-794528/index.html \
  --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"

aws cloudfront create-invalidation --distribution-id E3ER4VE9T90K9B --paths "/*"
```

Build from **`portal/`**, never `src/` — see `PROJECT-STATUS.md` for why.

## Going live

Staging does not need to be promoted. At launch, restore the real
`index.html` on the production bucket (`TAKE-SITE-OFFLINE.md`), and both URLs
then serve the same site.

## Tearing staging down afterwards

```bash
# disable first, then delete once Status=Deployed
aws cloudfront get-distribution-config --id E3ER4VE9T90K9B   # note the ETag
# set Enabled=false, then:
aws cloudfront update-distribution --id E3ER4VE9T90K9B --if-match <ETag> --distribution-config file://disabled.json
aws cloudfront delete-distribution --id E3ER4VE9T90K9B --if-match <ETag>

aws s3 rm s3://energybm-staging-794528/ --recursive
aws s3api delete-bucket --bucket energybm-staging-794528 --region us-east-2
```

## Notes

- The bucket is public-read because it uses the S3 **website** endpoint, which is
  what provides the SPA error-document routing. It holds only compiled front-end
  assets — no credentials, no data.
- `PriceClass_100` (North America + Europe edge locations) — sufficient for
  internal testing and cheaper than global.
- No custom domain or ACM certificate: the default `*.cloudfront.net` name comes
  with HTTPS out of the box. A `staging.energy.bm` alias would need a DNS record
  plus a certificate in **us-east-1**.
