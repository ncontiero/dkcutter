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
│   ├── {{dkcutter.projectSlug}}/  <----- Project template
├── hooks/                         <----- JavaScript to be executed before and after generation
│   ├── preGenProject.js           <----- can also be `.ts`
│   └── postGenProject.js          <----- can also be `.ts`
├── blah.txt                       <----- Non-templated files/dirs go outside
│
└── dkcutter.json                  <----- Prompts & default values
```

You must have:

- A `dkcutter.json` file
- A `template/{{dkcutter.projectSlug}}/` directory, where `projectSlug` is defined in your `dkcutter.json`.

Beyond that, you can have whatever files/directories you want.

### Output

This is what will be generated locally, in your current directory:

```bash
mysomething/    <------ Value corresponding to what you enter at the
│                       projectSlug prompt
│
└── ...         <------ Files corresponding to those in your
                        dkcutter's `{{ dkcutter.projectSlug }}/` dir
```
