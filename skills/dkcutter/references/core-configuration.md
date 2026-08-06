---
name: dkcutter-core-configuration
description: Configure dkcutter.json for user prompts and internal variables.
---

# Configuration

The root `dkcutter.json` defines variables and their prompts. 

## Basics

Always use the `$schema` and `camelCase` naming for variables to prevent CLI argument formatting issues.

```json
{
  "$schema": "https://dkcutter.ncontiero.com/schema.json",
  "projectName": "My Awesome Project"
}
```

## Advanced Prompts

Use object syntax to customize prompts. Options include `promptMessage`, `validateRegex`, `disabled`, `choicesType`, and `choices`.

```json
{
  "database": {
    "promptMessage": "Which database would you like to use?",
    "choicesType": "select",
    "choices": [
      {
        "title": "PostgreSQL",
        "value": "postgres",
        "description": "Recommended for most projects"
      },
      {
        "title": "SQLite",
        "value": "sqlite",
        "disabled": "true",
        "helpTextForDisabled": "Not recommended for production"
      }
    ]
  },
  "useTypescript": {
    "value": true,
    "promptMessage": "Use TypeScript?"
  }
}
```

## Private Variables

Variables prefixed with an underscore (`_`) evaluate Nunjucks templates without prompting the user. Use these for derived internal state.

```json
{
  "projectName": "Cool Project",
  "_projectSlug": "{{ projectName|lower|replace(' ', '-') }}"
}
```

## DKCutter Config (`_dkcutter`)

Define engine requirements or control file copying without rendering using the `_dkcutter` object.

```json
{
  "_dkcutter": {
    "engines": {
      "dkcutter": ">=7.0.0"
    },
    "copyWithoutRender": ["templates/**/*.html"],
    "ignore": ["docs/**"]
  }
}
```

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/config/index
- https://dkcutter.ncontiero.com/guide/config/advanced-config
- https://dkcutter.ncontiero.com/guide/config/private-variables
-->
