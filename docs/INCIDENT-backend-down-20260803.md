# Incident — Elastic Beanstalk backend unresponsive (3 Aug 2026)

**Status: OPEN.** Deferred overnight by decision. The public site is unaffected.

## Impact

| Service | State |
|---|---|
| Public site (`energy.bm`) | **Working** — serving the pre-launch holding page as intended, from S3/CloudFront |
| CMS (`/cms-admin.html`, `/app.js`) | **DOWN** — HTTP 504 |
| API (`/api/*`) | **DOWN** — HTTP 504 |
| Uploads (`/uploads/*`) | **DOWN** — proxied via the backend |
| Database (`energybm-db`) | Healthy, untouched, `available` |

Staff cannot log into the CMS or edit content until this is resolved. Nothing
is lost — no data was on the instance.

## Timeline (UTC)

- **2 Aug 20:31** — last successful deploy (`cms-gis-rename-20260803`); environment
  healthy for the following ~24 hours.
- **3 Aug 20:26** — environment health goes to `No Data`; all instances stop
  reporting. Start of the outage.
- 3 Aug 20:44 — `restartAppServer` issued; **timed out after 14 minutes**,
  "instance has not responded in the allowed command timeout time".
- 3 Aug 21:50 — EC2 reboot issued and completed. Instance returned to `running`,
  status checks passing — **but still would not execute commands**.
- 3 Aug 21:53 — full redeploy issued; **aborted**, "Successful: 0, TimedOut: 1".
- 3 Aug 22:0x — SSM checked as a way in: instance is **not SSM-registered**, so
  there is no remote shell.

## Diagnosis

The instance (`i-01feab20f1dd94d62`, `t3.small`, launched 7 Jul) is alive at the
hypervisor level — EC2 status checks pass and CloudWatch receives CPU metrics
(idle, ~0.3%) — but nothing inside it responds. The EB health agent, the
application and the command channel are all silent.

CPU being idle rather than pegged means the Node process is dead, not thrashing.
A reboot failing to restore command execution rules out a transient hang.

**Most likely cause: the root volume is full.** That produces exactly this
signature — services that cannot write fail to start, and command execution
hangs rather than erroring. Unconfirmed, because the agent is the very thing
that would report disk usage.

Contributing factor worth checking: six application versions were deployed to
this environment on 2 Aug. Each leaves a bundle plus `npm install` artifacts on
the root volume, and old application versions are not pruned automatically.

## Recovery — run one of these

The instance holds **no application state**. Content is in RDS, uploads are in
S3. Replacing it loses nothing. Verified via `describe-environment-resources`:
the database is **not** an EB-managed resource, so neither option touches it.

### Option A — replace the instance (recommended, ~5 min)

```bash
aws ec2 terminate-instances --instance-ids i-01feab20f1dd94d62 --region us-east-2
```

The Auto Scaling Group (`awseb-e-mn9dbnrwrv-stack-AWSEBAutoScalingGroup-jKuQA7Tu4A6h`)
launches a clean replacement running the current application version.

### Option B — rebuild the environment (~10–15 min)

```bash
aws elasticbeanstalk rebuild-environment --environment-name energybm-prod --region us-east-2
```

### Verify recovery

```bash
aws elasticbeanstalk describe-environments --environment-names energybm-prod \
  --region us-east-2 --query "Environments[0].{Health:Health,Status:Status}"

curl -s https://energy.bm/api/settings -o /dev/null -w "api  %{http_code}\n"
curl -s https://energy.bm/cms-admin.html -o /dev/null -w "cms  %{http_code}\n"
curl -s http://energybm-prod.us-east-2.elasticbeanstalk.com/health
```

`/health` should report `{"status":"OK","checks":{"database":"OK","storage":"S3"}}`.

## Follow-up once service is restored

1. **Confirm the cause** — `df -h` on the new instance, and check how much the
   old application versions occupy.
2. **Prune old application versions.** There are now many; EB keeps their
   bundles. Set a lifecycle policy:
   ```bash
   aws elasticbeanstalk update-application-resource-lifecycle \
     --application-name energybm --region us-east-2 \
     --resource-lifecycle-config 'ServiceRole=<eb-service-role-arn>,VersionLifecycleConfig={MaxCountRule={Enabled=true,MaxCount=10,DeleteSourceFromS3=true}}'
   ```
3. **Add disk alarming.** Enhanced health reports `RootFilesystemUtil`; alarm at
   85% so this is caught before it takes the service down.
4. **Consider a larger root volume** if 8 GB is the current size — it is tight
   for a Node app with frequent deploys.

## Note on the holding page

Taking the public site offline (S3 + CloudFront only) is **unrelated** to this
outage and did not cause it — the timeline shows the environment already in
`No Data` beforehand, and neither S3 nor CloudFront can affect an EC2 instance.
See `docs/TAKE-SITE-OFFLINE.md` for restoring the public site at launch.
