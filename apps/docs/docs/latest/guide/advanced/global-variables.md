# Global Variables

DKCutter provides several built-in variables that you can leverage within your project templates, hooks, and even the `dkcutter.json` configuration file. These variables offer dynamic information and functionalities to enhance your project generation process.

## Accessing Global Variables

There are two primary ways to access global variables in DKCutter:

1. **`dkcutter.<variable>`:** Use this syntax to access specific DKCutter variables within your project templates and hooks (JavaScript or TypeScript).
2. **`colors`:** This special variable provides color functionality for styling prompts in your `dkcutter.json` configuration.

## DKCutter Variables

DKCutter offers the following built-in variables:

- **`dkcutter.pkgManager`:** Returns the package manager used to execute DKCutter (possible values: `npm`, `yarn`, `pnpm`, or `bun`).
- **`dkcutter.now`:** Provides the current date and time as a JavaScript `Date` object. You can use the standard date object methods to manipulate this value (refer to the [JavaScript Date constructor documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#constructor) for details).

  **Example: Using `dkcutter.now` in `dkcutter.json`**

  ```json title="dkcutter.json"
  {
    "license": {
      "promptMessage": "What license would you like to use (generated on {{ dkcutter.now.toLocaleDateString() }})?",
      "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
    }
  }
  ```

  In this example, the `promptMessage` dynamically incorporates the current date using the `toLocaleDateString()` method.

- **`dkcutter.update`:** This function allows you to modify existing context values during project generation. It takes three arguments:
  - **Variable Name (string):** The name of the context variable you want to update.
  - **New Value:** This can be a string literal, a template expression (refer to the [`templates in context` documentation](./templates-in-context.md) for details), or another variable.
  - **Return Updated Value (optional, boolean):** Set this to `true` if you want the function to return the updated value.

  **Example: Updating a Context Variable in a Hook**

  ```ts title="hooks/preGenProject.ts"
  console.log("{{ dkcutter.domainName }}"); // "  domain.com  " (with extra spaces)
  const trimmedDomain = `{{ dkcutter.update('domainName', dkcutter.domainName|trim) }}`;
  console.log("{{ dkcutter.domainName }}"); // "domain.com" (trimmed)
  ```

  This code snippet demonstrates how to update the `domainName` context variable by removing leading and trailing whitespace using the `trim` filter.

- **`dkcutter.add`:** This function adds new key-value pairs to the context during project generation. It takes three arguments:
  - **Variable Name (string):** The name of the new context variable you want to add.
  - **Value:** This can be a string literal, a template expression, or another variable.
  - **Return Added Value (optional, boolean):** Set this to `true` if you want the function to return the added value.

  **Example: Adding a Context Variable in a Hook**

  ```ts title="hooks/preGenProject.ts"
  console.log("{{ dkcutter.authorName }}"); // "" (not defined)
  const authorName = `{{ dkcutter.add('authorName', 'Your Name') }}`;
  console.log("{{ dkcutter.authorName }}"); // "Your Name"
  ```

  This code snippet adds a new context variable named `authorName` with the value `"Your Name"`.

## Colors Variable

The `colors` variable provides access to color functionality for styling prompts within your `dkcutter.json` configuration file. It utilizes the [`colorette`](https://github.com/jorgebucaran/colorette) library.

### Example: Using Colors in Prompts

```json
{
  "license": {
    "promptMessage": "What {{ colors.blue('license') }} would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

In this example, the `promptMessage` uses the `colors.blue('license')` expression to style the word "license" in blue, enhancing the readability and user experience of the prompt.

By effectively utilizing these global variables, you can streamline your DKCutter project
