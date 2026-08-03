---
description: DKCutter is a powerful command-line utility that automates and standardizes project creation from customizable templates
---

# Introduction

**DKCutter** is a powerful command-line utility designed to automate and standardize project creation. Instead of manually setting up the same boilerplate for every new project, you can use DKCutter to instantly scaffold applications from customizable templates, whether you build your own or use those shared by the community.

> [!TIP]
> Coming from v6? Check out our [v7 Migration Guide](./v7-migration-guide.md) to learn about the breaking changes and new features.

## Key Features

- **Dynamic Scaffolding:** Generate projects from templates on your local filesystem or in a Git repository using [Nunjucks](https://mozilla.github.io/nunjucks/) for powerful logic.

- **Interactive Configuration:** DKCutter interactively prompts you for project-specific values, with support for regex validation, conditional prompts, and multiselect choices.

- **Customization with Hooks:** Execute your own JavaScript or TypeScript scripts before and after project generation. Hooks have access to a rich set of built-in libraries.

- **Native VCS Support:** Easily use templates from GitHub (`gh:`), GitLab (`gl:`), and Bitbucket (`bb:`) with shorthand prefixes.

- **Programmatic API:** Use DKCutter directly in your Node.js applications and tools with a simple and flexible API.

- **Shared Utilities:** Utilize built-in utilities like logger, spinner, and file manipulation functions to build more powerful and consistent hooks. See [Internal Utilities](../advanced/utils.md) for more details.

## How It Works

DKCutter works by taking a template and rendering it into a new project.

### Template Structure (Input)

A DKCutter template is a directory with a specific structure. Here’s a basic example:

```tree
my-awesome-template
├── dkcutter.json                  # Configuration file for variables and settings.
├── hooks                          # Optional directory for pre/post-generation scripts.
│   ├── preGenProject.ts           # Optional script run before generation.
│   ├── postGenProject.ts          # Optional script run after generation.
└── template
    ├── {{dkcutter.projectSlug}}/  # The actual project template files go here.
```

The two key components are:

1. `dkcutter.json`: A file that defines variables (like `projectSlug`) that you will be prompted for.
2. `template/{{dkcutter.projectSlug}}/`: A directory containing the files for your new project. You can use variables from `dkcutter.json` in file and directory names, as well as in file content.

### Generated Project (Output)

When you run `dkcutter` with a template, it will prompt you for the variables defined in `dkcutter.json`. After you provide them, it generates a new project in your current directory:

```tree
my-new-project   # The name you provided for `projectSlug`.
├── .../         # Your new project's files, rendered from the template.
```

This allows you to quickly bootstrap new projects with your desired structure and configuration.

> [!IMPORTANT]
> Please refer to our [Security and Official Templates](./security.mdx) page before using third-party templates. DKCutter hooks can execute arbitrary code on your system, so you should always verify templates from unknown sources.
