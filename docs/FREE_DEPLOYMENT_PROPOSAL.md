<!-- @format -->

# Free deployment proposal for Zialn

## Summary

This app is a good fit for a low-cost deployment because:

- The frontend is a Next.js app.
- The backend is a NestJS API.
- The database is PostgreSQL via Prisma.
- Your expected usage is very small: about 3 users for 3–4 months.

That means a free-tier or low-cost setup is realistic without buying a VPS.

---

## What the app needs to run

### Frontend

- Location: [apps/web](../apps/web)
- Runtime: Next.js
- Build target: standard Vercel/Node hosting

### Backend

- Location: [apps/api](../apps/api)
- Runtime: NestJS
- Needs environment variables for JWT secrets and database access

### Database

- Location: [packages/database](../packages/database)
- Runtime: PostgreSQL
- Uses Prisma migrations

### Important environment variables

The app already expects these variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `WEB_ORIGIN`
- `NEXT_PUBLIC_API_URL`

Optional but useful:

- `OPENROUTER_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

---

## Recommended free architecture

### Best practical option for 0 cost

Use:

1. Vercel Free for the frontend
2. Render Free for the backend API
3. Neon Free for PostgreSQL

This is the easiest setup for a small project and should work well for a few months with 3 users.

### Why this fits your case

- Very low traffic
- No need for heavy compute
- No need for persistent custom infrastructure
- Easy to manage from GitHub
- Good enough for a prototype, internal demo, or small user base

---

## Architecture diagram

```mermaid
flowchart LR
    A[Users] --> B[Frontend on Vercel]
    B --> C[Backend API on Render]
    C --> D[PostgreSQL on Neon]
```

---

## Service breakdown

### 1) Frontend: Vercel Free

Use Vercel for the Next.js app.

Recommended setup:

- Connect GitHub repo
- Set root directory to the web app folder
- Build command: `npm run build`
- Output: default Next.js build

Environment variables:

- `NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com`

### 2) Backend: Render Free

Use Render for the NestJS backend.

Recommended setup:

- Create a Web Service
- Connect the same GitHub repo
- Root directory: `apps/api`
- Build command:
  - `npm install`
  - `npm run db:generate`
  - `npm run build:api`
- Start command:
  - `node dist/apps/api/src/main.js`

Environment variables:

- `NODE_ENV=production`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `WEB_ORIGIN=https://your-frontend-url.vercel.app`

### 3) Database: Neon Free

Use Neon for PostgreSQL.

Recommended setup:

- Create a free Neon project
- Copy the connection string
- Add it as `DATABASE_URL`
- Make sure the URL includes SSL settings if required by Neon

Example format:

- `postgresql://user:password@host/dbname?sslmode=require`

---

## Deployment steps

### Step 1: Prepare the repo

Make sure the code is committed and pushed to GitHub.

### Step 2: Create the database

- Create a Neon database
- Save the connection string

### Step 3: Deploy the backend first

- Deploy the NestJS API to Render
- Set the environment variables
- Wait for the service to start

### Step 4: Deploy the frontend

- Deploy the Next.js app to Vercel
- Set `NEXT_PUBLIC_API_URL` to the API URL

### Step 5: Run Prisma migrations

After deployment, run:

```bash
npx prisma migrate deploy
```

If the hosting platform supports it, run this as part of the deployment process.

### Step 6: Test login and signup

- Open the frontend URL
- Try register and login
- Verify that cookies and auth work correctly

---

## Expected free-tier behavior

This setup is suitable for your use case, but there are two important expectations:

### Pros

- No direct cost
- Good for a small internal tool
- Easy to maintain
- Enough for 3 users

### Cons

- Some free services may sleep after inactivity
- Cold starts can be a little slow
- You may need to restart or wake the API manually after a period of inactivity

For your stated usage, this should still be acceptable.

---

## If you want zero sleep and 24/7 uptime

If you want the app to stay online continuously without free-tier sleep behavior, the next best option is:

### Oracle Cloud Always Free

This is the best truly free persistent option.

You would host:

- the API on a free VM
- the database on a free VM or use Neon
- the frontend via Vercel or Cloudflare Pages

This is more setup work, but it is the most reliable free plan.

For your situation, I would still recommend:

- Vercel + Render + Neon for simplicity
- Oracle Cloud only if you want maximum uptime

---

## Recommended plan for you

### Best choice

Use:

- Vercel Free for frontend
- Render Free for backend
- Neon Free for database

### Why I recommend it

- It is the fastest path to a working deployment
- It fits your usage pattern
- It costs $0
- It is good for 3–4 months of lightweight use

---

## Important caveats before deployment

1. Make sure the frontend and backend URLs are configured correctly.
2. Set `WEB_ORIGIN` to the exact frontend domain.
3. Set `NEXT_PUBLIC_API_URL` to the backend domain.
4. In production, auth cookies should remain secure and same-site compatible.
5. If you do not need the AI or Spotify integrations immediately, leave them disabled until later.

---

## Final recommendation

For a small app with 3 users and a budget of $0, the best deployment path is:

- Frontend: Vercel Free
- API: Render Free
- Database: Neon Free

That gives you a workable, public deployment for a few months without paying anything.
