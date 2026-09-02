<!-- @format -->

# Deployment

This repository deploys as two services:

- Next.js frontend on Vercel.
- NestJS API on Render.
- PostgreSQL database on Supabase.

The repository includes `render.yaml` for the API service. The frontend uses the existing Next.js rewrite in `apps/web/next.config.mjs`; set `INTERNAL_API_URL` in Vercel to the public Render API URL so browser requests can remain same-origin.

## 1. Push the repository

Create or select the GitHub repository, then push the default branch:

```text
git remote add origin https://github.com/monishstark0909-dot/YKStarcker.git
git push -u origin main
```

Never commit `.env`. Use `.env.example` as the variable checklist.

## 2. Create Supabase PostgreSQL

Create a Supabase project and copy its pooled PostgreSQL connection string. Use it as `DATABASE_URL` with SSL enabled. The Prisma schema and migrations are under `packages/database/prisma`.

After the API service exists, apply migrations from a local terminal:

```text
$env:DATABASE_URL="your-supabase-connection-string"
npm run db:migrate:deploy
```

Seed only a development/demo database. Do not run the demo seed against a production database unless that is intentional:

```text
npm run db:seed
```

## 3. Deploy the API to Render

1. Open Render and choose **New > Blueprint**.
2. Select this GitHub repository.
3. Confirm `render.yaml`.
4. Add `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and optionally `OPENROUTER_API_KEY`.
5. Deploy and verify `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

Generate secrets with a password manager or a cryptographically secure generator. Access and refresh secrets must be different.

## 4. Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set the root directory to `apps/web`.
3. Keep the framework as Next.js.
4. Add `INTERNAL_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`.
5. Leave `NEXT_PUBLIC_API_URL` empty so the browser uses the same-origin `/api` rewrite.
6. Deploy and open the generated Vercel URL.

## 5. Verify the app

1. Open the frontend URL.
2. Register a test account.
3. Complete onboarding.
4. Confirm dashboard data loads.
5. Create a study session, question log, planner task, and mock exam.
6. Confirm those records reload after refreshing the page.
7. Confirm logout prevents access to protected pages.
8. Check Render logs for API/database errors.

## Production limitations

- Render Free services sleep when idle, so the first request can be slow.
- Supabase Free projects can pause after inactivity and should not be treated as a backup strategy.
- Email verification, Google OAuth, and Apple Sign-In remain intentionally disabled until provider credentials and mail transport are configured.
- Spotify and OpenRouter require their own provider credentials and quota management.
