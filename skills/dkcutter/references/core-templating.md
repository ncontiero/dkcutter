---
name: dkcutter-core-templating
description: Use Nunjucks templating inside configuration values and templates.
---

# Templating

DKCutter treats the **values** in `dkcutter.json` as Nunjucks templates. Context values from answered prompts are immediately available to subsequent variables.

## Dynamic Values

Reference previously defined variables directly. This works well with `disabled` prompts or private variables.

```json
{
  "projectType": {
    "value": ["web", "cli"],
    "promptMessage": "What type of project is this?"
  },
  "useTypescript": {
    "value": true,
    "promptMessage": "Use TypeScript?",
    "disabled": "{{ projectType !== 'web' }}"
  },
  "_projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

## Global Variables and Formatting

DKCutter provides `colors`, `dkcutter.now`, and `dkcutter.pkgManager`.
Use `colors` for styling prompts in `dkcutter.json`.

```json
{
  "license": {
    "promptMessage": "What {{ colors.blue('license') }} would you like to use (generated on {{ dkcutter.now.toLocaleDateString() }})?",
    "value": ["MIT", "BSD-3"]
  }
}
```

## Modifying Context in Hooks

Use `dkcutter.add` and `dkcutter.update` in hooks to dynamically change template context.

```ts
const authorName = `{{ dkcutter.add('authorName', 'Your Name') }}`;
const trimmedDomain = `{{ dkcutter.update('domainName', dkcutter.domainName|trim) }}`;
```

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/advanced/templates-in-context
- https://dkcutter.ncontiero.com/guide/advanced/global-variables
-->
