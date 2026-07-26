# Migration to v7

Welcome to DKCutter version 7! This major release brings a stronger programmatic foundation, cleaner error handling, modernized dependencies, and faster file operations.

This guide will help you migrate your templates, hooks, and programmatic usage from DKCutter v6 to v7.

## 1. Unified Programmatic Error Handling

In previous versions, `dkcutter` would often abruptly terminate the Node.js process using `process.exit(1)` when encountering an error (such as validation issues or user cancellation).

In v7, **DKCutter now throws programmatic errors**. If you are calling `dkcutter()` via the programmatic API, you must wrap the call in a `try/catch` block to handle errors gracefully.

```ts
import {
  ConfigError,
  dkcutter,
  PromptCancelledError,
  TemplateError,
} from "dkcutter";

try {
  await dkcutter({ template: "gh:username/my-template" });
} catch (error) {
  if (error instanceof PromptCancelledError) {
    console.log("User cancelled the generation.");
  } else if (error instanceof ConfigError) {
    console.error("Configuration error:", error.message);
  } else {
    console.error("An unexpected error occurred:", error);
  }
}
```

The CLI handles these automatically and prints formatted error messages without throwing raw stack traces to the user.

## 2. Interactive Prompt Cancellation

When a user aborts an interactive prompt (e.g., by pressing `Ctrl+C`), DKCutter v7 no longer performs a hard exit (`process.exit(1)`). Instead, it throws a `PromptCancelledError`.

If you are using DKCutter via the CLI, it will gracefully exit with code `1`. If you are using the programmatic API, ensure you catch the `PromptCancelledError` as shown above.

## 3. Removal of the `--init` CLI Flag

The `--init` CLI flag was deprecated in v6 and has been **completely removed** in v7.

To initialize a new base DKCutter template project, you must use the dedicated `init` command instead:

```bash
# Old (v6) - Removed
dkcutter --init

# New (v7)
dkcutter init
```

## 4. Library Replacements in Hooks

To keep the hook execution environment clean and fast, several libraries that were deprecated in v6 have now been **completely removed**. They are no longer provided at hooks runtime, and users cannot rely on them being installed by DKCutter.

If your hook scripts rely on these libraries, you will need to update them to the modern alternatives natively provided:

| Old Library   | New Replacement  | Reason                                                                                                   |
| ------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `colorette`   | `ansis`          | `ansis` is faster and supports the standard color palette used by DKCutter internally.                   |
| `commander`   | `cac`            | `cac` is smaller, more modern, and built for simple CLI configurations.                                  |
| `picospinner` | `@clack/prompts` | Spinners are now uniformly handled by `@clack/prompts` (via `import { spinner } from "dkcutter/utils"`). |
| `prompts`     | `@clack/prompts` | `@clack/prompts` offers a more beautiful and consistent terminal UI experience.                          |

## 5. Synchronous File Utilities Removed

To enforce an `async-first` and highly performant architecture, synchronous filesystem utilities have been removed from the `dkcutter/utils` entrypoint.

- **Removed:** `readJsonFileSync()` ➔ **Replacement:** `await readJsonFile()`
- **Removed:** `getPackageInfoSync()` ➔ **Replacement:** `await getPackageInfo()`

If your programmatic scripts or hooks were importing these, update them to use `await` with the asynchronous counterparts.

## 6. Deprecated Spinners Removed

Internal deprecated spinner implementations (`Spinner` and `SpinnerWrapper`) have been completely removed. All spinner operations in DKCutter now use the `@clack/prompts` spinner logic exclusively, which you can access natively via:

```ts
import { spinner } from "dkcutter/utils";

spinner.start("Loading...");
spinner.stop("Done!");
```

## Conclusion

DKCutter v7 is leaner, faster, and built for robust programmatic usage. If you encounter any unexpected behavior during migration, please open an issue in our repository.
