<!-- @format -->

# YKS Study Tracker

Production-ready SaaS scaffold for a premium YKS study management app.

## Stack

- Frontend: Next.js App Router + React + TypeScript
- Backend: NestJS + TypeScript
- Shared: Common domain types for frontend and backend
- Database: Prisma schema foundation for PostgreSQL

## Milestone 1

This milestone establishes the project structure, docs, design-system foundations, routing skeleton, authentication foundation, the initial database model set, and placeholder screens backed by mock data.

## Current State

- Frontend: Next.js app shell with dashboard, auth, and placeholder routes.
- Backend: NestJS foundation with health, auth, current-user, and password reset endpoints.
- Data: Prisma schema, initial migration, and seeded baseline data for the core YKS entities.
- Validation: Workspace dependencies installed, database migration and seed verified, and both production builds pass.

## Run (after installing dependencies)

- `npm run dev:web`
- `npm run dev:api`
- `npm run db:migrate:deploy`
- `npm run db:seed`
