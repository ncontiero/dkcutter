<div align="center">

# dkcutter

A command-line utility that creates projects from templates.

[![license mit](https://img.shields.io/badge/licence-MIT-7c3aed)](https://github.com/dkshs/dkcutter/blob/main/LICENSE)
[![NPM version][npm-image]][npm-url]

</div>

[npm-url]: https://www.npmjs.com/package/dkcutter
[npm-image]: https://img.shields.io/npm/v/dkcutter?color=7c3aed&logoColor=7c3aed

## Overview

DKCutter takes a template provided as a directory structure with template-files. Templates can be located on the file system, such as on a VCS (Git) server like GitHub.

It reads a settings file and interactively prompts the user whether or not to change the settings.

It then takes both and generates an output directory structure from them.

Additionally, the model can provide code (Javascript, Typescript) to be executed before and after generation (pre-generation and post-generation hooks).

### Input

This is a directory structure for a simple dkcutter:

```bash
dkcutter-something/
├── template/
│   ├── {{projectSlug}}/    <------ Project template
├── hooks/                  <------ JavaScript to be executed before and after generation
│   ├── preGenProject.js    <------ can also be `.ts`
│   └── postGenProject.js   <------ can also be `.ts`
├── blah.txt                <------ Non-templated files/dirs
│                                   go outside
│
└── dkcutter.json           <------ Prompts & default values
```

You must have:

- A `dkcutter.json` file
- A `template/{{projectSlug}}/` directory, where `projectSlug` is defined in your `dkcutter.json`.

Beyond that, you can have whatever files/directories you want.

### Output

This is what will be generated locally, in your current directory:

```bash
mysomething/    <-------- Value corresponding to what you enter at the
│                          projectSlug prompt
│
└── ...         <-------- Files corresponding to those in your
                          dkcutter's `{{ projectSlug }}/` dir
```

## Getting Started

### For Users

The recommended way to use DKCutter as a command line utility is to execute it with `pnpm dlx`, `npx`, `yarn dlx` or `bunx`.

#### Use a GitHub template

```bash
pnpm dlx dkcutter https://github.com/dkshs/dkcutter-nextjs.git
```

#### Use a local template

```bash
pnpm dlx dkcutter ./dkcutter-nextjs
```

#### Detailed Usage

- Generate projects from local or remote templates.
- Customize projects with `dkcutter.json` prompts.
- Utilize pre- and post-generate hooks.

[Learn More](https://github.com/dkshs/dkcutter/blob/main/docs/usage.md)

### For Template Creators

- Utilize unlimited directory nesting.
- Employ nunjucks for all templating needs.
- Define template variables easily with `dkcutter.json`.

[Learn More](https://github.com/dkshs/dkcutter/blob/main/docs/tutorials/creating-from-scratch.md)
