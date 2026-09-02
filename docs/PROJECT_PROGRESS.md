<!-- @format -->

# PROJECT_PROGRESS

## Project Overview

YKS Study Tracker is a production-ready SaaS scaffold for students preparing for the Turkish University Entrance Exam. The initial milestone focuses on platform architecture, design-system foundations, routing, authentication foundations, and data modeling.

## Current Version

`v0.1.0`

## Last Updated

2026-07-28

## Completed Features

- Created the monorepo foundation.
- Defined the clean-architecture folder strategy.
- Added the documentation system required for long-running development.
- Established the initial Prisma schema for core study, social, planner, and analytics entities.
- Added the first Prisma migration and validated it against a fresh Postgres cluster.
- Seeded the official YKS syllabus plus a demo profile and baseline study activity.
- Created shared domain types for frontend and backend alignment.
- Built the Next.js frontend shell with responsive routes, premium typography, reusable UI primitives, mock data, and placeholder screens.
- Built the NestJS backend shell with health, auth, and current-user foundation endpoints.
- Added runtime database health checks and graceful startup failure when the database is unavailable.
- Added a shared design-system baseline through CSS variables and layout primitives.
- Resolved the initial TypeScript configuration deprecation warning.
- Installed workspace dependencies and verified production builds for both web and API packages.
- Switched the API development runner to `tsx watch` so the backend launches directly from source.
- Wired the auth forms to the mock backend and confirmed create-account and sign-in redirect to the dashboard.
- Added a dashboard session guard so protected routes redirect unauthenticated users back to login.
- Added a root `npm run dev` launcher so both services can start from a single command.
- Migrated the auth flow toward HTTP-only cookie sessions and Prisma-backed accounts/sessions.
- Hardened the auth session flow with remember-me aware refresh lifetimes, refresh-token versioning, and SHA-256 token digests.
- Replaced the mock `/api/users/me` response with live session-backed user lookup.
- Added a real auth integration test that runs against embedded Postgres.
- Implemented password reset request and confirmation endpoints with token persistence and session revocation.
- Completed Epic 3 - Onboarding (Prisma persistence, SaveOnboarding DTO validation, aligned `@Put()` API endpoint, multi-step `OnboardingForm` with preferred study time selection, and layout-level routing `AppGuard`).
- Completed Epic 4 - Curriculum Foundation (stable slugs and deterministic UUID v5 keys for Subject, Topic, Subtopic; split seed scripts; cached `CurriculumService` backend layer).
- Completed Epic 5 - Study Tracking (Study Sessions manual/active timing, Question Logs with difficulty level and correct/wrong stats, Wrong Question revision queues, and Dynamic progress aggregates).
- Completed Epic 6 - Planner & Mock Exams (StudyPlan/StudyTask/RevisionTask models, goals progress/streak calculators, TYT/AYT mock logging, and analytics foundation endpoints).
- Completed Epic 7 - Dashboard (11 live data widgets, responsive grid layout, Recharts visualizations, study streak tracker, weekly/monthly progress calculations, subject performance analysis, mock exam trends, revision queue preview, planner tasks, recent sessions, welcome card with target info and countdown, AI placeholder for future integrations).
- Completed Epic 8 - AI Coach (OpenRouter integration with provider abstraction, analytics payload aggregation from existing services, daily/weekly/chat AI endpoints, frontend AI Coach card component, error handling, and proper environment variable configuration).

## Current Feature Being Worked On

Epic 9: Social & Integrations.

## Pending Features

- Comprehensive testing of AI Coach endpoints with real OpenRouter API key.
- Add caching layer for AI recommendations (30-60 min TTL).
- Add rate limiting to protect AI endpoints.
- Add email verification endpoints.
- Add Google OAuth and Apple Sign-In provider callbacks.
- Continue development on Epic 9 - Social & Integrations (friends, notifications, Spotify).
- Expand integration coverage for the remaining product domains.
- Continue deployment hardening and environment configuration.

