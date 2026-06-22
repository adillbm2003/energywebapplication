#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AWS Deployment Script — Energy.bm Portal
# Requires: AWS CLI, EB CLI, jq
# Run once per deployment:  bash deploy-aws.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — edit these before first run ──────────────────────
APP_NAME="energybm"
ENV_NAME="energybm-prod"
REGION="us-east-1"                     # change if needed
FRONTEND_BUCKET="energybm-frontend"    # must be globally unique
UPLOADS_BUCKET="energybm-uploads"      # must be globally unique
NODE_VERSION="20"

# ── COLOURS ───────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# ── 1. BUILD FRONTEND ─────────────────────────────────────────
info "Building React frontend..."
# VITE_API_URL is set to the EB environment URL — update after first EB deploy
VITE_API_URL=${VITE_API_URL:-""} npm run build
info "Frontend build complete → dist/"

# ── 2. DEPLOY FRONTEND TO S3 ──────────────────────────────────
info "Syncing frontend to S3 bucket: $FRONTEND_BUCKET"
aws s3 sync dist/ "s3://$FRONTEND_BUCKET/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

# index.html must not be cached so users always get the latest SPA shell
aws s3 cp dist/index.html "s3://$FRONTEND_BUCKET/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

info "Frontend deployed to S3."

# ── 3. INVALIDATE CLOUDFRONT ──────────────────────────────────
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  info "Invalidating CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"
  info "CloudFront invalidation created."
else
  warning "CLOUDFRONT_DISTRIBUTION_ID not set — skipping CloudFront invalidation."
fi

# ── 4. DEPLOY BACKEND TO ELASTIC BEANSTALK ────────────────────
info "Deploying backend to Elastic Beanstalk ($ENV_NAME)..."
eb deploy "$ENV_NAME" --timeout 20
info "Backend deployed."

info "Deployment complete!"
echo ""
echo "  Frontend: https://<your-cloudfront-domain>.cloudfront.net"
echo "  Backend:  http://${ENV_NAME}.${REGION}.elasticbeanstalk.com"
echo ""
echo "Remember to set VITE_API_URL to the EB URL and rebuild the frontend if this is your first deploy."
