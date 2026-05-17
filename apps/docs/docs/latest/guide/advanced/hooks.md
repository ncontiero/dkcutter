# DKCutter Hooks

DKCutter hooks empower you to customize and automate tasks during project generation. These hooks are JavaScript or TypeScript scripts that execute at specific points in the generation process, allowing you to perform actions like data validation, pre-processing, and post-processing.

## Benefits of Using Hooks

- **Enhanced Project Customization:** Hooks provide a powerful mechanism to tailor the generated project structure and configuration to your specific requirements.
- **Streamlined Workflows:** Automate repetitive tasks within the project generation process, saving you time and effort.
- **Improved Data Quality:** Implement validation checks in hooks to ensure the integrity of data used during project creation.

## Types of Hooks

DKCutter offers two primary hook types:

| Hook Name        | Execution Timing                                                                     | Working Directory                       | Template Variables Access |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------- |
| `preGenProject`  | Executes after user prompts are answered, but before the template processing begins. | Root directory of the generated project | Yes                       |
| `postGenProject` | Executes after the entire project generation process is complete.                    | Root directory of the generated project | Yes                       |

## Creating Hooks

Hooks reside within a dedicated `hooks` directory located at the root of your DKCutter template. Both JavaScript (.js) and TypeScript (.ts) files are supported for creating hooks.

### Hook File Structure

Here's an example directory structure demonstrating how hooks are organized within your template:

```bash
dkcutter-something/
├── template/
│   └── {{dkcutter.projectSlug}}/     # Your template directory
├── hooks/                            # Hooks directory
│   ├── preGenProject.js              # Pre-generation hook (JavaScript)
│   └── postGenProject.ts             # Post-generation hook (TypeScript)
└── dkcutter.json                     # DKCutter configuration file
```

## Hook Execution Behavior

It's essential for hooks to be robust and handle potential errors gracefully. If a hook exits with a non-zero status code, DKCutter will halt the project generation process and remove any partially generated project directory to ensure a clean slate.

### Using Template Variables in Hooks

Similar to project templates, `preGenProject` and `postGenProject` hooks can leverage [Nunjucks](https://github.com/mozilla/nunjucks) templating for dynamic content. This allows you to access and manipulate configuration values defined in your `dkcutter.json` file.

Here's an example demonstrating how to access a template variable within a JavaScript hook:

```js title="postGenProject.js"
const projectName = "{{ dkcutter.projectName }}";
console.log(`Generating project: ${projectName}`);
```

### Using Libraries in Hooks

You can use some libraries that are made available at hooks runtime, see which ones they are:

- [colorette](https://github.com/jorgebucaran/colorette) - 🌈Easily set your terminal text color & styles;
- [commander](https://github.com/tj/commander.js) - Node.js command-line interfaces made easy;
- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - Find and load configuration from a package.json property, rc file, TypeScript module, and more!;
- [execa](https://github.com/sindresorhus/execa) - Process execution for humans;
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Node.js: extra methods for the fs object like copy(), remove(), mkdirs();
- [nunjucks](https://github.com/mozilla/nunjucks) - A powerful templating engine with inheritance, asynchronous control, and more (jinja2 inspired);
- [ora](https://github.com/sindresorhus/ora) - Elegant terminal spinner;
- [prompts](https://github.com/terkelg/prompts) - ❯ Lightweight, beautiful and user-friendly interactive prompts;
- [tsx](https://github.com/privatenumber/tsx) - ⚡️ TypeScript Execute | The easiest way to run TypeScript in Node.js;
- [which](https://github.com/npm/node-which) - Like which(1) unix command. Find the first instance of an executable in the PATH.;
- [zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation with static type inference.

## Hook Examples

### Example: Validating Template Variables

A `preGenProject` hook can be used to validate user-provided input during the interactive configuration stage. The following JavaScript code snippet checks if the project slug adheres to a specific format:

```js title="preGenProject.js"
const projectSlugRegex = /^[\da-z][\d_a-z-]*$/;
const projectSlug = "{{ dkcutter.projectSlug }}";

if (!projectSlugRegex.test(projectSlug)) {
  console.error(`ERROR: ${projectSlug} is not a valid project slug!`);
  process.exit(1);
}
```

### Example: Conditional File/Directory Removal

A `postGenProject` hook can conditionally manage files and directories within the generated project. This example demonstrates how to remove unnecessary lock files based on the chosen package manager:

```js title="postGenProject.js"
import fs from "fs-extra";

const pkgManager = "{{ dkcutter.pkgManager }}";

function removeLockFiles() {
  switch (pkgManager) {
    case "pnpm":
      fs.removeSync("package-lock.json");
      break;
    case "npm":
      fs.removeSync("pnpm-lock.yaml");
      break;
  }
}

removeLockFiles();
```

By incorporating hooks into your DKCutter projects, you can significantly enhance automation, data validation, and project customization, leading to a more streamlined and efficient project generation experience.
