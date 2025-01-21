# Introduction

**DKCutter** is a powerful tool for developers who want to automate and standardize project creation. Using templates defined by directory structures, DKCutter allows for quick and interactive configuration that adapts each template to the user's specific needs. The tool is also compatible with hooks, allowing the execution of custom scripts before and after project generation.

With integration to version control systems like GitHub, DKCutter facilitates collaboration and reuse of templates across different projects and teams. Its flexibility and customization through the dkcutter.json configuration file make DKCutter an ideal choice for developers seeking efficiency and standardization.

## Features

- **Templates and Directory Structures:** Use templates stored in the file system or in a VCS repository such as GitHub. DKCutter reads a configuration file and interactively asks if the user wants to modify the default settings.

- **Project Generation and Customization:** DKCutter generates an output directory structure that respects your preferences. This means you can start a new project quickly, saving valuable time and avoiding repetitive manual tasks.

- **Code Hooks:** Implement JavaScript or TypeScript code to be executed before and after project generation. This allows the execution of custom tasks that fit your specific needs, ensuring that everything is configured exactly as you want.

- **Flexibility and Scalability:** Simplify the creation of various custom projects, maintaining consistency and quality, regardless of the size and complexity of the project.

DKCutter is more than just a project generation tool; it is a practical and efficient assistant that helps developers transform reusable templates into unique and functional projects, ensuring accurate and high-quality configuration.

## Overview

DKCutter operates on templates provided as directory structures containing template files. These templates can reside on your local file system or within a VCS (Git) server like GitHub.

DKCutter parses a configuration file and prompts you interactively to confirm or modify settings. Subsequently, it utilizes both the configuration and your input to generate a corresponding output directory structure.

Optionally, the tool can execute user-provided code (JavaScript or TypeScript) before and after project generation using pre-generation and post-generation hooks, respectively.

### Input

Here's a simplified example of a fundamental dkcutter directory structure:

```bash
dkcutter-something/
├── template/
│   ├── {{dkcutter.projectSlug}}/  <----- Project template
├── hooks/                         <----- Directory for pre- and post-generation hooks (optional)
│   ├── preGenProject.js           <----- Pre-generation hook script (optional)
│   └── postGenProject.js          <----- Post-generation hook script (optional)
├── blah.txt                       <----- Non-templated files/directories
└── dkcutter.json                  <----- Configuration file defining prompts & defaults
```

Essential components include:

- A `dkcutter.json` file containing configuration details.
- A `template/{{dkcutter.projectSlug}}/` directory, where `projectSlug` is defined in your `dkcutter.json`.

Beyond that, you can have whatever files/directories you want. The `dkcutter.json` file adheres to a schema (refer to schema.json for details) to streamline configuration creation.

### Output

The generated project structure will appear within your current working directory:

```bash
my-something/    <-------- Value corresponding to what you enter at the
│                         projectSlug prompt
│
└── ...         <-------- Files corresponding to those in your
                          dkcutter's `{{ dkcutter.projectSlug }}/` dir
```
