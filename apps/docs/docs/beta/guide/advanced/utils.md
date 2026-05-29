# Internal Utilities

DKCutter exposes several internal utilities that you can use in your hooks or when using DKCutter programmatically. These utilities are available via the `dkcutter/utils` entrypoint.

## Importing Utilities

```ts
import { colorize, logger, pathExists, spinner } from "dkcutter/utils";
```

## Logger

The `logger` provides a consistent way to print messages to the terminal with colors. It is built on top of [colorette](https://github.com/jorgebucaran/colorette).

- `logger.info(...data)`: Prints an informative message (blue).
- `logger.success(...data)`: Prints a success message (green).
- `logger.warn(...data)`: Prints a warning message (yellow).
- `logger.error(...data)`: Prints an error message (red).
- `logger.break()`: Prints a blank line.

```ts
import { logger } from "dkcutter/utils";

logger.info("Starting task...");
logger.success("Task completed!");
```

### `colorize`

A utility function to wrap strings with terminal colors without printing them immediately. Useful for styling parts of a message or for use with the `spinner`. It uses the same color scheme as the logger.

- `colorize(type, data)`: Returns a colored string.
  - `type`: `"info"` | `"success"` | `"error"` | `"warn"`
  - `data`: `string` | `number`

```ts
import { colorize, logger } from "dkcutter/utils";

const coloredText = colorize("success", "Done!");
logger.info(`Status: ${coloredText}`);
```

## Spinner

The `spinner` is used to display a loading animation in the terminal. It is powered by [picospinner](https://github.com/tinylibs/picospinner).

- `spinner.start()`: Starts the spinner with an optional message.
- `spinner.stop()`: Stops the spinner.
- `spinner.setText(text)`: Updates the message being displayed.
- `spinner.succeed(text?)`: Stops the spinner and displays a success message.
- `spinner.fail(text?)`: Stops the spinner and displays a failure message.
- `spinner.info(text?)`: Stops the spinner and displays an info message.

```ts
import { colorize, spinner } from "dkcutter/utils";

spinner.setText(colorize("info", "Processing..."));
spinner.start();
// ... perform task
spinner.succeed(colorize("success", "Done!"));
```

## File Utilities

DKCutter provides several asynchronous file manipulation utilities, mostly wrappers around Node.js [fs/promises](https://nodejs.org/api/fs.html#fspromisesaccesspath-mode).

- `pathExists(path)`: Checks if a file or directory exists. Returns a `Promise<boolean>`.
- `copy(src, dest, options?)`: Copies files or directories recursively. Returns a `Promise<void>`.
- `remove(path, options?)`: Removes a file or directory recursively and forcibly. Returns a `Promise<void>`.
- `emptyDir(path)`: Empties a directory. If it doesn't exist, it creates it. Returns a `Promise<void>`.
- `rename(oldPath, newPath)`: Renames a file or directory. It handles cross-device moves by falling back to a copy-and-delete strategy if the standard rename fails (e.g., when moving between different partitions or Docker volumes). Returns a `Promise<void>`.

```ts
import { copy, pathExists } from "dkcutter/utils";

if (await pathExists("./temp")) {
  await copy("./source", "./temp");
}
```

## Other Utilities

- `getUserPkgManager()`: Detects the package manager being used (`npm`, `pnpm`, `yarn`, or `bun`).
- `getPackageInfo(dir)`: Returns the `package.json` content and path for a given directory.
- `capitalize(str)`: Capitalizes the first letter of a string.
- `generateRandomString(length)`: Generates a random alphanumeric string.

```ts
import { getUserPkgManager, logger } from "dkcutter/utils";

const pkgManager = getUserPkgManager();
logger.info(`Using ${pkgManager}`);
```
