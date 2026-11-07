# CLI and programmatic API

## CLI

```sh
npx dkcutter@latest <template> [options] [--variable value ...]
```

Any runner works (`pnpm dlx`, `yarn dlx`, `bunx`); the runner determines `dkcutter.pkgManager` and whether Node or Bun runs the hooks.

### Template sources

| Form                                  | Example                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| GitHub / GitLab / Bitbucket shorthand | `gh:user/repo`, `gl:user/repo`, `bb:user/repo`                     |
| Any git URL                           | `https://github.com/user/repo.git`, `git@github.com:user/repo.git` |
| Local directory                       | `./my-template`, `.`                                               |

### Options

| Flag                            | Description                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `-y, --default`                 | Don't prompt; use defaults plus any values passed as flags.                            |
| `-o, --output <path>`           | Parent directory for the generated project (default: cwd). Must already exist.         |
| `-d, --directory <path>`        | Subdirectory of the repo that contains `dkcutter.json` (repos with several templates). |
| `-c, --checkout <ref>`          | Branch, tag, or commit to check out after cloning.                                     |
| `-f, --overwrite`               | Replace the output folder if it already exists (otherwise generation fails).           |
| `-k, --keep-project-on-failure` | Keep the partially generated folder when something fails (useful for debugging hooks). |
| `-h, --help`, `-v, --version`   | Help / version.                                                                        |

`dkcutter init` generates a starter template (`dkcutter.json`, `hooks/`, `template/`) in the current directory.

### Passing answers as flags

Every public variable becomes a flag with the same name:

```sh
npx dkcutter@latest gh:user/repo -y \
  --projectName "My App" \
  --useTypescript false \
  --database sqlite \
  --tools eslint,vitest
```

- Booleans: `--flag true|false` (a bare `--flag` means `true`).
- Multiselect: comma-separated list.
- Values are validated against `choices`/`validateRegex`; a variable whose `disabled` condition is true keeps its default.
- Flags only skip the prompts they answer; add `-y` for fully non-interactive runs (CI, scripts, agents).

When running DKCutter yourself on behalf of a user, prefer `-y` with explicit flags: interactive prompts can't be answered from a non-TTY shell.

## Programmatic API

```ts
import { dkcutter } from "dkcutter";

const context = await dkcutter({
  template: "gh:user/repo", // same forms as the CLI
  extraContext: {
    // answers; skips those prompts
    projectName: "My App",
    useTypescript: true,
    tools: ["eslint", "vitest"],
  },
  options: {
    default: true, // -y
    output: "./apps", // -o
    directory: undefined, // -d
    checkout: "v2.0.0", // -c
    overwrite: false, // -f
    keepProjectOnFailure: false, // -k
  },
});
// `context` holds the final resolved variables.
```

### Errors

Since v7 `dkcutter()` throws instead of calling `process.exit`. DKCutter's own errors extend `DKCutterError` and are exported from `"dkcutter"`:

| Error                  | When                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ConfigError`          | `dkcutter.json` missing or invalid (`error.zodError` has details).                                                                                           |
| `TemplateError`        | Template not found / couldn't be cloned / no `{{dkcutter.*}}` wrapper dir.                                                                                   |
| `ValidationError`      | A value (answer, flag, `extraContext`, or derived default) is not a valid choice, doesn't match `validateRegex`, or is empty (`error.zodError` has details). |
| `EngineError`          | `_dkcutter.engines` not satisfied.                                                                                                                           |
| `HookExecutionError`   | A hook threw or exited with a non-zero code.                                                                                                                 |
| `RenderError`          | A template file failed to render (usually a Nunjucks syntax error or stray `{{`).                                                                            |
| `PromptCancelledError` | The user pressed Ctrl+C during prompts.                                                                                                                      |

On DKCutter v7.0.1 and earlier, an invalid answer surfaced as a plain `ZodError` from `zod` instead of a `ValidationError`.

```ts
import { dkcutter, DKCutterError, PromptCancelledError } from "dkcutter";

try {
  await dkcutter({ template: "./my-template" });
} catch (error) {
  if (error instanceof PromptCancelledError) process.exitCode = 0;
  else if (error instanceof DKCutterError) console.error(error.message);
  else throw error;
}
```

## Troubleshooting

| Symptom                          | Likely cause                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `No template project found`      | No `{{dkcutter.<var>}}` directory directly under `template/`.                            |
| `Project already exists at …`    | Output folder exists; use `-f` or another `-o`.                                          |
| `RenderError … unexpected token` | Literal `{{`/`{%` in a file; use `{% raw %}` or `copyWithoutRender`.                     |
| `&#39;` / `&amp;` in output      | Autoescape; use the `safe` filter, or `dump` + `safe` for string literals.               |
| Derived default is empty         | `dkcutter.var` used inside `dkcutter.json`, or variable declared after the one using it. |
| `Cannot find module` in a hook   | Hooks can only import DKCutter's bundled libraries and relative files.                   |
