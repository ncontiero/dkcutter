# `dkcutter.json` reference

`dkcutter.json` lives at the template root. Each top-level key is a variable (except `$schema` and `_dkcutter`). Keys are processed **in declaration order**: prompts are asked in that order, and a value can only reference variables declared before it.

```json
{
  "$schema": "https://dkcutter.ncontiero.com/schema.json",
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the project name?"
  },
  "projectSlug": {
    "value": "{{ projectName|lower|replace(r/[^a-z0-9]+/g, '-')|replace(r/^-+|-+$/g, '') }}",
    "promptMessage": "What is the project slug?"
  }
}
```

Inside `dkcutter.json`, reference earlier variables by bare name (`{{ projectName }}`), never `{{ dkcutter.projectName }}`.

### Deriving a slug safely

The regex-literal form above keeps only `a-z0-9` and collapses everything else into single hyphens (`Bob's App!` → `bob-s-app`), so the result is always safe as a folder and package name. The simpler `{{ projectName|lower|replace(' ', '-') }}` keeps characters like `'` or `!`, which a `validateRegex` will then reject.

Since DKCutter v7.0.2, derived defaults are validated with `validateRegex` (and `choices`) **after** being rendered, and values in `dkcutter.json` are not HTML-escaped. On v7.0.1 and earlier: derived defaults were never validated (and a default using regex literals was checked as raw text, failing with `-y`), and an apostrophe in the name produced folders like `bob&amp;#39;s-app`. If the template must support those versions, drop `validateRegex` from derived variables, validate in `hooks/preGenProject.ts` instead, and require `"dkcutter": ">=7.0.2"` in `_dkcutter.engines` if you rely on the new behavior.

## Contents

- [Shorthand values](#shorthand-values)
- [Object form](#object-form)
- [Choices (select / multiselect)](#choices-select--multiselect)
- [Conditional prompts with `disabled`](#conditional-prompts-with-disabled)
- [Private variables](#private-variables)
- [`_dkcutter` settings](#_dkcutter-settings)
- [How answers are validated](#how-answers-are-validated)

## Shorthand values

| JSON value                       | Prompt                                   | Value in templates |
| -------------------------------- | ---------------------------------------- | ------------------ |
| `"My Project"`                   | text input, default shown                | string             |
| `true` / `false`                 | yes/no confirm                           | boolean            |
| `["MIT", "BSD-3", "Apache-2.0"]` | single select, first item is the default | string             |

Without a `promptMessage`, the question is generated from the key (`projectName` → "Project name?"), which is often vague; prefer the object form for anything user-facing.

## Object form

```json
{
  "useTypescript": {
    "value": true,
    "promptMessage": "Use TypeScript?"
  }
}
```

| Property        | Type                                  | Purpose                                                                                                      |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `value`         | `string \| boolean \| string[]`       | Default. A string array turns the prompt into a select (first item = default). Strings may contain Nunjucks. |
| `promptMessage` | `string`                              | Question shown to the user. Can use Nunjucks and `colors` (e.g. `"Pick a {{ colors.cyan('license') }}"`).    |
| `validateRegex` | `{ regex: string, message?: string }` | Validates text input and values passed via CLI/`extraContext`. Remember JSON escaping (`"\\d+"`).            |
| `disabled`      | `string`                              | Nunjucks expression; when it renders `"true"` the prompt is skipped and the default is used.                 |
| `choicesType`   | `"select" \| "multiselect"`           | Defaults to `"select"`.                                                                                      |
| `choices`       | `Choice[]`                            | Rich options (see below).                                                                                    |

## Choices (select / multiselect)

```json
{
  "database": {
    "value": "postgres",
    "promptMessage": "Which database?",
    "choices": [
      {
        "title": "PostgreSQL",
        "value": "postgres",
        "description": "Recommended"
      },
      { "title": "SQLite", "value": "sqlite" },
      {
        "title": "MySQL",
        "value": "mysql",
        "disabled": "true",
        "helpTextForDisabled": "Coming soon"
      }
    ]
  }
}
```

Choice properties: `value` (required, what ends up in the context), `title` (label), `description` (hint), `disabled` (Nunjucks → `"true"` to grey it out), `helpTextForDisabled` (hint shown when disabled), `selected` (Nunjucks → `"true"` to pre-select; mainly for multiselect).

For a select with `choices`, `value` is the default choice's `value`.

### Multiselect

```json
{
  "tools": {
    "value": "eslint,prettier",
    "promptMessage": "Which tools do you want?",
    "choicesType": "multiselect",
    "choices": [
      { "value": "eslint", "selected": "true" },
      { "value": "prettier", "selected": "true" },
      { "value": "vitest" }
    ]
  }
}
```

- The default is a comma-separated string; the answer is a **string array** in templates and hooks.
- In templates use membership checks: `{% if 'vitest' in dkcutter.tools %}`. Interpolating the array directly renders `eslint,prettier`.
- From the CLI pass a comma-separated list: `--tools eslint,vitest`. The special value `none` is accepted as "nothing selected".

## Conditional prompts with `disabled`

`disabled` is rendered with the answers so far. When it yields `"true"` the user is not asked and the default `value` is used (a value passed via CLI for a disabled variable is also reset to the default).

```json
{
  "projectType": ["web", "cli"],
  "useTailwind": {
    "value": false,
    "promptMessage": "Add Tailwind CSS?",
    "disabled": "{{ projectType != 'web' }}"
  }
}
```

Use `"true"` for a variable that should never be asked but still be overridable from code.

## Private variables

Keys starting with `_` are never prompted and are not exposed as CLI flags. Their value is rendered with the answers, so they are ideal for derived values:

```json
{
  "projectName": "My Project",
  "_packageName": "@acme/{{ projectName|lower|replace(' ', '-') }}",
  "_year": "{{ dkcutter.now.getFullYear() }}"
}
```

They are available in templates and hooks as `{{ dkcutter._packageName }}`.

## `_dkcutter` settings

A reserved object for tool settings. It does not become a template variable.

```json
{
  "_dkcutter": {
    "engines": {
      "dkcutter": ">=7.0.0",
      "node": ">=22.3.0",
      "bun": ">=1.2.0"
    },
    "ignore": ["**/.DS_Store", "**/docs/internal/**"],
    "copyWithoutRender": ["**/.github/workflows/**", "**/*.hbs"]
  }
}
```

- `engines`: semver ranges checked before prompting. `node` is checked when run with npm/pnpm/yarn, `bun` when run with bun.
- `ignore`: glob patterns of files/dirs not copied at all.
- `copyWithoutRender`: glob patterns copied verbatim (no Nunjucks). Use for files that contain `{{ }}` of their own. The _file name_ is still rendered.
- Globs are matched (with tinyglobby, dotfiles included) against paths relative to `template/`, so they start at the wrapper directory, whose literal name is `{{dkcutter.projectSlug}}`. Begin patterns with `**/` to avoid having to spell that out.

## How answers are validated

Answers coming from prompts, CLI flags, or the programmatic `extraContext`, and derived defaults, are validated against the config: a value outside `choices` is rejected with the list of valid choices, text must match `validateRegex` (derived defaults are checked after rendering), empty strings are rejected, and the strings `"true"`/`"false"` are converted to booleans.

An invalid value stops the generation with a `ValidationError` (its `zodError` property has the details).
