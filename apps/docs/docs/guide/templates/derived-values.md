---
description: Compute dkcutter.json default values from previous answers with Nunjucks, such as a project slug generated from the project name
---

# Derived Values

Values in `dkcutter.json` are [Nunjucks templates](https://mozilla.github.io/nunjucks/templating.html). As the user answers each prompt, the answer is added to the context, so later values can be computed from earlier ones. This gives users sensible defaults and saves them from typing the same information twice.

```json title="dkcutter.json"
{
  "projectName": "My New Project",
  "projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

If the user accepts the default name, `projectSlug` defaults to `my-new-project`. If they type `Yet Another Project`, it defaults to `yet-another-project`. The derived value is still a prompt, so the user can change it (or skip it with `-y`).

Templates work in every string property: `value`, `promptMessage`, `disabled`, and the `title`, `description`, `disabled`, and `selected` properties of [choices](./prompts.mdx#choices).

## Referencing Variables

Inside `dkcutter.json`, reference variables by their **bare name**:

```json
{
  "projectName": "My Project",
  "projectSlug": "{{ projectName|lower }}"
}
```

The `dkcutter.` prefix used in template files and hooks doesn't work for your variables here (`{{ dkcutter.projectName }}` renders an empty string). It only gives access to [global variables](./global-variables.md) such as `dkcutter.now`.

Variables are resolved in declaration order: a value can only use variables declared **before** it.

## Generating a Safe Slug

A slug is often used as the project folder and package name, so it should only contain safe characters. Instead of replacing spaces only, keep letters and numbers and turn everything else into hyphens with a regular expression:

```json title="dkcutter.json"
{
  "projectName": "Bob's App!",
  "projectSlug": {
    "value": "{{ projectName|lower|replace(r/[^a-z0-9]+/g, '-')|replace(r/^-+|-+$/g, '') }}",
    "promptMessage": "Project slug?",
    "validateRegex": {
      "regex": "^[a-z0-9-]+$",
      "message": "Use only lowercase letters, numbers and hyphens."
    }
  }
}
```

Here `projectSlug` defaults to `bob-s-app`. `validateRegex` checks both values typed by the user and the derived default, which is validated after rendering (DKCutter v7.0.2+).

## Computed Values Without a Prompt

To compute a value without asking for it, use a [private variable](./private-variables.md):

```json title="dkcutter.json"
{
  "projectName": "My Project",
  "_packageName": "@acme/{{ projectName|lower|replace(' ', '-') }}",
  "_year": "{{ dkcutter.now.getFullYear() }}"
}
```

## Escaping

Values rendered in `dkcutter.json` are not HTML-escaped (DKCutter v7.0.2+), so `Bob's App` stays `Bob's App`. Template file contents are escaped by default; see [Escaping](./structure.md#escaping).
