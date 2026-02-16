# API Cloud Run Deployment Plan (GitHub Actions)

Last updated: 2026-02-16
Owner: Kelvin + Codex

## Scope
Deploy `/api` to Google Cloud Run and automate deployments from GitHub Actions to `main`.

## Goals
- Reliable and repeatable API deployments.
- No long-lived GCP JSON keys in GitHub (prefer Workload Identity Federation).
- Clear rollback and operational runbook.

## Baseline
- Backend already runs with `PORT` and serves `GET /api/v1/health`.
- No Dockerfile or Cloud Run workflow exists yet.
- Current docs are local-dev focused.

## Phase Status
| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Architecture Decisions | Pending | Region, service names, env split, auth mode |
| 1 | Containerization | Pending | Production Dockerfile + `.dockerignore` |
| 2 | GCP Bootstrap | Pending | APIs, Artifact Registry, service accounts, IAM |
| 3 | Manual Dry Run | Pending | First deploy from local `gcloud` |
| 4 | GitHub Actions CD | Pending | Push to `main` deploys Cloud Run service |
| 5 | Operations Hardening | Pending | Migrations, rollback, monitoring, alerting |

---

## Phase 0 - Architecture Decisions
### Tasks
- [ ] Decide deployment environments (start with `prod` only or `staging` + `prod`).
- [ ] Decide Cloud Run region (closest to users + DB region alignment).
- [ ] Decide ingress/auth model:
  - Public service + Firebase auth at API layer, or
  - Private service behind LB/IAP.
- [ ] Decide database target reachable from Cloud Run (Cloud SQL or external Postgres).
- [ ] Define naming convention:
  - Project ID
  - Artifact Registry repo
  - Cloud Run service name
  - Runtime/deployer service accounts

### Exit Criteria
- Single documented target topology for first deployment.

---

## Phase 1 - Containerization
### Tasks
- [ ] Add `/api/Dockerfile` (multi-stage build for NestJS production runtime).
- [ ] Add `/api/.dockerignore`.
- [ ] Ensure container startup uses `node dist/main` and honors injected `PORT`.
- [ ] Add image build command docs.

### Exit Criteria
- Local image builds and starts correctly with `docker run -e PORT=8080`.

---

## Phase 2 - GCP Bootstrap
### Tasks
- [ ] Enable APIs:
  - Cloud Run
  - Artifact Registry
  - IAM Credentials
  - Secret Manager
  - Cloud Build (if build/push in GCP)
- [ ] Create Artifact Registry Docker repo.
- [ ] Create runtime service account for Cloud Run service.
- [ ] Create deployer service account used by GitHub Actions.
- [ ] Grant deployer account required permissions (minimum):
  - `roles/run.admin`
  - `roles/artifactregistry.writer`
  - `roles/iam.serviceAccountUser` on runtime service account
- [ ] Configure Workload Identity Federation (GitHub OIDC) for repo-scoped trust.
- [ ] Grant `roles/iam.workloadIdentityUser` to the GitHub principalSet on deployer SA.

### Exit Criteria
- GitHub OIDC can impersonate deployer SA without JSON key.

---

## Phase 3 - Manual Dry Run
### Tasks
- [ ] Build and push image tag manually to Artifact Registry.
- [ ] Deploy via `gcloud run deploy` with explicit:
  - service
  - image
  - region
  - runtime SA
  - env vars / secrets
  - min/max instances
- [ ] Verify `/api/v1/health` from deployed URL.
- [ ] Document rollback command (`gcloud run services update-traffic ...`).

### Exit Criteria
- One successful manual production-equivalent deploy.

---

## Phase 4 - GitHub Actions CD
### Workflow Design
- Trigger: `push` to `main` with path filter on `api/**` and workflow file.
- Permissions: `contents: read`, `id-token: write`.
- Steps:
  1. `actions/checkout@v4`
  2. `google-github-actions/auth@v3` (WIF)
  3. Authenticate Docker to Artifact Registry
  4. Build + push image tagged by commit SHA
  5. `google-github-actions/deploy-cloudrun@v3`
  6. Optional smoke check against `${{ steps.deploy.outputs.url }}/api/v1/health`

### Required GitHub Secrets / Variables
- `GCP_PROJECT_ID` (var)
- `GCP_REGION` (var)
- `AR_REPOSITORY` (var)
- `CLOUD_RUN_SERVICE` (var)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` (secret or var)
- `GCP_DEPLOYER_SERVICE_ACCOUNT` (secret or var)
- App env vars/secrets referenced by deploy step (`DATABASE_URL`, Firebase admin creds, OpenAI key, etc.)

### Tasks
- [ ] Add `.github/workflows/deploy-api-cloud-run.yml`.
- [ ] Add environment protection rule for `production` (optional approval).
- [ ] Validate from a test commit to `main`.

### Exit Criteria
- Push to `main` deploys a new Cloud Run revision automatically.

---

## Phase 5 - Operations Hardening
### Tasks
- [ ] Define migration strategy for deploys (`prisma migrate deploy`) via:
  - pre-deploy job, or
  - Cloud Run Job executed by workflow.
- [ ] Configure monitoring:
  - log-based error alert
  - uptime check on `/api/v1/health`
- [ ] Add runbook for incident rollback and failed deploy recovery.
- [ ] Add budget alerts for Cloud Run, DB, and egress.

### Exit Criteria
- Deployment path is automated and operationally safe.

---

## Initial Recommended Rollout Order
1. Complete Phases 0-3 first.
2. Enable Phase 4 with deploy only on `main`.
3. Complete Phase 5 before high-traffic reliance.

---

## External References
- Cloud Run container runtime contract (`PORT`, listening requirements): https://cloud.google.com/run/docs/container-contract
- Cloud Run IAM deployment roles: https://cloud.google.com/run/docs/reference/iam/roles
- Google auth GitHub Action (`auth@v3`): https://github.com/google-github-actions/auth
- Cloud Run deploy GitHub Action (`deploy-cloudrun@v3`): https://github.com/google-github-actions/deploy-cloudrun
- Workload Identity Federation overview: https://docs.cloud.google.com/iam/docs/workload-identity-federation

---

## Phase Update Protocol
After each phase completion, append:

```md
### Phase X - <Name>
- Status: Completed | In Progress | Blocked
- Date: YYYY-MM-DD
- Summary:
  - ...
- Files changed:
  - /absolute/path/file1
- Validation:
  - command: result
- Risks / Follow-ups:
  - ...
```
