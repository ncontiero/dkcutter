---
description: Use DKCutter global variables (now, pkgManager, colors), the add and update context functions, and custom Nunjucks filters in templates and hooks
---

# Global Variables

DKCutter provides built-in values and functions to every template: in `dkcutter.json`, template files, file names, and hooks.

| Global                                                | Description                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `dkcutter.now`                                        | The generation date as a JavaScript [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). |
| `dkcutter.pkgManager`                                 | The package manager that launched DKCutter: `npm`, `pnpm`, `yarn`, or `bun` (`npx` → `npm`, `pnpm dlx` → `pnpm`, `bunx` → `bun`).    |
| [`colors`](#colors)                                   | Terminal colors for prompt messages.                                                                                                 |
| [`dkcutter.add()`](#adding-and-updating-variables)    | Adds a variable to the context.                                                                                                      |
| [`dkcutter.update()`](#adding-and-updating-variables) | Changes an existing variable.                                                                                                        |

```txt title="template/{{dkcutter.projectSlug}}/LICENSE"
Copyright (c) {{ dkcutter.now.getFullYear() }} {{ dkcutter.author | safe }}
```

```md title="template/{{dkcutter.projectSlug}}/README.md"
Run `{{ dkcutter.pkgManager }} install` to get started.
```

## Colors

`colors` exposes the [ansis](https://github.com/webdiscus/ansis) color functions, to style prompt messages in `dkcutter.json`:

```json title="dkcutter.json"
{
  "license": {
    "promptMessage": "Which {{ colors.blue('license') }} would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

## Adding and Updating Variables

`dkcutter.add(name, value, returnValue?)` adds a variable to the context, and `dkcutter.update(name, value, returnValue?)` changes an existing one (it throws if the variable doesn't exist).

- `value` is rendered as a template, with all variables available under `dkcutter`. The strings `"true"` and `"false"` become booleans.
- They return nothing (an empty string in the output) unless `returnValue` is `true`.

They are typically called in `hooks/preGenProject.ts`. Hooks are rendered before the template files, so the changes are visible in every file of the generated project:

```ts title="hooks/preGenProject.ts"
// {{ dkcutter.add("isReact", "{{ dkcutter.framework == 'react' }}") }}
// {{ dkcutter.add("hasEslint", "{{ 'eslint' in dkcutter.tools }}") }}
// {{ dkcutter.update("domainName", dkcutter.domainName|trim) }}
```

Placing the calls in comments keeps the hook valid TypeScript before rendering. Afterwards, templates can use `{% if dkcutter.isReact %}`, and `dkcutter.domainName` is trimmed everywhere.

To also use the new value in the hook code, pass `true` as the third argument:

```ts title="hooks/preGenProject.ts"
const domain =
  "{{ dkcutter.update('domainName', dkcutter.domainName|trim, true) }}";
```

## Nunjucks Filters

All [built-in Nunjucks filters](https://mozilla.github.io/nunjucks/templating.html#builtin-filters) are available (`lower`, `upper`, `title`, `replace`, `trim`, `default`, `join`, `dump`, `safe`, and more). DKCutter adds:

### `wordCount`

Returns the number of occurrences of a string, or the length of the text when no argument is given.

```json title="dkcutter.json"
{
  "description": "My project description",
  "_spaceCount": "{{ description|wordCount(' ') }}"
}
```

Here `_spaceCount` is the number of spaces in `description`.
