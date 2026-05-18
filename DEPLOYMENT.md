# Deployment Guide

## Prerequisites

- Install Node.js 20 locally for both `frontend` and `backend`.
- Install the Google Cloud CLI: `gcloud`.
- Authenticate: `gcloud auth login`
- Set your project: `gcloud config set project YOUR_GCP_PROJECT_ID`
- Enable required services:

```bash
gcloud services enable cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:8080`.

### Frontend

Set the frontend API base to your local backend:

```bash
cd frontend
cp .env.local.example .env.local
```

Then set:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

Start the app:

```bash
npm install
npm run dev
```

## Deploy Backend To Google Cloud Functions

This backend is set up for a 2nd gen HTTP function with the exported entry point `api`.

Deploy it from the repo root:

```bash
gcloud functions deploy ai-email-summary-api \
  --gen2 \
  --runtime=nodejs20 \
  --region=europe-west1 \
  --source=backend \
  --entry-point=api \
  --trigger-http \
  --allow-unauthenticated
```

After deploy, note the HTTPS URL returned by GCP. You will use that as `NEXT_PUBLIC_API_BASE` for the frontend.

## Deploy Frontend To Google Cloud Run

This frontend is configured for container deployment with Next.js standalone output.

Deploy from the repo root:

```bash
gcloud run deploy ai-email-summary-frontend \
  --source=frontend \
  --region=europe-west1 \
  --allow-unauthenticated \
  --set-env-vars=NEXT_PUBLIC_API_BASE=YOUR_BACKEND_FUNCTION_URL
```

Replace `YOUR_BACKEND_FUNCTION_URL` with the backend function URL from the previous step.

Cloud Run will build the container from `frontend/Dockerfile` and expose the frontend publicly.

## Recommended Deployment Order

1. Deploy backend first.
2. Copy the backend URL.
3. Deploy frontend with `NEXT_PUBLIC_API_BASE` set to that backend URL.

## Notes

- The backend currently uses in-memory sample data. Any “mark as read” changes reset on cold start or redeploy.
- If you later connect the backend to a real database, you can keep the same deployment model.
- If your frontend needs stricter CORS, tighten the backend `cors()` configuration in `backend/index.ts`.
