<!-- @format -->

# ARCHITECTURE

## Repository Structure

- `apps/web` - Next.js frontend application.
- `apps/api` - NestJS backend application.
- `packages/shared` - Shared domain models and types.
- `packages/database` - Prisma schema and future database helpers.
- `docs` - Project progress, roadmap, schema, and implementation notes.

## Current Folder Shape

- `apps/web/app/(auth)` - Public authentication screens and layout.
- `apps/web/app/(app)` - Protected app shell, dashboard, and major study routes.
- `apps/web/components` - Reusable UI, layout, and dashboard components.
- `apps/web/lib` - Mock data and navigation configuration.
- `apps/api/src/modules` - NestJS domain modules for health, auth, and users in the first milestone.
- `apps/web/tsconfig.json` - Next.js workspace-specific TypeScript configuration.

## Auth Flow Implemented

- The register and login forms submit to the auth API with credentials included.
- The API stores session state in Prisma-backed tables, persists remember-me duration, and returns HTTP-only cookies.
- Refresh rotation now uses a session version counter and SHA-256 refresh-token digests so old tokens are rejected deterministically.
- `/api/users/me` and `/api/auth/me` both resolve the current user from live session state rather than mock payloads.
- The dashboard route verifies authentication through the session cookie and middleware.
- API startup performs a database connectivity check before the server listens, and the health endpoint reports the database status.

## State Management

- Frontend state will start with local component state and server-driven data placeholders.
- Shared domain contracts are defined in `packages/shared` to reduce drift between client and server.
- A dedicated client cache layer will be introduced once real API endpoints are wired.
- Dashboard and route screens currently render from local mock data until persistence is added.

## API Architecture

- The API currently exposes NestJS modules for health, auth, and users.
- Additional domain modules will be added for tracking, planning, social, integrations, and insights as the product grows.
- Authentication is designed around JWT access tokens and refresh tokens.
- Refresh tokens are rotated server-side and stored as SHA-256 digests with a per-session version counter.
- Social and integrations are isolated so third-party boundaries remain contained.
- The initial database migration and seed data are part of the development baseline and can be replayed on a fresh Postgres database.

## Database Architecture

- Prisma is the schema contract for the application.
- The initial model set is relational and supports one-to-many and many-to-many relationships required by study tracking and social features.
- A PostgreSQL database is assumed for production.
- The schema is captured in a first migration and seeded with a syllabus tree plus a demo development account for local validation.

## Authentication Flow

- Users will authenticate with email/password, Google, or Apple.
- Email/password authentication now uses secure HTTP-only cookies and Prisma-backed session persistence.
- Session persistence, refresh rotation, and logout revocation are implemented.
- Password reset, email verification, and OAuth provider callbacks are still pending external configuration.

## Navigation Flow

- Public routes cover landing, sign-in, registration, and reset-password screens.
- Protected routes cover onboarding, dashboard, study tracking, analytics, planner, friends, and settings.
- Mobile navigation will collapse into a compact bottom or drawer pattern in later UI work.

## Design System

- Typography uses `next/font` to establish a premium, product-grade type scale.
- Colors, spacing, radii, shadows, and surface treatments are centralized as CSS variables.
- Reusable UI primitives are built first so all screens share the same visual language.
- A glassy surface treatment is used sparingly to keep the interface premium without reducing readability.

## Third-Party Integrations

- Google OAuth.
- Apple Sign-In.
- Spotify OAuth and playback controls.
- Future AI services for study insights.

## Major Architectural Decisions

- Monorepo structure chosen to separate concerns cleanly while keeping shared contracts in one place.
- Prisma chosen to express the domain early and make the schema documentation actionable.
- Mock data is part of the first milestone so the UI can feel complete before backend features are ready.
- Dependency installation and build verification were performed early to catch config drift before feature work starts.
- Client-side session storage is a temporary bridge; it will be replaced by secure server-managed sessions in a later milestone.
- Auth now uses HTTP-only cookies; localStorage-based session handling has been removed.
