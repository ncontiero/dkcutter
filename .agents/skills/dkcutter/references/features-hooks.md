---
name: dkcutter-features-hooks
description: Automate tasks before and after generating projects using JS/TS hooks.
---

# Hooks

Hooks are scripts executed at specific points during project generation. Place them in a `hooks` folder at the template root.
- `preGenProject.ts`: Runs after prompts, before templating. Good for validation.
- `postGenProject.ts`: Runs after project generation. Good for cleanup or installing dependencies.

## Hook Execution

Hooks are evaluated as Nunjucks templates, allowing you to access configuration variables. If a hook exits with a non-zero status, DKCutter halts generation and cleans up.

## Strong Typing (Best Practice)

Map DKCutter Nunjucks variables to a native TypeScript object before using them, and use helper functions to parse booleans.

```ts
// hooks/postGenProject.ts
import { remove, logger } from "dkcutter/utils";

type DatabaseOption = "postgres" | "sqlite";

interface Context {
  projectName: string;
  useTypescript: boolean;
  database: DatabaseOption;
}

const parseBool = (val: string) => val === "true";

const context: Context = {
  projectName: "{{ dkcutter.projectName }}",
  useTypescript: parseBool("{{ dkcutter.useTypescript }}"),
  database: "{{ dkcutter.database }}" as DatabaseOption,
};

async function run() {
  if (context.useTypescript) {
    logger.info(`Setting up TypeScript for ${context.projectName}...`);
  }
  
  if (context.database === "sqlite") {
    // Remove postgres-specific files
    await remove("docker-compose.yml");
  }
}

run();
```

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/advanced/hooks
- https://dkcutter.ncontiero.com/guide/advanced/best-practices
-->
