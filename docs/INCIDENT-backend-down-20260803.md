# Incident — Elastic Beanstalk backend unresponsive (3–7 Aug 2026)

**Root cause: the instance security group had every inbound and outbound rule
removed via the AWS Console as root.** Not a disk failure — see the correction
below.

## Impact

Public site unaffected throughout (it is served from S3/CloudFront and was
showing the pre-launch holding page by design). The CMS, the API and
`/uploads/*` were down for roughly four days.

## Root cause

CloudTrail, security group `sg-0a054e1e18acfa9ed`
(`awseb-e-mn9dbnrwrv-stack-AWSEBSecurityGroup-E4tkJtlY4oQq`):

| Time (UTC) | Event | Identity | Source |
|---|---|---|---|
| 3 Aug 20:04 | `RevokeSecurityGroupIngress` | **root** | `217.165.150.11`, AWS Console (Edge/Windows) |
| 3 Aug 20:17 | `RevokeSecurityGroupEgress` | **root** | same |
| 3 Aug 20:26 | Environment health → `No Data` | — | — |

Both rule sets were emptied, leaving `Ingress: []` and `Egress: []`.

An EC2 instance with no egress cannot reach anything outbound. For an Elastic
Beanstalk instance that means it cannot:

- download the platform bootstrap script from
  `elasticbeanstalk-platform-assets-us-east-2.s3.amazonaws.com` (so a fresh
  instance never installs or starts the application),
- connect to RDS,
- report health to the EB service, or
- receive commands — the agent polls **outbound**, which is why
  `restartAppServer` and deployments timed out rather than failing fast.

Console output from the replacement instance shows it plainly:

```
curl: (28) Failed to connect to elasticbeanstalk-platform-assets-us-east-2...
       port 443 after 133144 ms: Could not connect to server
SSM Agent unable to acquire credentials: dial tcp 3.146.12.87:443: i/o timeout
```

The timing coincides with work to take the public site offline ahead of launch.
The most likely explanation is that someone took the application down by hand at
the security-group level while the holding page was being deployed.

## Correction to the original diagnosis

The first version of this document concluded the root volume had filled up,
citing the 7 July incident as precedent. **That was wrong**, and it was stated
with more confidence than the evidence supported.

What was actually observed — instance `running`, EC2 status checks passing, CPU
idle, agent silent, commands timing out — is equally consistent with a disk
problem and with a network problem, and networking was never checked. The disk
theory also failed to explain why a **brand-new** instance behaved identically;
that should have prompted a rethink much sooner.

Consequence: instance `i-01feab20f1dd94d62` was terminated on 7 Aug on the
assumption it was corrupt. It was healthy. The termination was harmless — no
state lives on these instances — but it was unnecessary, and the outage would
have been resolved on 3 Aug by inspecting the security group.

**Lesson: when an instance is up but unreachable *and* cannot reach out,
check security groups, routes and NACLs before concluding the host is broken.**

## Resolution

Restored on 7 Aug with tighter ingress than the original:

```bash
# egress — AWS default, required for bootstrap, RDS, CloudWatch
aws ec2 authorize-security-group-egress --group-id sg-0a054e1e18acfa9ed \
  --region us-east-2 \
  --ip-permissions 'IpProtocol=-1,IpRanges=[{CidrIp=0.0.0.0/0}]'

# ingress — port 80 from CloudFront edge locations only, not 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-0a054e1e18acfa9ed \
  --region us-east-2 \
  --ip-permissions 'IpProtocol=tcp,FromPort=80,ToPort=80,PrefixListIds=[{PrefixListId=pl-b6a144df}]'
```

`pl-b6a144df` is the AWS-managed `com.amazonaws.global.cloudfront.origin-facing`
prefix list. The instance is no longer reachable directly on
`3.147.198.231` — traffic must arrive through CloudFront, so the holding page
cannot be bypassed by hitting the origin IP.

## Follow-up

1. **Stop using the root account for day-to-day changes.** Both revokes were
   made as root. Root should be locked away with MFA and used only for the
   handful of tasks that require it; routine work belongs to an IAM user.
2. **Add a CloudWatch alarm** on `EnvironmentHealth` for the EB environment so a
   silent environment raises an alert rather than being discovered days later.
3. **Consider AWS Config** with a rule that flags a security group losing all
   egress — this failure mode is otherwise invisible until something breaks.
4. The RDS security group (`energybm-rds-sg`) still allows `0.0.0.0/0` on 5432.
   That is a long-standing issue, unrelated to this incident, and worth closing:
   restrict it to the EB instance security group.