## Recently Completed Work

- Finished Epic 8 - AI Coach (OpenRouter integration with provider abstraction, analytics payload builder, AI service with recommendations/weekly-summary/chat endpoints, AI controller, frontend AI Coach card component, error handling, and environment variable configuration).
- Finished Epic 7 - Dashboard (live data widgets, study streaks, weekly summaries, goal progress bars, subject performance radar, mock exam trends, revision queue, planner preview, recent sessions, welcome card, AI placeholder).
- Finished Epic 6 - Planner & Mock Exams (calendar views, mock statistics, goals streaks, and unified analytics foundation).
- Finished Epic 5 - Study Tracking (manual/active study loggers, spaced repetition revision notebook, curriculum progress bars).
- Finished Epic 4 - Curriculum Foundation (stable database models, split seeds module, caching service layer, double seed checks).
- Finished Epic 3 - Onboarding (complete persistence, validation, API, frontend page rendering, and AppGuard routing integration).
- Empty workspace converted into a documented SaaS scaffold.
- Frontend layout, routes, and visual system were implemented.
- Backend foundation endpoints were added.
- Prisma migrations and seed data were created and applied successfully in a fresh local Postgres instance.
- Database startup validation now fails fast when the database is unavailable.
- TypeScript config warnings were fixed.
- Frontend and backend production builds completed successfully.
- Auth sessions now rotate safely and the current-user endpoint is backed by live session state.
- Password reset is now implemented end to end for request and confirmation flows.

## Modified Files

