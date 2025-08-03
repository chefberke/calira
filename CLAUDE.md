# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development:**
- `bun dev` - Start all applications (web on :3001, server on :3000)
- `bun dev:web` - Start only Next.js frontend
- `bun dev:server` - Start only Hono backend

**Build and type checking:**
- `bun build` - Build all applications
- `bun check-types` - TypeScript type checking across monorepo

**Database operations:**
- `bun db:push` - Push schema changes to PostgreSQL database
- `bun db:studio` - Open Drizzle Studio for database management
- `bun db:generate` - Generate migrations from schema
- `bun db:migrate` - Run pending migrations

**Testing and linting:**
- `bun lint` - Run Next.js linting (web app only)

## Architecture Overview

This is a TypeScript monorepo using Turborepo with two main applications:

### Backend (`apps/server/`)
- **Framework:** Hono (lightweight server framework)
- **API:** tRPC for type-safe client-server communication
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better Auth with email/password
- **Runtime:** Bun with hot reloading
- **Build tool:** tsdown for compilation

**Key files:**
- `src/index.ts` - Hono server setup with CORS and tRPC integration
- `src/lib/trpc.ts` - tRPC router setup with protected procedures
- `src/lib/auth.ts` - Better Auth configuration
- `src/lib/context.ts` - tRPC context creation
- `src/routers/` - tRPC route definitions
- `drizzle.config.ts` - Database configuration

### Frontend (`apps/web/`)
- **Framework:** Next.js 15 with React 19
- **Styling:** TailwindCSS v4 with shadcn/ui components
- **Forms:** TanStack React Form
- **State management:** TanStack React Query for server state
- **Theming:** next-themes for dark/light mode
- **Build tool:** Next.js with Turbopack for dev

**Key directories:**
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (including shadcn/ui)
- `src/lib/` - Utilities and auth client setup
- `src/utils/trpc.ts` - tRPC client configuration

### Database Schema

The application uses a team-based task management system:

**Core entities:**
- `users` - User accounts with Better Auth integration
- `teams` - Teams with owners and descriptions
- `team_members` - Many-to-many relationship between users and teams
- `tasks` - Tasks assigned to team members with due dates and completion status
- `accounts`, `sessions`, `verificationTokens` - Better Auth tables

**Key relationships:**
- Users can own multiple teams and be members of multiple teams
- Tasks belong to teams and can be assigned to specific users
- Full relational setup with foreign keys and cascading deletes

## Configuration Notes

- Uses Bun as package manager and runtime
- TypeScript path aliases: `@/*` maps to `./src/*` in both apps
- Environment variables required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`
- PostgreSQL database with Drizzle migrations in `apps/server/src/db/migrations/`
- Composite TypeScript setup for monorepo type sharing

## Database Development

When making schema changes:
1. Modify schema files in `apps/server/src/db/schema/`
2. Run `bun db:generate` to create migrations
3. Run `bun db:push` or `bun db:migrate` to apply changes
4. Use `bun db:studio` to inspect database visually