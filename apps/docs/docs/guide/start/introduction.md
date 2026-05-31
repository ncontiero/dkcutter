# Introduction

**DKCutter** is a command-line utility that creates projects from templates. It's a powerful tool for developers looking to automate and standardize project creation, saving time and effort.

Tired of manually setting up the same boilerplate for every new project? DKCutter solves this by using project templates. You can create your own or use templates shared by others.

> [!TIP]
> Coming from v5? Check out our [v6 Migration Guide](./v6-migration-guide.md) to learn about the breaking changes and new features.

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

```bash
my-awesome-template/
├── dkcutter.json                  # Configuration file for variables and settings.
├── hooks/                         # Optional directory for pre/post-generation scripts.
│   ├── preGenProject.ts           # Optional script run before generation.
│   └── postGenProject.ts          # Optional script run after generation.
└── template/
    └── {{dkcutter.projectSlug}}/  # The actual project template files go here.
```

The two key components are:

1. `dkcutter.json`: A file that defines variables (like `projectSlug`) that you will be prompted for.
2. `template/{{dkcutter.projectSlug}}/`: A directory containing the files for your new project. You can use variables from `dkcutter.json` in file and directory names, as well as in file content.

### Generated Project (Output)

When you run `dkcutter` with a template, it will prompt you for the variables defined in `dkcutter.json`. After you provide them, it generates a new project in your current directory:

```bash
my-new-project/    # The name you provided for `projectSlug`.
└── ...            # Your new project's files, rendered from the template.
```

This allows you to quickly bootstrap new projects with your desired structure and configuration.
