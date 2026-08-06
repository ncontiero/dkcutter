---
name: dkcutter-features-utils
description: Leverage built-in DKCutter utilities in hooks for logging, formatting, and file manipulation.
---

# Internal Utilities

DKCutter provides utilities at `dkcutter/utils` that you can import within your hooks (`preGenProject.ts`, `postGenProject.ts`).

## Logging and Visuals

- **`logger`**: Provides `info`, `success`, `warn`, `error` methods (uses `ansis` colors).
- **`colorize(type, data)`**: Wraps a string in colors (`"info"`, `"success"`, `"error"`, `"warn"`).
- **`spinner`**: Easy loading indicators for async tasks.

```ts
import { logger, spinner, colorize } from "dkcutter/utils";

logger.info("Initializing...");
spinner.start("Downloading files...");
// ... async work
spinner.stop(`Files downloaded ${colorize("success", "successfully")}!`);
```

## File Operations

Wrappers around Node's `fs/promises` that simplify file system tasks in hooks.
Available functions: `pathExists`, `copy`, `remove`, `mkdir`, `emptyDir`, `rename`, `readJsonFile`, `writeJsonFile`.

```ts
import { remove, pathExists } from "dkcutter/utils";

async function cleanup() {
  if (await pathExists("./temp")) {
    await remove("./temp");
  }
}

cleanup();
```

## Other Helpers

- `getUserPkgManager()`: Returns `npm`, `pnpm`, `yarn`, or `bun`.
- `capitalize(str)`
- `generateRandomString(length)`

<!--
Source references:
- https://dkcutter.ncontiero.com/guide/advanced/utils
-->
