# DKCutter

CLI that generates projects from templates (inspired by Cookiecutter), written in TypeScript. pnpm + Turborepo monorepo:

- `packages/dkcutter`: the published CLI/library (`dkcutter` on npm). Built with tsdown into `dist/` (entries: `index`, `cli`, `utils`).
- `apps/docs`: documentation site (Rspress), deployed at dkcutter.ncontiero.com. `apps/docs/docs/public/schema.json` is the JSON schema for `dkcutter.json`.
- `template/` + `dkcutter.json` (repo root): a minimal example template, handy for manual testing (`pnpm build:dkcutter && pnpm start .`).
- `skills/dkcutter`: agent skill describing how to author DKCutter templates.

## Commands

Run from the repo root (Turbo fans out to the workspaces):

- `pnpm build` / `pnpm build:dkcutter`: build everything / only the CLI.
- `pnpm dev`: watch mode.
- `pnpm test`: run Vitest in all packages.
- `pnpm typecheck`, `pnpm lint`, `pnpm lint:fix`.
- `pnpm check`: lint + typecheck + cspell + case-police (unknown words go in `project-words.txt`).

Single test file / test name (from `packages/dkcutter`):

```sh
pnpm vitest run test/helpers/getConfig.test.ts
pnpm vitest run -t "test name"
```

### Verification

Run before completing a task: `pnpm typecheck`, `pnpm lint:fix`, `pnpm test`.

## Architecture

The core flow lives in `dkcutter()` (`packages/dkcutter/src/index.ts`), which is both the public API and what the CLI (`src/cli/`, built with `cac`) calls:

1. **Resolve template**: a local directory is used in place; otherwise the string (URL, `gh:`/`gl:`/`bb:` prefixes, git/hg) is cloned by `helpers/getTemplate.ts` into the package's own `template/` folder (`PKG_TEMPLATE`).
2. **Load config**: `helpers/getConfig.ts` reads `dkcutter.json` via lilconfig and validates it with zod. The `_dkcutter` key holds DKCutter settings (`engines`, `ignore`, `copyWithoutRender`); other keys are template variables, and those starting with `_` are internal (never prompted).
3. **Validate engines**: semver checks against the dkcutter/node/bun versions.
4. **Build context**: `helpers/getContext.ts` + `helpers/prompts.ts` render each variable's default value with Nunjucks (variables can reference earlier ones) and prompt the user via `@clack/prompts` (skipped with `--default`). The context is registered as the global `dkcutter` in the shared Nunjucks `renderer` (`utils/renderer.ts`).
5. **Render**: the template folder must contain exactly one top-level entry matching `{{dkcutter.<var>}}`; that becomes the output project root. `helpers/structureRender.ts` renders file/dir names and contents with Nunjucks (binary files and `copyWithoutRender` globs are copied as-is; `ignore` globs are skipped).
6. **Hooks**: `helpers/hooks.ts` renders the template's `hooks/` folder (also through Nunjucks) into a temporary `<random>-rendered-hooks` dir, then runs `preGenProject` / `postGenProject` (`.js`/`.ts`, executed through `tsx` or bun) inside the generated project.
7. **Cleanup**: on failure the generated project is deleted unless `keepProjectOnFailure`; cloned templates and rendered hooks are always cleaned.

Path alias: `@/` → `packages/dkcutter/src/`.

## Code style

- **Async first**: use async/await and `node:fs/promises`. Never use synchronous I/O (e.g. `readFileSync`).
- **Errors**: throw the semantic errors from `helpers/errors.ts` (`DKCutterError`, `ConfigError`, `TemplateError`, `EngineError`, `HookExecutionError`, etc.) instead of calling `process.exit()`. Only `handleError` in the CLI entry exits.
- **Validation**: avoid `any`. Use `unknown` for opaque values and validate with `zod`.
- **CLI UI**: `@clack/prompts` for prompts/spinners, `ansis` for colors, `utils/logger.ts` for output.
- **File naming**: TS/JS files match their main export (`camelCase.ts` or `PascalCase.ts`); Markdown/MDX uses `kebab-case.md`.

## Testing

Vitest tests live in `packages/dkcutter/test/`, mirroring `src/` (`test/helpers/`, `test/utils/`). `test/integration.test.ts` runs `dkcutter()` against each `test/fixtures/<name>/input` (a full template with `dkcutter.json`, `template/`, optional `hooks/`) and compares the generated files with `test/fixtures/<name>/output/<project>`. To cover a new end-to-end behavior, add a fixture rather than mocking the pipeline.

## Changesets

Add a changeset when you change library behavior, fix a bug, or break a public API. Write it directly as a markdown file in `.changeset/` (do not run the interactive `pnpm changeset` CLI), with a descriptive name such as `patch-fix-spinner.md`:

```md
---
"dkcutter": minor
---

feat: add multi-select prompt support
```

Commits follow Conventional Commits (enforced by commitlint).
