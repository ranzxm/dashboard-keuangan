# Kuwang

Kuwang is a personal finance dashboard for managing transactions, wallets, and monthly budgets. It provides authenticated, user-isolated financial data with a responsive interface and PostgreSQL persistence.

## Features

- Financial dashboard with balances, monthly cash flow, budget usage, and recent transactions
- Transaction CRUD with date, type, category, and wallet filters
- Wallet management with balances calculated from related transactions
- Monthly category budgets with usage indicators
- Soft delete with time-limited undo
- Email and password authentication
- System, light, and dark themes
- Responsive desktop and mobile layouts
- Health endpoint for deployment monitoring

## Technology

- Next.js 16 with App Router
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL
- Drizzle ORM and Drizzle Kit
- Better Auth
- Zod
- Bun

## Requirements

- Bun 1.3 or newer
- Node.js 22 or newer
- PostgreSQL 15 or newer

## Local Setup

Clone the repository and install dependencies:

```bash
bun install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configure the required values:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kuwang_dev
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:3000
```

Create the database, apply migrations, and start the application:

```bash
bun run db:migrate
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and sign in.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Create an optimized production build |
| `bun run start` | Start the production server |
| `bun test` | Run unit and PostgreSQL integration tests |
| `bun run lint` | Run ESLint |
| `bun run db:generate` | Generate migrations from schema changes |
| `bun run db:migrate` | Apply pending database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Project Structure

```text
src/
├── app/            # Pages, API routes, loading, and error boundaries
├── components/     # Reusable UI and feature components
├── context/        # Client finance and toast providers
├── db/             # PostgreSQL schema, connection, and repositories
├── lib/            # Auth, validation, calculations, and server utilities
└── types/          # Shared TypeScript models
drizzle/            # Versioned SQL migrations
tests/              # Shared test setup
```

## Data and Security

Finance records are scoped using the authenticated server session. Client-supplied ownership identifiers are not trusted. API input is validated with Zod, deletes are reversible soft deletes, authentication endpoints are rate-limited, and production responses include security headers.

Never commit `.env.local`. Use a strong unique `BETTER_AUTH_SECRET`, HTTPS, managed PostgreSQL backups, restricted database credentials, and environment-specific URLs in production.

## Database Changes

Modify `src/db/schema.ts`, then generate and review a migration:

```bash
bun run db:generate
bun run db:migrate
```

Commit schema changes and generated files under `drizzle/` together.

## Verification

Before opening a pull request or deploying:

```bash
bun test
bun run lint
bunx tsc --noEmit
bun run build
```

The health check is available at `GET /api/health` and returns HTTP `503` when PostgreSQL is unavailable.

## Production Checklist

- Set production `DATABASE_URL`, `BETTER_AUTH_URL`, and a rotated secret
- Apply migrations before serving traffic
- Enforce HTTPS
- Configure database backups and monitoring
- Monitor `/api/health`
- Run all verification commands

## License

No license has been specified. Add a license before distributing or accepting external contributions.
