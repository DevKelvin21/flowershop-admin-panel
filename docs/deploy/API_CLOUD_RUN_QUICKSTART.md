# API Cloud Run Quickstart

Last updated: 2026-02-16

This guide brings `/api` live on Cloud Run with GitHub Actions CD.

## 1) Set deployment constants

Replace these placeholders:

- `PROJECT_ID`: your GCP project id.
- `REGION`: Cloud Run + Artifact Registry region (example: `us-west2`).
- `REPOSITORY`: Artifact Registry Docker repo (example: `flowershop-api`).
- `SERVICE`: Cloud Run service name (example: `flowershop-api`).
- `RUNTIME_SA`: runtime service account email.
- `DEPLOYER_SA`: deployer service account email.
- `GITHUB_REPO`: `DevKelvin21/flowershop-admin-panel`.

## 2) Bootstrap GCP resources

```bash
gcloud config set project PROJECT_ID

gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com

gcloud artifacts repositories create REPOSITORY \
  --repository-format=docker \
  --location=REGION

gcloud iam service-accounts create flowershop-api-runtime \
  --display-name="Flowershop API runtime"

gcloud iam service-accounts create flowershop-api-deployer \
  --display-name="Flowershop API deployer"
```

Grant deployer permissions:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:DEPLOYER_SA" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:DEPLOYER_SA" \
  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding RUNTIME_SA \
  --member="serviceAccount:DEPLOYER_SA" \
  --role="roles/iam.serviceAccountUser"
```

## 3) Configure GitHub OIDC (Workload Identity Federation)

Create workload identity pool/provider (one-time). Then grant GitHub principal access:

```bash
gcloud iam service-accounts add-iam-policy-binding DEPLOYER_SA \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/attribute.repository/GITHUB_REPO" \
  --role="roles/iam.workloadIdentityUser"
```

Use the resulting provider resource path as:
- `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`

## 4) Add GitHub repository variables

Set these repository **Variables**:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `AR_REPOSITORY`
- `CLOUD_RUN_SERVICE`
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_DEPLOYER_SERVICE_ACCOUNT`
- `RUN_API_MIGRATIONS` (`false` initially)

## 5) Add GitHub repository secrets

Set these repository **Secrets**:

- `DATABASE_URL` (Neon pooled URL)
- `DIRECT_URL` (Neon direct URL)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (single line with escaped `\n`)
- `OPENAI_API_KEY` (optional)

## 6) First manual deploy (recommended)

Run once locally to validate runtime SA and env:

```bash
gcloud run deploy SERVICE \
  --project=PROJECT_ID \
  --region=REGION \
  --image=REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/flowershop-api:manual-test \
  --service-account=RUNTIME_SA \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production
```

Check health:

```bash
curl "https://<service-url>/api/v1/health"
```

## 7) Enable automated deploy

Workflow file:
- `/.github/workflows/deploy-api-cloud-run.yml`

Trigger:
- Push to `main` affecting `api/**`, or manual `workflow_dispatch`.

## 8) Optional migration automation

When ready, set:
- `RUN_API_MIGRATIONS=true`

The workflow will execute:
- `npx prisma migrate deploy`

before Cloud Run deployment.
