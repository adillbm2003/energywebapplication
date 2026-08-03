# Taking energy.bm offline / bringing it back

The public site is a static build in S3 (`energybm-frontend-794528`) behind
CloudFront (`E2ZZLN3BWN7ABT`). The bucket's website config uses `index.html` as
**both** the index document and the error document, so every unmatched path —
`/gis`, `/about`, every SPA route — is served `index.html`.

That single fact is what makes this simple: replace `index.html` and the whole
public site is replaced. Nothing needs rebuilding or redeploying.

CloudFront routes these paths to the Elastic Beanstalk backend instead, so they
are **unaffected** by the steps below and staff keep working:

| Path | Goes to |
|---|---|
| `/cms-admin.html`, `/app.js`, `/styles.css` | Elastic Beanstalk (the CMS) |
| `/api/*` | Elastic Beanstalk |
| `/uploads/*` | Elastic Beanstalk → S3 presigned |
| everything else | S3 static site |

---

## Take the site offline

```bash
cd portal

# 1. Preserve the live page so restoring never depends on a rebuild
aws s3 cp s3://energybm-frontend-794528/index.html \
          s3://energybm-frontend-794528/index.live-backup.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"

# 2. Publish the holding page
aws s3 cp holding-page.html s3://energybm-frontend-794528/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html; charset=utf-8"

# 3. Keep it out of search results
aws s3 cp robots.prelaunch.txt s3://energybm-frontend-794528/robots.txt \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/plain; charset=utf-8"

# 4. Flush the CDN
aws cloudfront create-invalidation --distribution-id E2ZZLN3BWN7ABT --paths "/*"
```

## Bring the site back for launch

```bash
# 1. Restore the real page from the backup taken above
aws s3 cp s3://energybm-frontend-794528/index.live-backup.html \
          s3://energybm-frontend-794528/index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"

# 2. Allow crawlers again
aws s3 rm s3://energybm-frontend-794528/robots.txt

# 3. Flush the CDN
aws cloudfront create-invalidation --distribution-id E2ZZLN3BWN7ABT --paths "/*"
```

Equivalent alternative to step 1 — rebuild and redeploy from source:

```bash
cd portal && npm run build
aws s3 sync dist/ s3://energybm-frontend-794528/ \
  --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/index.html s3://energybm-frontend-794528/index.html \
  --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
```

## Verifying

```bash
# Should show the holding page while offline, the real site once restored
curl -s https://energy.bm/ | grep -q "not yet publicly available" \
  && echo "OFFLINE" || echo "LIVE"

# Should stay reachable throughout
curl -s -o /dev/null -w "cms  %{http_code}\n" https://energy.bm/cms-admin.html
curl -s -o /dev/null -w "api  %{http_code}\n" https://energy.bm/api/settings
```

## Notes and limits

- The compiled JS/CSS bundles stay in the bucket while offline. Nothing renders
  from them because `index.html` no longer references them, but they are still
  fetchable by direct URL. If the build itself must not be reachable, delete
  `assets/` too and restore it with the `npm run build` + sync route above.
- `robots.txt` blocks well-behaved crawlers only. It is not access control.
- If the site must be genuinely restricted rather than merely hidden, put basic
  auth on the CloudFront distribution with a CloudFront Function on the viewer
  request — that is the correct tool for a private preview.
