# Hooks

Hooks are JS/TS scripts in the template's `hooks/` folder that run during generation.

| File                           | Runs                                          | Typical use                                                        |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------------------ |
| `hooks/preGenProject.{ts,js}`  | After prompts, before `template/` is rendered | Validate answers, compute extra context with `dkcutter.add`        |
| `hooks/postGenProject.{ts,js}` | After all files are written                   | Delete optional files, edit `package.json`, init git, install deps |

## Contents

- [Lifecycle](#lifecycle)
- [Recommended pattern](#recommended-pattern)
- [Removing optional files](#removing-optional-files)
- [`dkcutter/utils`](#dkcutterutils)
- [Libraries available at hook runtime](#libraries-available-at-hook-runtime)

## Lifecycle

1. The entire `hooks/` folder (including helper files and nested folders) is rendered with Nunjucks into a temporary directory. All `{{ … }}` are resolved **now**, before any hook code runs. `preGenProject` files are rendered first, so `dkcutter.add`/`update` calls made in them affect everything rendered later.
2. The empty output folder is created and `preGenProject` runs with that folder as `cwd`.
3. `template/` is rendered into the output folder.
4. `postGenProject` runs with the **generated project root as `cwd`**, so relative paths like `"README.md"` point into the new project.

Hooks run with Node + [tsx](https://tsx.is) (TypeScript works without configuration; top-level `await` is supported) or with Bun when DKCutter was started through Bun. They can import each other with relative paths (`./utils/pkg`). They resolve packages from DKCutter's own installation, not from the generated project, so only the libraries listed below can be imported.

If a hook throws or exits with a non-zero code, generation stops and the output folder is deleted (unless `--keep-project-on-failure`). Exit early on invalid input with a clear message:

```ts
// hooks/preGenProject.ts
const slug = "{{ dkcutter.projectSlug }}";
if (!/^[a-z][\da-z-]*$/.test(slug)) {
  console.error(`"${slug}" is not a valid package name.`);
  process.exit(1);
}
```

Hook files are rendered like template files, so the same caveats apply: autoescape (use `| dump | safe` for strings that may contain quotes), and literal `{{`/`{%` must be wrapped in `{% raw %}`.

## Recommended pattern

Collect the answers into one typed object at the top, converting booleans and arrays, then write normal TypeScript below it. This keeps Nunjucks out of the logic and makes the hook readable and type-checkable.

```njk
// hooks/postGenProject.ts
import { logger, readJsonFile, remove, writeJsonFile } from "dkcutter/utils";

type Database = "postgres" | "sqlite" | "none";

interface Context {
  projectName: string;
  useTypescript: boolean;
  database: Database;
  tools: string[];
}

const toBool = (value: string) => value === "true";

const ctx: Context = {
  projectName: {{ dkcutter.projectName | dump | safe }},
  useTypescript: toBool("{{ dkcutter.useTypescript }}"),
  database: "{{ dkcutter.database }}" as Database,
  tools: {{ dkcutter.tools | dump | safe }},
};

async function main() {
  if (ctx.database === "none") {
    await remove("src/db");
    await remove("docker-compose.yml");
  }

  if (!ctx.tools.includes("vitest")) {
    await remove("vitest.config.ts");
    const pkg = await readJsonFile<{ scripts: Record<string, string> }>("package.json");
    delete pkg.scripts.test;
    await writeJsonFile("package.json", pkg, { spaces: 2 });
  }

  logger.success(`${ctx.projectName} is ready!`);
}

await main();
```

`| dump | safe` emits valid JS literals for strings and arrays (`"Tom's"`, `["eslint","vitest"]`). Booleans interpolate as `true`/`false`, which `toBool` makes explicit (writing `{{ dkcutter.useTypescript }}` bare also works but the file stops being valid TS before rendering).

## Removing optional files

Because file names cannot render to nothing, optional files are always shipped and pruned in `postGenProject`. A table keeps this easy to maintain:

```ts
import { remove } from "dkcutter/utils";

const optional: Array<[enabled: boolean, paths: string[]]> = [
  [ctx.database !== "none", ["src/db", "drizzle.config.ts"]],
  [ctx.tools.includes("eslint"), ["eslint.config.js"]],
  [ctx.useDocker, ["Dockerfile", ".dockerignore"]],
];

for (const [enabled, paths] of optional) {
  if (!enabled) await Promise.all(paths.map((p) => remove(p)));
}
```

Also remove the matching dependencies/scripts from `package.json` (or wrap them in `{% if %}` in the template).

## `dkcutter/utils`

```ts
import { logger, pathExists, remove, spinner } from "dkcutter/utils";
```

| Export                                                          | Description                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `logger.info/success/warn/error(...data)`, `logger.break()`     | Styled output consistent with the CLI.                                          |
| `colorize(type, data)`                                          | Returns a colored string; `type` is `"info" \| "success" \| "warn" \| "error"`. |
| `spinner.start(msg)` / `spinner.stop(msg?)`                     | `@clack/prompts` spinner.                                                       |
| `pathExists(path)`                                              | `Promise<boolean>`.                                                             |
| `copy(src, dest, options?)`                                     | Recursive copy.                                                                 |
| `remove(path, options?)`                                        | Recursive, forced delete (no error if missing).                                 |
| `mkdir(path, options?)`                                         | Recursive mkdir.                                                                |
| `emptyDir(path)`                                                | Empties a directory, creating it if needed.                                     |
| `rename(from, to)`                                              | Rename/move, with copy+delete fallback across devices.                          |
| `readJsonFile<T>(path)` / `writeJsonFile(path, data, options?)` | JSON helpers.                                                                   |
| `getPackageInfo(dir)`                                           | `Promise<{ packageJson, packageJsonPath }>` for `dir/package.json`.             |
| `getUserPkgManager()`                                           | `"npm" \| "pnpm" \| "yarn" \| "bun"`.                                           |
| `capitalize(str)`, `generateRandomString(length)`               | String helpers (e.g. for secrets in `.env`).                                    |

All file helpers are async; v7 removed the sync variants.

## Libraries available at hook runtime

Bundled with DKCutter, importable without installation: `@clack/prompts` (extra prompts), `ansis` (colors), `cac`, `isbinaryfile`, `lilconfig`, `nunjucks`, `semver`, `tinyexec` (run commands), `tinyglobby` (globs), `tsx`, `zod`, plus Node built-ins.

Running a command in the new project:

```ts
import { getUserPkgManager, spinner } from "dkcutter/utils";
import { x } from "tinyexec";

const pm = getUserPkgManager();
spinner.start(`Installing dependencies with ${pm}...`);
await x(pm, ["install"], { throwOnError: true });
spinner.stop("Dependencies installed.");
```

Make long-running or networked steps (installs, `git init`) optional via a confirm prompt, so generation still works offline and in CI.
