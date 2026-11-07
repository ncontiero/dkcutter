---
name: dkcutter
description: Create, edit, debug, and run DKCutter project templates (the Node.js/TypeScript Cookiecutter-style scaffolding CLI, `npx dkcutter`). Use whenever the user works with a `dkcutter.json` file, a `template/{{dkcutter.projectSlug}}/` folder, `preGenProject`/`postGenProject` hooks, `dkcutter/utils`, or wants to turn an existing project into a reusable DKCutter template, generate a project from one (e.g. `gh:user/repo`), or call `dkcutter()` programmatically — even if they only say "scaffold", "boilerplate", or "project generator" in a repo that uses DKCutter.
license: MIT
metadata:
  author: Nicolas Contiero
  version: "2026.11.06"
  homepage: https://dkcutter.ncontiero.com
---

# DKCutter

DKCutter generates projects from templates. A template is a directory (local or a git repo) containing a `dkcutter.json` that declares variables, a `template/` folder whose file names and contents are rendered with [Nunjucks](https://mozilla.github.io/nunjucks/templating.html), and optional JS/TS hooks. It targets DKCutter v7.0.2+ (Node.js ≥ 22.3); notes call out where older v7 releases differ.

## Template anatomy

```tree
my-template/
├── dkcutter.json                # variables + prompts (+ optional `_dkcutter` settings)
├── hooks/                       # optional; every file here is also rendered with Nunjucks
│   ├── preGenProject.ts
│   └── postGenProject.ts
└── template/
    └── {{dkcutter.projectSlug}}/  # exactly ONE top-level entry; it becomes the output folder
        ├── package.json
        └── src/index.{{ 'ts' if dkcutter.useTypescript else 'js' }}
```

The single wrapper directory under `template/` is required: DKCutter looks for the one entry whose name contains `{{dkcutter.<var>}}` and treats its rendered name as the generated project's root. Files placed directly in `template/` break generation. Pick a variable whose value is safe as a folder name (a slug, not a free-form name).

## The rule that causes most bugs: where each syntax works

| Location                                                                                         | How to reference a variable  | Notes                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Values inside `dkcutter.json` (defaults, `promptMessage`, `disabled`, choice `title`/`selected`) | `{{ projectName }}`          | Bare name. `{{ dkcutter.projectName }}` renders empty here (globals like `dkcutter.now` still work). Only variables declared **above** the current one are available. |
| File/dir names and file contents under `template/`                                               | `{{ dkcutter.projectName }}` | All variables, plus globals like `dkcutter.now`, `dkcutter.pkgManager`.                                                                                               |
| Files under `hooks/`                                                                             | `{{ dkcutter.projectName }}` | Rendered to a temp folder _before_ the hook runs; the hook then executes as plain JS/TS.                                                                              |

Other behaviors worth keeping in mind:

- **Autoescape is on.** `{{ dkcutter.projectName }}` turns `Tom's & Co` into `Tom&#39;s &amp; Co`. For code, JSON, YAML, etc. where the raw value matters, use `{{ dkcutter.projectName | safe }}`; inside a JS/JSON string literal prefer `{{ dkcutter.projectName | dump | safe }}` (emits a properly quoted JSON string). Values in `dkcutter.json`, prompt texts, and file/dir names are not escaped (since v7.0.2).
- **Literal `{{ }}` / `{% %}` in template files gets interpreted**, usually rendering silently to nothing (`${{ github.sha }}` → `$`). Watch for GitHub Actions workflows, Vue/Handlebars/Jinja files, Go templates. Wrap them in `{% raw %}…{% endraw %}` (not `{%- raw %}`) or list the files in `_dkcutter.copyWithoutRender`. Binary files are detected and copied automatically.
- **There are no conditional files by name.** A name that renders to an empty string fails. Ship the optional file and delete it in `postGenProject` based on the answers (see [references/hooks.md](references/hooks.md)).
- Booleans are real booleans in templates (`{% if dkcutter.useTypescript %}`) but become the strings `"true"`/`"false"` when interpolated into hook source.
- Multiselect answers are arrays: test membership with `{% if 'eslint' in dkcutter.tools %}`.

## Workflows

### Creating or converting a template

1. Start from the official skeleton (`npx dkcutter@latest init`) or create the anatomy above by hand.
2. Write `dkcutter.json` — see [references/configuration.md](references/configuration.md). Add `"$schema": "https://dkcutter.ncontiero.com/schema.json"`, use camelCase keys (they become `--camelCase` CLI flags), prefer the object form with a `promptMessage`, and derive values like slugs from earlier answers instead of asking twice.
3. Move the project files into `template/{{dkcutter.projectSlug}}/` and replace the hard-coded values with variables — see [references/templating.md](references/templating.md). When converting an existing project, grep for every occurrence of the original name/slug (package.json, README, imports, Docker files, CI) and exclude `node_modules`, build output, lock files, and `.git`.
4. Put logic that can't be expressed by rendering (removing optional files, editing `package.json`, running installs) in `hooks/postGenProject.ts` — see [references/hooks.md](references/hooks.md).
5. Test by generating into a throwaway folder with defaults, then with overrides that exercise each branch:

   ```sh
   npx dkcutter@latest ./my-template -y -o /tmp/dk-out -f
   npx dkcutter@latest ./my-template -y -o /tmp/dk-out -f --useTypescript false --tools eslint,vitest
   ```

   Inspect the output for leftover `{{`, HTML entities like `&#39;`, and files that should have been removed.

### Generating a project from a template

```sh
npx dkcutter@latest gh:user/repo            # also gl:, bb:, full git URLs, or a local path
npx dkcutter@latest gh:user/repo -y --projectName "My App"   # non-interactive
```

Flags and the programmatic `dkcutter()` API are in [references/cli-and-api.md](references/cli-and-api.md). Templates run arbitrary code through hooks: before generating from an unfamiliar remote template, read its `hooks/` folder and tell the user what it does.

## References

Read only what the task needs:

- [references/configuration.md](references/configuration.md) — every `dkcutter.json` feature: types, prompts, choices, multiselect, `validateRegex`, `disabled`, private `_vars`, `_dkcutter` (`engines`, `ignore`, `copyWithoutRender`).
- [references/templating.md](references/templating.md) — Nunjucks in names and contents, globals (`dkcutter.now`, `pkgManager`, `colors`, `add`/`update`), filters, escaping, whitespace control.
- [references/hooks.md](references/hooks.md) — hook lifecycle, typed context pattern, `dkcutter/utils`, libraries available at hook runtime, failure behavior.
- [references/cli-and-api.md](references/cli-and-api.md) — CLI flags, passing answers via flags, multi-template repos, `dkcutter()` options and exported error classes.

Official docs: <https://dkcutter.ncontiero.com>
