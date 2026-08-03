# DKCutter

## Project overview

DKCutter is a powerful command-line project scaffolding utility. It allows users to create new projects from templates interactively, heavily inspired by Cookiecutter but built in TypeScript. It supports dynamic variables, hooks, and native VCS templates.

## Project architecture

- **Monorepo Structure:** We use a `pnpm` workspace.
- `packages/dkcutter`: The core CLI logic and implementation.
- `apps/docs`: The official documentation built with [Rspress](https://rspress.rs).

## Essential Commands

Always run these commands from the root directory after making code changes:

- `pnpm install` - Install dependencies (do NOT use npm/yarn).
- `pnpm build` - Build the project.
- `pnpm typecheck` - Run TypeScript compilation checks.
- `pnpm lint:fix` - Run ESLint and Prettier to automatically fix styling issues.
- `pnpm check:spell` - Check for spelling errors.
- `pnpm check:case` - Check for casing errors.
- `pnpm test` - Run the Vitest test suite.

## AI Instructions & Skills

Before writing code, please read the detailed code style guidelines:

- [Code Style Guidelines](./.agents/CODE_STYLE.md)
