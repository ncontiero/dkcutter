# Usage

## Grab a DKCutter template

First, clone a DKCutter project template:

```bash
git clone https://github.com/dkshs/dkcutter-nextjs.git
```

## Make your changes

Modify the variables defined in `dkcutter.json`.

Open up the skeleton project. If you need to change it around a bit, do so.

You probably also want to create a repo, name it differently, and push it as your own new DKCutter project template, for handy future use.

## Generate your project

Then generate your project from the project template:

```bash
npx dkcutter ./template
```

## Works directly with git repos too

To create a project from the template.git repo template:

```bash
npx dkcutter https://github.com/dkshs/dkcutter-nextjs.git
```

You will be prompted to enter a bunch of project config values. (These are defined in the project’s `dkcutter.json`)

Then, DKCutter will generate a project from the template, using the values that you entered. It will be placed in your current directory.

[See for advanced usage](./advanced/advanced-usage.md)
