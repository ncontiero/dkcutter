---
name: dkcutter-best-practices
description: Core conventions and best practices for creating DKCutter templates.
---

# Best Practices

## Directory Structure

Template content must be wrapped in a directory within the `template/` folder. This wrapper directory should be dynamically named using a configuration variable (usually the project slug).

**Correct Structure:**
```tree
my-template
├── dkcutter.json
├── hooks/
└── template/
    └── {{dkcutter.projectSlug}}/  # Actual project files go here
```
Never place project files directly in the `template/` folder.

## Naming Variables

Always use **camelCase** for variables in `dkcutter.json` (e.g., `projectName`, `useTypescript`). This prevents formatting issues when passing arguments via CLI flags (`--projectName`).

## TypeScript Hooks

Always write hooks in TypeScript (`.ts`) and use an interface for the Context. Convert Nunjucks string evaluations into native JavaScript booleans using helper functions to maintain strict typing. Prefer `async/await` and use DKCutter's built-in file utilities over synchronous Node.js APIs.

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/advanced/best-practices
-->
