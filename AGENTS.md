# Repository Guidelines

## Project Structure & Module Organization

Kuwang is a Next.js App Router application. Routes and API handlers live in `src/app/`; reusable UI is in `src/components/`; client providers are in `src/context/`; business calculations and validation are in `src/lib/`; PostgreSQL schema and repositories are in `src/db/`. Database migrations are versioned under `drizzle/`. Keep feature code small and colocated by responsibility.

## Build, Test, and Development Commands

- `bun install` — install dependencies.
- `bun run dev` — start the local Next.js server.
- `bun test` — run unit and PostgreSQL integration tests.
- `bun run lint` — run ESLint.
- `bun run build` — create the production build.
- `bun run db:generate` — generate a migration after schema changes.
- `bun run db:migrate` — apply pending migrations.
- `bun run db:studio` — inspect local database records.

Copy `.env.example` to `.env.local` and provide valid PostgreSQL and Better Auth settings before running database commands.

## Coding Style & Naming Conventions

Use strict TypeScript, ESM, and two-space indentation. Use `camelCase` for functions and variables, `PascalCase` for components and types, and kebab-case for feature directories. Prefer pure functions and immutable updates. Use classes only for external-system interfaces. Keep parameters explicit; avoid default parameters, mode flags, catch-all error handling, and silent fallbacks. Comments must be in English.

## Testing Guidelines

Name tests `*.test.ts` or `*.test.tsx`. Favor integration and end-to-end behavior over mocks. Database tests must isolate records by user and clean them up. Always run `bun test` after JavaScript or TypeScript changes, followed by lint and build checks for production-impacting work.

## Security & Data Rules

All finance queries must derive `userId` from the validated server session. Never accept ownership IDs from clients. Validate external input with Zod, keep secrets out of Git, use migrations for schema changes, and return sanitized API errors.

## Commit & Pull Request Guidelines

Use short imperative commit subjects, such as `Add database-backed budgets`. Pull requests should summarize behavior, migrations, verification commands, linked issues, and screenshots for UI changes. Do not commit generated build output or secrets.