- `package.json`
- `tsconfig.base.json`
- `.gitignore`
- `README.md`
- `BACKLOG.md`
- `docs/PROJECT_PROGRESS.md`
- `docs/CHANGELOG.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_DOCUMENTATION.md`
- `docs/KNOWN_ISSUES.md`
- `apps/web/package.json`
- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/tsconfig.json`
- `apps/web/app/page.tsx`
- `apps/web/components/layout/*`
- `apps/web/components/ui/*`
- `apps/web/components/dashboard/*`
- `apps/web/lib/*`
- `apps/web/app/(auth)/*`
- `apps/web/app/(app)/*`
- `apps/web/lib/auth.ts`
- `apps/api/package.json`
- `apps/api/src/*`
- `apps/api/tsconfig.json`
- `apps/api/tests/*`
- `apps/web/middleware.ts`
- `packages/shared/package.json`
- `packages/shared/src/*`
- `packages/database/package.json`
- `packages/database/src/*`
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/20260727000000_init/migration.sql`
- `packages/database/prisma/migrations/20260727000100_auth_session_remember_me/migration.sql`
- `packages/database/prisma/migrations/20260727000200_auth_session_refresh_version/migration.sql`
- `packages/database/prisma/seed.ts`
- `packages/database/prisma/seed-data.ts`
- `packages/database/src/health.ts`

## Newly Created Files

- Frontend shell files under `apps/web`.
- Backend shell files under `apps/api`.
- Shared domain model files under `packages/shared`.
- Prisma schema under `packages/database/prisma/schema.prisma`.
- Prisma migration under `packages/database/prisma/migrations/20260727000000_init/migration.sql`.
- Prisma seed data and seed runner under `packages/database/prisma/seed-data.ts` and `packages/database/prisma/seed.ts`.
- Database health helper under `packages/database/src/health.ts`.
- Root backlog at `BACKLOG.md`.
- Dashboard components: `StudyStreakWidget.tsx` (new for Epic 7)
- AI module files (Epic 8):
  - `apps/api/src/modules/ai/providers/ai.provider.ts` - Provider interface abstraction
  - `apps/api/src/modules/ai/providers/openrouter.provider.ts` - OpenRouter implementation
  - `apps/api/src/modules/ai/builders/prompt.builder.ts` - Prompt templates and analytics payload builder
  - `apps/api/src/modules/ai/ai.service.ts` - AI service with recommendations/chat endpoints
  - `apps/api/src/modules/ai/ai.controller.ts` - REST endpoints for AI features
  - `apps/api/src/modules/ai/ai.module.ts` - NestJS module registration
  - `apps/web/lib/ai.ts` - Frontend AI fetcher library
  - Updated: `apps/web/components/dashboard/AIPlaceholderCard.tsx` - Live AI Coach card (was placeholder)

## Deleted Files

- None.

## Database Changes

- Added the first-pass Prisma model set for users, profiles, study tracking, question logs, wrong questions, mock exams, planner items, social relationships, Spotify connections, and AI insights.
- Added auth persistence models for sessions, OAuth accounts, password reset tokens, and email verification tokens.
- Added `rememberMe` and `refreshTokenVersion` fields to auth sessions so refresh rotation is deterministic.
- Added relation indexes for study session history, question logging, wrong-question lookups, mock exam results, and friendship queues.
- Seeded the official syllabus hierarchy, a demo student profile, and baseline activity records.

## API Changes

- Added scaffolded foundation endpoints for health, auth, and current-user lookup under the `/api` prefix.
- Updated the API dev script to avoid the missing `dist/main` runtime path during development.
- Auth endpoints now set and clear HTTP-only cookies, rotate refresh tokens, and read the current user from live session state.
- `/api/users/me` now returns the authenticated user from the session cookie instead of a mock payload.
- API startup now verifies database connectivity before listening and `/api/health` reports database status.

## Dependencies Added

- Package manifests were created for the web, API, shared, and database workspaces.
- The root workspace now includes a `concurrently`-based dev command for web plus API startup.
- Local embedded-Postgres tooling was added for development-time database validation.

## Environment Variables Required

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`

## Known Bugs

- Placeholder product routes outside auth are still mock-driven.
- Most feature domains still need live API wiring and frontend state integration.

## Fixed Bugs

- Prisma schema validation now passes.
- Prisma migration deploy and seed execution now succeed on a fresh local Postgres instance.
- Refresh-cookie lifetime now matches the actual remember-me session length.
- Refresh token rotation now invalidates the previous refresh token.
- The users/me endpoint no longer returns hardcoded demo data.

## Technical Debt

- Authentication now persists via Prisma-backed users and sessions, but the broader product still needs end-to-end production hardening.
- The API dev runner is a development convenience; production builds still use the NestJS compiler pipeline.
- Remaining product work includes tests, logging, secure provider integrations, and live data wiring for the remaining product domains.

## Future Improvements

- Add real authentication flows and session persistence.
- Add analytics charts and social comparison views.
- Add Spotify OAuth and playback integration.
- Add live API data fetching and server actions.
- Add real OAuth provider flows and token refresh lifecycle management.

## Current Blockers

- None. Epic 7 - Dashboard is complete. Next: Email verification, Google/Apple OAuth, and Epic 8 - Analytics.

## Next Recommended Development Task

Complete Epic 8 - Analytics (trend analysis, streaks, insights engine). Then add email verification endpoints, Google OAuth and Apple Sign-In provider callbacks, and complete Epic 9 - Social & Integrations (friends, Spotify, notifications).

## AI Implementation Notes

- The architecture is intentionally split into web, api, shared, and database packages so the product can evolve into a maintainable SaaS without refactoring the whole repository later.
- Prisma is used as the initial schema contract because the app has many related entities and benefits from explicit relational modeling from day one.
- Mock data is deliberately used in the first milestone so the product can present a polished UX before the backend becomes feature-complete.
- The build step confirmed the current layout and route skeletons are production-compilable even before live data is connected.

## History

- 2026-07-27: Initialized the project, docs, shared models, and schema foundations.
- 2026-07-27: Verified the frontend and API run locally and the API health endpoint responds successfully.
- 2026-07-27: Confirmed create-account and sign-in both redirect into the dashboard with the mock auth backend.
- 2026-07-27: Migrated the auth layer to HTTP-only cookies and Prisma-backed session records.
