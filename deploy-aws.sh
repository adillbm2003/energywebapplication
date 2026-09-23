#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AWS Deployment Script — Energy.bm Portal
# Requires: AWS CLI, EB CLI
# Run once per deployment:  bash deploy-aws.sh
#
# Targets:  TARGET=staging (default)  |  TARGET=prod
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────
APP_NAME="energybm"
ENV_NAME="energybm-prod"
REGION="us-east-2"                     # Ohio — matches the live energybm-prod environment

# Real bucket and distribution names. These previously read "energybm-frontend"
# and "energybm-uploads", which do not exist; the script could never have run.
PROD_BUCKET="energybm-frontend-794528"
PROD_DISTRIBUTION="E2ZZLN3BWN7ABT"     # energy.bm
STAGING_BUCKET="energybm-staging-794528"
STAGING_DISTRIBUTION="E3ER4VE9T90K9B"  # d1tw5u3ts6te56.cloudfront.net
UPLOADS_BUCKET="energybm-uploads-794528"

# Staging by default. Deploying to production has to be asked for.
TARGET="${TARGET:-staging}"
case "$TARGET" in
  prod)    BUCKET="$PROD_BUCKET";    DISTRIBUTION="$PROD_DISTRIBUTION" ;;
  staging) BUCKET="$STAGING_BUCKET"; DISTRIBUTION="$STAGING_DISTRIBUTION" ;;
  *) echo "TARGET must be 'staging' or 'prod', not '$TARGET'" >&2; exit 1 ;;
esac

# ── COLOURS ───────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()    { echo -e "${RED}[STOP]${NC} $1" >&2; exit 1; }

# ── 1. BUILD FRONTEND ─────────────────────────────────────────
# portal/, not the repo root. `npm run build` at the root builds src/, a stale
# parallel copy of the site that is not what is deployed -- publishing it once
# already replaced the live logos with the wrong ones.
info "Building React frontend from portal/ → portal/dist/"
VITE_API_URL=${VITE_API_URL:-""} npm --prefix portal run build
info "Frontend build complete."

# ── 2. DEPLOY FRONTEND TO S3 ──────────────────────────────────
info "Deploying to $TARGET bucket: $BUCKET"

# assets/ holds nothing but hashed build output, so it is the one prefix that
# can safely be pruned: a file that is not in this build is unreachable from it.
# Pruning here is what keeps old deploys from piling up -- 591 stale chunks,
# 19.2 MB, had accumulated in production by September 2026.
aws s3 sync portal/dist/assets/ "s3://$BUCKET/assets/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# Everything else -- images/, documents/, guides/ -- is synced WITHOUT --delete,
# deliberately. Some of those files were uploaded straight to the bucket and
# have no copy in git; a whole-bucket --delete (what this script used to do)
# would erase them, and neither bucket has versioning to restore from.
aws s3 sync portal/dist/ "s3://$BUCKET/" \
  --exclude "assets/*" --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"

# index.html must not be cached, so the browser always gets the current shell.
# Production currently serves a pre-launch holding page instead of the site, and
# overwriting it would put energy.bm back in front of the public without anyone
# intending it. The real entry page is kept beside it as index.live-backup.html;
# going live is then a one-line copy, done deliberately.
# Read the current index.html into a variable rather than piping it into
# grep: under `set -o pipefail`, grep -q exiting early can SIGPIPE the aws
# process and make the whole pipeline report failure, which would read as
# "no holding page" and publish the site.
live_index=""
if [ "$TARGET" = "prod" ]; then
  live_index=$(aws s3 cp "s3://$BUCKET/index.html" - 2>/dev/null || true)
  [ -n "$live_index" ] || fail "could not read s3://$BUCKET/index.html -- refusing to guess whether the holding page is up"
fi

if [ "$TARGET" = "prod" ] && printf '%s' "$live_index" | grep -q 'name="robots" content="noindex'; then
  if [ "${PUBLISH_LIVE:-0}" != "1" ]; then
    aws s3 cp portal/dist/index.html "s3://$BUCKET/index.live-backup.html" \
      --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
    warning "Holding page left in place. New build parked at index.live-backup.html."
    warning "To publish the site to the public, re-run with PUBLISH_LIVE=1."
  else
    aws s3 cp portal/dist/index.html "s3://$BUCKET/index.html" \
      --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
    warning "energy.bm is now PUBLIC."
  fi
else
  aws s3 cp portal/dist/index.html "s3://$BUCKET/index.html" \
    --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
fi

# The simulator is a standalone page that references no build assets.
aws s3 cp portal/dist/energy-simulator.html "s3://$BUCKET/energy-simulator.html" \
  --cache-control "no-cache" --content-type "text/html"

info "Frontend deployed to $BUCKET."

# ── 3. INVALIDATE CLOUDFRONT ──────────────────────────────────
info "Invalidating CloudFront distribution $DISTRIBUTION..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" \
  --query 'Invalidation.{Id:Id,Status:Status}' --output text
info "CloudFront invalidation created."

# ── 4. DEPLOY BACKEND TO ELASTIC BEANSTALK ────────────────────
# One backend and one database serve both distributions, so this step is the
# same either way and is skipped unless asked for.
if [ "${DEPLOY_BACKEND:-0}" = "1" ]; then
  info "Deploying backend to Elastic Beanstalk ($ENV_NAME)..."
  eb deploy "$ENV_NAME" --timeout 20
  info "Backend deployed."
else
  info "Backend unchanged (set DEPLOY_BACKEND=1 to deploy server.cjs as well)."
fi

info "Deployment complete."
echo ""
if [ "$TARGET" = "prod" ]; then
  echo "  Production: https://energy.bm"
else
  echo "  Staging:    https://d1tw5u3ts6te56.cloudfront.net"
fi
echo "  Backend:    http://${ENV_NAME}.${REGION}.elasticbeanstalk.com"
echo ""
