# Using DKCutter in Your JavaScript/TypeScript Projects

This guide explains how to leverage DKCutter's project generation capabilities directly from your JavaScript or TypeScript code (available in versions 4.1.0 and higher).

## Creating Projects with DKCutter

The `dkcutter` function from the `dkcutter` package provides a convenient way to generate projects from DKCutter templates within your code. Here's how to use it:

```js title="index.js"
import { dkcutter } from "dkcutter";

// Generate a project from the "dkcutter-nextjs/" template
await dkcutter({ template: "dkcutter-nextjs/" });

// Generate a project from the "gh:dkshs/dkcutter-nextjs" repository template
await dkcutter({ template: "gh:dkshs/dkcutter-nextjs" });
```

In these examples:

- `dkcutter-nextjs/`: This references a template located within a local directory structure.
- `gh:dkshs/dkcutter-nextjs`: This specifies a template located in a public GitHub repository.

## Customizing Project Generation

You can tailor the project generation process by providing options and extra context to the `dkcutter` function:

```js title="index.js"
import { dkcutter } from "dkcutter";

// Generate a project from the "gh:dkshs/dkcutter-nextjs" repository template
await dkcutter({
  template: "gh:dkshs/dkcutter-nextjs",
  // Replace default values with custom project name
  extraContext: { projectName: "My Awesome Project" },
  // Specify a specific Git commit to checkout
  options: { checkout: "9a71f0d" },
});
```

- `extraContext`: This object allows you to override default template values with your own configurations.
- `options`: This object lets you pass additional options to the generation process. Refer to the [DKCutter CLI documentation](./cli.mdx#cli---command-line-options) for a complete list of available options:

## Accessing the Final Context

The `dkcutter` function asynchronously returns the final context used during project generation. This context object contains all the resolved values after processing user prompts, extra context, and template logic.

```js title="index.js"
import { dkcutter } from "dkcutter";

// Generate a project and retrieve the final context
const context = await dkcutter({
  template: "gh:dkshs/dkcutter-nextjs",
  extraContext: { projectName: "My Project" },
});

console.log("Final project context:", context);
```

By incorporating DKCutter into your JavaScript/TypeScript projects, you can automate project creation tasks and streamline your development workflow.
