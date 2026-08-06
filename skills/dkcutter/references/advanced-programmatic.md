---
name: dkcutter-advanced-programmatic
description: Generate projects programmatically from Node.js applications.
---

# Programmatic API

You can call the `dkcutter` function from the `dkcutter` package to generate projects directly from your JS/TS code.

## Generating a Project

```js
import { dkcutter } from "dkcutter";

// Generate from a local template or a GitHub repository
const context = await dkcutter({
  template: "gh:ncontiero/dkcutter-nextjs",
  extraContext: { projectName: "My Programmatic Project" },
  options: {
    default: true, // Skip prompts and use defaults
    output: "./my-project-dir",
    overwrite: true,
  },
});

console.log("Resolved context variables:", context);
```

## Error Handling

DKCutter exports specific custom errors that you can catch when calling it programmatically.

```ts
import {
  dkcutter,
  TemplateError,
  ConfigError,
  DKCutterError
} from "dkcutter";

try {
  await dkcutter({ template: "invalid-template" });
} catch (error) {
  if (error instanceof TemplateError) {
    console.error("Template not found or couldn't load.");
  } else if (error instanceof ConfigError) {
    console.error("Invalid dkcutter.json:", error.zodError);
  } else if (error instanceof DKCutterError) {
    console.error("General error:", error.message);
  }
}
```

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/advanced/calling-dkcutter-function
-->
