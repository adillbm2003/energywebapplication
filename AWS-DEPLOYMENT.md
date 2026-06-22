# AWS Deployment Guide — Energy.bm Portal

## Architecture
```
Users → CloudFront CDN → S3 (React frontend)
Users → CloudFront CDN → Elastic Beanstalk (Node.js backend)
                              ↓
                         RDS PostgreSQL
                              ↓
                         S3 (file uploads)
```

---

## Step 1 — Create an AWS Account

1. Go to https://aws.amazon.com and click **Create an AWS Account**
2. Enter email, account name, billing info
3. Select **Basic (free)** support plan

---

## Step 2 — Create an IAM User (don't use root account)

1. Log in to AWS Console → search **IAM** → **Users** → **Create user**
2. Name: `energybm-deploy`
3. Check **Provide user access to the AWS Management Console** → **I want to create an IAM user** → set password
4. Permissions → **Attach policies directly** → add:
   - `AdministratorAccess` *(for initial setup — restrict later)*
5. Click through and **Create user**
6. Go to the new user → **Security credentials** tab → **Create access key**
7. Choose **Command Line Interface (CLI)** → **Create access key**
8. **Download the CSV** — you need `Access key ID` and `Secret access key`

---

## Step 3 — Install AWS CLI and EB CLI

**Windows (PowerShell as Admin):**
```powershell
# AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# EB CLI (needs Python)
pip install awsebcli --upgrade
```

**Verify:**
```
aws --version
eb --version
```

---

## Step 4 — Configure AWS CLI

```bash
aws configure
```
Enter when prompted:
```
AWS Access Key ID:     <from CSV download>
AWS Secret Access Key: <from CSV download>
Default region name:   us-east-1
Default output format: json
```

---

## Step 5 — Create S3 Bucket for File Uploads

```bash
# Must be globally unique — change the name if it's taken
aws s3api create-bucket \
  --bucket energybm-uploads \
  --region us-east-1

# Block all public access (uploads served via presigned URLs)
aws s3api put-public-access-block \
  --bucket energybm-uploads \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Step 6 — Create S3 Bucket for Frontend

```bash
aws s3api create-bucket \
  --bucket energybm-frontend \
  --region us-east-1

# Enable static website hosting
aws s3 website s3://energybm-frontend/ \
  --index-document index.html \
  --error-document index.html

# Make bucket publicly readable
aws s3api put-bucket-policy \
  --bucket energybm-frontend \
  --policy '{
    "Version":"2012-10-17",
    "Statement":[{
      "Sid":"PublicRead",
      "Effect":"Allow",
      "Principal":"*",
      "Action":"s3:GetObject",
      "Resource":"arn:aws:s3:::energybm-frontend/*"
    }]
  }'
```

---

## Step 7 — Create RDS PostgreSQL Database

1. AWS Console → search **RDS** → **Create database**
2. Settings:
   - Engine: **PostgreSQL**
   - Template: **Free tier** (or Production for gov)
   - DB instance identifier: `energybm-db`
   - Master username: `energybm`
   - Master password: *choose a strong password*
   - Instance type: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB gp2
   - **Public access: Yes** *(needed for EB to connect — restrict with security group later)*
3. Click **Create database** — takes ~5 minutes
4. Once created, note the **Endpoint** (looks like `energybm-db.xxxx.us-east-1.rds.amazonaws.com`)

---

## Step 8 — Create IAM User for S3 Uploads (used by backend)

```bash
# Create user
aws iam create-user --user-name energybm-s3-user

# Attach S3 policy for the uploads bucket
aws iam put-user-policy \
  --user-name energybm-s3-user \
  --policy-name energybm-s3-policy \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":["s3:PutObject","s3:GetObject","s3:DeleteObject"],
      "Resource":"arn:aws:s3:::energybm-uploads/*"
    }]
  }'

