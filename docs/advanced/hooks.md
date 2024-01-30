# Hooks

DKCutter hooks are scripts executed at specific stages during the project generation process. They can be Javascript or Typescript, facilitating automated tasks like data validation, pre-processing and post-processing. These hooks are critical for customizing the generated project structure and performing initial configuration tasks.

## Types of Hooks

| Hook           | Execution Timing                          | Working Directory             | Template Variables |
| -------------- | ----------------------------------------- | ----------------------------- | ------------------ |
| preGenProject  | After questions, before template process. | Root of the generated project | Yes                |
| postGenProject | After the project generation.             | Root of the generated project | Yes                |

## Creating Hooks

Hooks are added to the `hooks/` folder of your template. Both Javascript are supported.

### Javascript Hooks Structure

```bash
dkcutter-something/
├── template
│   ├── {{project_slug}}/
├── hooks
│   ├── preGenProject.js
│   └── postGenProject.js
└── dkcutter.json
```

### Typescript Hooks Structure

```bash
dkcutter-something/
├── template
│   ├── {{project_slug}}/
├── hooks
│   ├── preGenProject.ts
│   └── postGenProject.ts
└── dkcutter.json
```

## Hook Execution

Hooks should be robust and handle errors gracefully. If a hook exits with a non-zero status, the project generation halts, and the generated directory is cleaned.

### Template Variables

The `preGenProject` and `postGenProject` hooks support [nunjucks](https://github.com/mozilla/nunjucks) template rendering, similar to project templates. For instance:

```js
const projectName = "{{ projectName }}";
```

## Examples

### Validating Template Variables

A `preGenProject` hook can validate template variables. The following script checks if the the provided project slug is valid.

```js
const projectSlugRegex = /^[a-z0-9][a-z0-9-_]*$/;
const projectSlug = "{{ projectSlug }}";

if (!projectSlugRegex.test(projectSlug)) {
  console.error(`ERROR: ${projectSlug} is not a valid project slug!`);
  process.exit(1);
}
```

### Conditional File/Directory Removal

A `postGenProject` hook can conditionally control files and directories. The example below removes unnecessary files based on the package manager used.

```js
import fs from "fs-extra";

const pkgManager = "{{ pkgManager }}";

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
