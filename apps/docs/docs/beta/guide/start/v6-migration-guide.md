# v6 Migration Guide

This guide will help you migrate your DKCutter projects and hooks from version 5 to version 6 (beta). Version 6 introduces several breaking changes, mostly related to library replacements and updated system requirements, to ensure a faster and more modern experience.

## Node.js Requirement

DKCutter v6 now requires **Node.js 22.3.0 or higher**. If you are using an older version of Node.js, you will need to update it to use the latest version of DKCutter.

## Library Replacements in Hooks

To reduce bundle size and improve performance, several libraries previously provided at hooks runtime have been replaced with lighter alternatives or removed in favor of native Node.js APIs.

If your hooks rely on these libraries, you will need to update them:

| Old Library   | New Replacement    | Reason                                                         |
| ------------- | ------------------ | -------------------------------------------------------------- |
| `execa`       | `tinyexec`         | `tinyexec` is smaller and faster for most common use cases.    |
| `ora`         | `picospinner`      | `picospinner` is a lightweight, zero-dependency alternative.   |
| `fs-extra`    | `node:fs/promises` | Modern Node.js provides robust native asynchronous file APIs.  |
| `cosmiconfig` | `lilconfig`        | `lilconfig` is a zero-dependency alternative to `cosmiconfig`. |

### Example: Migrating from `fs-extra` to `node:fs/promises`

**Before (v5):**

```js
import fs from "fs-extra";

async function cleanup() {
  await fs.remove("./temp");
}
```

**After (v6):**

```js
import fs from "node:fs/promises";
// or, use
// import { remove } from "dkcutter/utils";

async function cleanup() {
  await fs.rm("./temp", { recursive: true, force: true });
  // or
  // await remove("./temp");
}
```

### Example: Migrating from `execa` to `tinyexec`

**Before (v5):**

```js
import { execa } from "execa";

await execa("npm", ["install"]);
```

**After (v6):**

```js
import { x } from "tinyexec";

await x("npm", ["install"]);
```

## New `dkcutter/utils` Entrypoint

Version 6 introduces a new official entrypoint for shared utilities. You can now import `logger`, `spinner`, and common file utilities directly from `dkcutter/utils`.

We recommend using these utilities to keep a consistent look and feel with the DKCutter CLI.

```ts
import { logger, pathExists } from "dkcutter/utils";

if (await pathExists("./some-file")) {
  logger.success("File found!");
}
```

See the [Internal Utilities](../advanced/utils.md) page for more details.

## CLI Changes

- **Type Safety:** Improved internal type safety and CLI options handling for a more robust experience.
