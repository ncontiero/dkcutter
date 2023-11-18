# Hooks

DKCutter hooks are scripts executed at specific stages during the project generation process. They are Javascript, facilitating automated tasks like data validation, pre-processing, and post-processing. These hooks are instrumental in customizing the generated project structure and executing initial setup tasks.

## Types of Hooks

| Hook           | Execution Timing                          | Working Directory             | Template Variables |
| -------------- | ----------------------------------------- | ----------------------------- | ------------------ |
| preGenProject  | After questions, before template process. | Root of the generated project | Yes                |
| postGenProject | After the project generation.             | Root of the generated project | Yes                |

## Creating Hooks

Hooks are added to the `hooks/` folder of your template. Both Javascript are supported.

### Structure

```bash
dkcutter-something/
├── template
│   ├── {{project_slug}}/
├── hooks
│   ├── preGenProject.js
│   └── postGenProject.js
└── dkcutter.json
```

## Hook Execution

Hooks should be robust and handle errors gracefully. If a hook exits with a non-zero status, project generation will stop and the generated directory may have inconsistencies.

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
