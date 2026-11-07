---
description: Generate projects from JavaScript or TypeScript with the dkcutter() function - options, extra context, the returned context, and error handling
---

# Programmatic API

The `dkcutter()` function runs the same generation as the CLI from your own JavaScript or TypeScript code, for example in an internal tool that creates services from a template.

```bash
npm install dkcutter
```

```ts title="create-service.ts"
import { dkcutter } from "dkcutter";

const context = await dkcutter({
  template: "gh:acme/service-template",
  extraContext: {
    projectName: "Billing API",
    useDocker: true,
    tools: ["eslint", "vitest"],
  },
  options: {
    default: true,
    output: "./services",
  },
});

console.log(`Created ${context.projectSlug}`);
```

## Parameters

| Parameter      | Type                                            | Description                                                                               |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `template`     | `string`                                        | **Required.** Template to generate from, in any [CLI format](./cli.mdx#template-sources). |
| `extraContext` | `Record<string, string \| boolean \| string[]>` | Answers for the template's variables. They are validated and not prompted.                |
| `options`      | `object`                                        | Generation options (see below).                                                           |

### Options

They match the [CLI options](./cli.mdx#options):

| Option                 | Type      | Default         | Description                                                    |
| ---------------------- | --------- | --------------- | -------------------------------------------------------------- |
| `default`              | `boolean` | `false`         | Don't prompt; use default values for missing answers.          |
| `output`               | `string`  | `process.cwd()` | Directory where the project folder is created.                 |
| `directory`            | `string`  |                 | Directory inside the repository that contains `dkcutter.json`. |
| `checkout`             | `string`  |                 | Git branch, tag, or commit to check out.                       |
| `overwrite`            | `boolean` | `false`         | Replace the project folder if it already exists.               |
| `keepProjectOnFailure` | `boolean` | `false`         | Keep the project folder when the generation fails.             |

Without `default: true`, variables missing from `extraContext` are prompted in the terminal, as in the CLI.

## Return Value

`dkcutter()` resolves with the final context: every variable with its resolved value, including private variables and values added by hooks.

## Error Handling

`dkcutter()` throws when the generation fails, and removes the partially generated project (unless `keepProjectOnFailure` is set). All errors extend `DKCutterError` and are exported by the package:

| Error                  | When                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `ConfigError`          | `dkcutter.json` is missing or invalid.                                                      |
| `TemplateError`        | The template can't be found or cloned, or has no project directory.                         |
| `EngineError`          | The template's [engine requirements](../templates/settings.mdx#engine-versions) aren't met. |
| `ValidationError`      | A value is not a valid choice, doesn't match `validateRegex`, or is empty.                  |
| `RenderError`          | A template file failed to render.                                                           |
| `HookExecutionError`   | A hook threw or exited with a non-zero code.                                                |
| `PromptCancelledError` | The user cancelled a prompt (`Ctrl+C`).                                                     |

`ConfigError` and `ValidationError` include a `zodError` property with the validation details.

```ts
import {
  ConfigError,
  dkcutter,
  DKCutterError,
  PromptCancelledError,
  ValidationError,
} from "dkcutter";

try {
  await dkcutter({ template: "./my-template" });
} catch (error) {
  if (error instanceof PromptCancelledError) {
    console.log("Cancelled.");
  } else if (error instanceof ConfigError || error instanceof ValidationError) {
    console.error(error.message, error.zodError);
  } else if (error instanceof DKCutterError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

## Utilities

The package also exports the [utilities](../templates/utils.md) used by hooks, at `dkcutter/utils`.
