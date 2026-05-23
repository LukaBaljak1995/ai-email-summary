# Local Setup Guide

This project is now configured for local/private use only. Keep real secrets in local env files and do not commit them.

## Prerequisites

- Node.js 20.11.1
- A Supabase project
- Gmail OAuth credentials with a refresh token
- An OpenAI API key

## Env Files

The repo already ignores `.env` and `.env.local`, so those secrets stay out of git.

Backend:

```bash
cd backend
cp .env.example .env
```

Make sure the terminal you use for `npm install` and `npm run dev` is on Node `20.11.1` or newer.

Frontend:

```bash
cd frontend
cp .env.local.example .env.local
```

Set these values in `backend/.env`:

```env
OPENAI_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Set the frontend env too in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## Supabase Table

Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. That creates the `daily_summaries` table used by the backend.

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:8080`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

This starts the UI on `http://localhost:3000`.

## Notes

- The backend now writes summaries to Supabase instead of Firestore.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in `backend/.env`.
- `NEXT_PUBLIC_API_BASE` is safe for a local URL, but anything prefixed with `NEXT_PUBLIC_` should never contain secrets.
