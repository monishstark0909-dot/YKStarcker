<!-- @format -->

# CHANGELOG

## v0.1.1 - 2026-07-27

Added:

- Refresh-token rotation now preserves remember-me session length and uses deterministic session versioning.
- `/api/users/me` now returns the live authenticated user instead of mock data.
- Auth integration coverage now runs against embedded Postgres and validates the refresh/logout lifecycle.

Changed:

- Refresh cookies now use the actual session lifetime instead of a hardcoded 30-day max age.
- Refresh tokens are stored as SHA-256 digests instead of bcrypt hashes.
- The auth service now shares the Nest-managed provider path instead of manually constructing the controller dependency.

Fixed:

- Old refresh tokens are rejected after rotation.
- The users/me endpoint no longer returns hardcoded placeholder data.
- Logout is idempotent and clears browser cookies even when the stored session is already revoked.

## v0.1.0 - 2026-07-27

Added:

- Initial monorepo scaffold.
- Project documentation system.
- Shared domain model foundation.
- Prisma schema foundation for the core YKS Study Tracker entities.
- Prisma migration foundation and seed data for the official syllabus plus a demo profile.
- Next.js frontend shell with responsive layout, premium typography, and placeholder screens.
- NestJS backend shell with health, auth, and current-user foundation endpoints.
- Mock data wiring for the dashboard and placeholder screens.
- Shared design-system foundation with global CSS tokens and reusable UI components.
- Workspace dependencies installed and production builds verified for both frontend and backend.

Changed:

- TypeScript config now includes the deprecation suppression needed by the current toolchain.
- CSS alignment values adjusted to avoid autoprefixer warnings.
- API development startup now succeeds without a `dist/main` runtime mismatch.
- Auth forms now call the mock backend and redirect to the dashboard after success.
- Dashboard route now checks for a stored session and redirects unauthenticated users to login.
- Root `npm run dev` now starts both the web and API services together.
- Auth flows now use HTTP-only cookies and Prisma-backed users/sessions instead of client-local storage.
- API startup now validates database connectivity and the health endpoint reports database status.
- Database schema now includes targeted indexes for study tracking, analytics, and social queues.

Fixed:

- Initial workspace-to-monorepo scaffolding completed without TypeScript errors.
- Frontend and backend typechecks now pass cleanly.
- Create-account and sign-in flows now complete end-to-end in the browser using the mock backend.
- Browser-authenticated navigation now survives route transitions through cookie-backed sessions.
- Prisma schema validation, migration deployment, and seed execution now succeed against a fresh local Postgres instance.
