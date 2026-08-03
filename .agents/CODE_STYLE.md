# DKCutter Code Style & Best Practices

Coding standards and conventions for the DKCutter project.

## General Principles

- **Consistency**: Follow existing patterns.
- **Clarity**: Write readable code.
- **Maintainability**: Consider future developers.
- **Performance**: Be mindful of hot paths.

## Formatting

- Use ESLint.
- Comands `pnpm lint` and `pnpm lint:fix`.
- **Indentation**: Tabs.
- **Semicolons**: Use semicolons.
- **Quotes**: Double quotes.

## Naming Conventions

- **Types/Interfaces**: `PascalCase` (e.g., `CLIOptions`).
- **Functions**: `camelCase` (e.g., `getConfig`).
- **Variables**: `camelCase` (e.g., `options`).
- **Constants**: `SCREAMING_SNAKE_CASE` or `camelCase`.
- **Files**:
  - **TS/JS**: `camelCase.ts` or `PascalCase.ts` (match main export).
  - **MD/MDX**: `kebab-case.md` or `kebab-case.mdx`.

## Asynchronous First

- **Prefer Async/Await:** Use `async/await` for handling asynchronous.
- **Avoid Blocking Operations:** Minimize synchronous operations, especially in I/O-bound tasks.

## Native APIs

- **Use Native APIs:** Always use the native `node:fs/promises` API for file operations.

## Error Handling

- **Throw Semantic Errors:** Use and throw custom semantic errors (e.g., `DKCutterZodError`, `ConfigError`, `TemplateError`) rather than hard exiting the process.

## CLI Interactive UI

- **Spinners & Prompts:** Use `@clack/prompts` for spinners and terminal prompts.
- **Colors:** Use `ansis` for terminal coloring to maintain a consistent UI aesthetic.

## TypeScript Strictness

- Follow the existing TS strictness. Define clear interfaces/types for object arguments.
- Avoid using `any`; use `unknown` if a type is truly opaque, and validate it using `zod` where applicable.
- Don't ignore TypeScript errors.
- Don't use `@ts-ignore` without good reason.

## Testing

DKCutter uses [Vitest](https://vitest.dev/) as its testing framework. Tests are co-located in the `test/` folder of the `packages/dkcutter` workspace.