# Create access keys
aws iam create-access-key --user-name energybm-s3-user
```
Save the `AccessKeyId` and `SecretAccessKey` from the output.

---

## Step 9 — Initialize Elastic Beanstalk

In the project folder (where `server.cjs` lives):

```bash
eb init
```
Answer the prompts:
```
region:       us-east-1
application:  energybm (create new)
platform:     Node.js 20
SSH:          Yes (or No if you don't need shell access)
```

---

## Step 10 — Create Elastic Beanstalk Environment

```bash
eb create energybm-prod \
  --instance-type t3.small \
  --single \
  --platform "Node.js 20 running on 64bit Amazon Linux 2023"
```

This takes ~5 minutes. Once done, get the URL:
```bash
eb status
```
Note the **CNAME** (looks like `energybm-prod.us-east-1.elasticbeanstalk.com`)

---

## Step 11 — Set Environment Variables on Elastic Beanstalk

Replace all placeholder values below with your real ones:

```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_URL="postgresql://energybm:<password>@<rds-endpoint>:5432/postgres" \
  JWT_SECRET="<generate-32-char-random-string>" \
  AWS_ACCESS_KEY_ID="<s3-user-access-key-from-step-8>" \
  AWS_SECRET_ACCESS_KEY="<s3-user-secret-from-step-8>" \
  AWS_REGION="us-east-1" \
  AWS_S3_BUCKET="energybm-uploads" \
  APPROVED_ORIGINS="https://<cloudfront-domain>.cloudfront.net,https://energybm-frontend.s3-website-us-east-1.amazonaws.com" \
  RAILWAY_PUBLIC_DOMAIN=""
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 12 — Deploy Backend

```bash
eb deploy
```

Test it:
```bash
curl http://energybm-prod.us-east-1.elasticbeanstalk.com/api/health
```

---

## Step 13 — Build and Deploy Frontend

Set the backend URL then build:

```bash
# Windows PowerShell:
$env:VITE_API_URL = "http://energybm-prod.us-east-1.elasticbeanstalk.com"
npm run build

# Mac/Linux:
VITE_API_URL="http://energybm-prod.us-east-1.elasticbeanstalk.com" npm run build
```

Upload to S3:
```bash
aws s3 sync dist/ s3://energybm-frontend/ --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://energybm-frontend/index.html \
  --cache-control "no-cache,no-store,must-revalidate"
```

Frontend is now live at:
`http://energybm-frontend.s3-website-us-east-1.amazonaws.com`

---

## Step 14 — Create CloudFront Distribution (CDN + HTTPS)

```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "energybm-2026",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-energybm-frontend",
      "DomainName": "energybm-frontend.s3-website-us-east-1.amazonaws.com",
      "CustomOriginConfig": {
        "HTTPPort": 80, "HTTPSPort": 443,
        "OriginProtocolPolicy": "http-only"
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-energybm-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {"Quantity": 2, "Items": ["GET","HEAD"],"CachedMethods": {"Quantity": 2,"Items": ["GET","HEAD"]}},
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{"ErrorCode": 404, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 0}]
  },
  "Comment": "Energy.bm frontend",
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}'
```

Get the CloudFront domain (takes ~10 min to deploy globally):
```bash
aws cloudfront list-distributions --query 'DistributionList.Items[0].DomainName' --output text
```

---

## Step 15 — Add HTTPS to Backend (optional but recommended)

For the backend, create an Application Load Balancer:
```bash
eb modify
```
Change from **Single Instance** to **Load Balanced**, then attach an ACM certificate.

Or for a quick HTTPS backend, use **AWS Certificate Manager** + **ALB** through the console.

---

## Step 16 — Rebuild Frontend with CloudFront URL

Once CloudFront is active:
```bash
# Windows PowerShell:
$env:VITE_API_URL = "http://energybm-prod.us-east-1.elasticbeanstalk.com"
npm run build
aws s3 sync dist/ s3://energybm-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <your-distribution-id> \
  --paths "/*"
```

---

## Summary of URLs

| Service | URL |
|---------|-----|
| Frontend (S3) | http://energybm-frontend.s3-website-us-east-1.amazonaws.com |
| Frontend (CloudFront HTTPS) | https://xxxx.cloudfront.net |
| Backend (EB) | http://energybm-prod.us-east-1.elasticbeanstalk.com |
| CMS Admin | http://energybm-prod.us-east-1.elasticbeanstalk.com (root) |
| Database | RDS endpoint:5432 |
| Uploads | S3 bucket energybm-uploads (private, presigned URLs) |

---

## Environment Variables Reference

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | Build time | EB backend URL |
| `DATABASE_URL` | EB env | RDS connection string |
| `JWT_SECRET` | EB env | 32-char random string |
| `AWS_ACCESS_KEY_ID` | EB env | S3 user key |
| `AWS_SECRET_ACCESS_KEY` | EB env | S3 user secret |
| `AWS_S3_BUCKET` | EB env | `energybm-uploads` |
| `AWS_REGION` | EB env | `us-east-1` |
| `APPROVED_ORIGINS` | EB env | CloudFront domain |
| `NODE_ENV` | EB env | `production` |
