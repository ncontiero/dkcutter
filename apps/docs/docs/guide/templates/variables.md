---
description: Declare DKCutter template variables in dkcutter.json - strings, booleans and lists - and use them in your template files
---

# Variables

`dkcutter.json`, at the root of the template, declares the variables the user is asked for. Each top-level key is a variable, and its value is the default answer.

```json title="dkcutter.json"
{
  "$schema": "https://dkcutter.ncontiero.com/schema.json",
  "projectName": "My Awesome Project",
  "useTypescript": true,
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

- Add `$schema` to get autocompletion and validation in your editor.
- Prompts are asked in the order the variables are declared.
- Keys starting with `_` are not prompted: `_dkcutter` holds [DKCutter settings](./settings.mdx), and other `_` keys are [private variables](./private-variables.md).

## Variable Types

### Text

A string is asked as a text input with the value as default.

```json title="dkcutter.json"
{
  "projectName": "My Awesome Project"
}
```

```bash
◆  Project name?
│  My Awesome Project
```

### Yes/No

A boolean is asked as a confirmation and is a boolean in templates.

```json title="dkcutter.json"
{
  "runInstall": true
}
```

```bash
◆  Run install?
│  ● Yes / ○ No
```

### List of Options

An array of strings is asked as a single choice; the first item is the default.

```json title="dkcutter.json"
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

For custom questions, validation, conditional prompts, choice labels, and multiple choice, use the object syntax described in [Prompts](./prompts.mdx).

## Using Variables

Variables are available in template files, file names, and hooks under `dkcutter`:

```md title="template/{{dkcutter.projectSlug}}/README.md"
# {{ dkcutter.projectName }}

{% if dkcutter.license == "MIT" %}
Released under the MIT license.
{% endif %}
```

See [Template Structure](./structure.md) for how files are rendered. Inside `dkcutter.json` itself, values can be computed from earlier answers; see [Derived Values](./derived-values.md).

## Naming

Use **camelCase** for variable names (`projectName`, `useTypescript`). Each variable can be set from the command line with a flag of the same name (`--projectName`), and other styles, such as `project_name`, can be converted unexpectedly by the CLI parser.

## Overriding Answers

Answers can be given in advance, skipping their prompts:

- From the CLI: `npx dkcutter@latest ./my-template --projectName "My App"`; see [Injecting Extra Context](../usage/cli.mdx#injecting-extra-context).
- From code: the `extraContext` option of [`dkcutter()`](../usage/programmatic-api.md).
