# CLI - Command Line Options

Create a project from a DKCutter project template (TEMPLATE).

```bash
dkcutter [options] [template] [extra-context-options]...
```

## Options

### `-v, --version`

Show the version and exit.

### `-y, --default`

Do not prompt for parameters and/or use the template's default values. (default: `false`)

### `-o, --output <path>`

Where to output the generated project dir into. Defaults to the current directory.

### `-h, --help`

display help for command.

## Arguments

### `template`

The url or path of the template.

## Injecting Extra Context

You can specify options to cli that will override the values from `dkcutter.json`:

```bash
npx dkcutter https://github.com/dkshs/dkcutter-nextjs --projectName "My Name Project" -y
```
