# Templating

Everything under `template/` (and `hooks/`) is rendered with [Nunjucks](https://mozilla.github.io/nunjucks/templating.html), a Jinja2-like engine. File and directory **names** are rendered too.

## Contents

- [Context](#context)
- [File and directory names](#file-and-directory-names)
- [File contents](#file-contents)
- [Escaping and literal braces](#escaping-and-literal-braces)
- [Globals](#globals)
- [Filters](#filters)

## Context

In template files every variable is under `dkcutter`:

```txt
{{ dkcutter.projectName }}      string
{{ dkcutter.useTypescript }}    boolean
{{ dkcutter.tools }}            string[] (multiselect)
{{ dkcutter._packageName }}     private variable
```

(Inside `dkcutter.json` itself the variables are referenced by bare name instead; see configuration.md.)

## File and directory names

```tree
template/
└── {{dkcutter.projectSlug}}/
    ├── src/index.{{ 'ts' if dkcutter.useTypescript else 'js' }}
    └── {{ dkcutter.projectSlug }}.config.json
```

- Use an inline `if … else` to switch an extension or name.
- A name must not render to an empty string; to make a file or folder optional, include it and delete it from `postGenProject` (see hooks.md).
- Characters invalid on Windows (`< > : " | ? *`) can't appear in the template's file names either, so use single quotes inside `{{ }}` expressions in names, and make sure the rendered value is also safe (validate slugs with `validateRegex`).

## File contents

```njk
// package.json
{
  "name": "{{ dkcutter.projectSlug }}",
  "description": {{ dkcutter.description | dump | safe }},
  "scripts": {
    "dev": "vite"{% if 'vitest' in dkcutter.tools %},
    "test": "vitest"{% endif %}
  }
}
```

```md
{% if dkcutter.license == "MIT" -%}
Released under the MIT license.
{%- elif dkcutter.license == "Apache-2.0" -%}
Released under the Apache 2.0 license.
{%- endif %}
```

Tips:

- `{%-` / `-%}` trim whitespace and newlines around a tag; use them to avoid blank lines and broken JSON/YAML indentation.
- Loops: `{% for tool in dkcutter.tools %}{{ tool }}{% if not loop.last %}, {% endif %}{% endfor %}`.
- Trailing commas are the usual source of invalid generated JSON; put the comma inside the conditional block, as above.
- Generate once per branch and run the project's own linter/formatter/typecheck on the output.

## Escaping and literal braces

**Autoescape is enabled for file contents** (including hooks). Interpolated values are HTML-escaped: `'` → `&#39;`, `&` → `&amp;`, `<` → `&lt;`, `"` → `&quot;`.

- Raw value: `{{ dkcutter.projectName | safe }}`.
- As a quoted JS/JSON string literal: `{{ dkcutter.projectName | dump | safe }}` → `"Tom's & Co"` (handles quotes and backslashes correctly).
- Values the template itself constrains (slugs validated by `validateRegex`, choice values, booleans) are safe without `| safe`.
- File and directory names are not escaped (since v7.0.2), so `{{ dkcutter.projectName }}` in a name keeps `Bob's App` as-is.

**Literal `{{`, `{%`, `{#`** in a template file are parsed by Nunjucks. Usually they render **silently empty** (`run: ${{ github.sha }}` becomes `run: $`); sometimes they fail with a `RenderError`. Common sources: GitHub Actions (`${{ github.ref }}`), Vue/Angular/Handlebars/Jinja/Go templates, Helm charts. Either:

```njk
# .github/workflows/ci.yml
{% raw %}
    if: ${{ github.event_name == 'push' }}
{% endraw %}
```

Use the plain tags: the whitespace-trimming forms `{%- raw %}` / `{%- endraw %}` are not supported and break rendering. Alternatively add the files to `_dkcutter.copyWithoutRender` (simpler when the file needs no variables at all). `{% raw %}` also works in file names, e.g. a template that generates other DKCutter templates: `template/{{dkcutter.projectSlug}}/template/{% raw %}{{dkcutter.projectSlug}}{% endraw %}/`.

Binary files (images, fonts, archives) are detected automatically and copied untouched.

## Globals

| Global                                       | Description                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `dkcutter.now`                               | JS `Date` at generation time: `{{ dkcutter.now.getFullYear() }}`, `{{ dkcutter.now.toISOString() }}`.                |
| `dkcutter.pkgManager`                        | `npm`, `pnpm`, `yarn`, or `bun` — whichever launched DKCutter (`npx` → `npm`, `pnpm dlx` → `pnpm`, `bunx` → `bun`).  |
| `colors`                                     | [ansis](https://github.com/webdiscus/ansis) color functions for prompt messages: `{{ colors.green('TypeScript') }}`. |
| `dkcutter.add(name, value, returnValue?)`    | Adds a variable to the context.                                                                                      |
| `dkcutter.update(name, value, returnValue?)` | Changes an existing variable (throws if it doesn't exist).                                                           |

`add`/`update` render `value` as a template (with `dkcutter.*` available) and turn `"true"`/`"false"` into booleans. They are typically called inside `hooks/preGenProject.ts`, because hooks are rendered before the template files, so the new values are visible everywhere in `template/`:

```ts
// hooks/preGenProject.ts
// {{ dkcutter.add("isReact", "{{ dkcutter.framework == 'react' }}") }}
// {{ dkcutter.add("hasEslint", "{{ 'eslint' in dkcutter.tools }}") }}
// {{ dkcutter.update("projectName", dkcutter.projectName|trim) }}
```

Placing the calls in comments keeps the hook valid TS while still executing them at render time (they render to an empty string unless `returnValue` is `true`).

## Filters

All [built-in Nunjucks filters](https://mozilla.github.io/nunjucks/templating.html#builtin-filters) (`lower`, `upper`, `title`, `capitalize`, `replace`, `trim`, `default`, `join`, `length`, `dump`, `safe`, …) plus:

- `wordCount(sub?)`: number of occurrences of `sub` in the string, or the string length when omitted. `{{ dkcutter.description | wordCount(' ') }}`.
