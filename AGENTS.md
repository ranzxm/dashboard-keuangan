# Repository Guidelines

## Project Structure & Module Organization

This repository is currently empty aside from this guide. As the application is introduced, keep runtime code under `src/`, tests under `tests/` or beside their modules as `*.test.ts`, and static assets under `public/`. Group code by feature rather than by technical layer when practical, for example `src/features/transactions/`. Keep modules small, cohesive, and single-purpose.

Before adding new logic, search for an existing implementation. Avoid speculative abstractions and duplicate utilities.

## Build, Test, and Development Commands

Use Bun as the package manager and JavaScript runtime. Define project commands in `package.json` before relying on them in documentation or automation. Expected commands are:

- `bun install` — install dependencies from the lockfile.
- `bun run dev` — start the local development server.
- `bun run build` — create a production build.
- `bun test` — run the test suite.
- `bun run lint` — run configured static checks.

After modifying JavaScript or TypeScript files, always run `bun test`. Ask for confirmation before adding a production dependency.

## Coding Style & Naming Conventions

Follow the formatter and linter configured in the repository. Until tooling is added, use two-space indentation, ESM syntax, and strict TypeScript. Use `camelCase` for variables and functions, `PascalCase` for components and types, and kebab-case for feature directories.

Prefer pure functions and immutable inputs. Use classes only for connectors or external-system interfaces. Make parameters explicit; do not use default parameters, mode flags, catch-all error handling, or silent fallbacks. Comments must be in English.

## Testing Guidelines

Favor smoke, integration, and end-to-end coverage over heavily mocked unit tests. Name tests `*.test.ts` or `*.test.tsx`. UI automation must target stable test or accessibility IDs, never visible text. Add only the minimum tests needed to demonstrate behavior.

## Commit & Pull Request Guidelines

No Git history is currently available to establish a project-specific convention. Use short, imperative commit subjects such as `Add transaction filters`. Keep commits focused.

Pull requests should explain the problem, summarize the solution, list verification commands, link relevant issues, and include screenshots for visible UI changes. Do not commit generated files, secrets, or unrelated formatting changes.
