---
description: Dynamically generate configuration values in dkcutter.json using Nunjucks templating based on user prompt answers
---

# Templates in Context Values

DKCutter provides powerful templating capabilities within the _values_ (not the keys) of your `dkcutter.json` configuration file. This allows you to dynamically generate values based on user input, creating more intelligent and user-friendly project setups. By leveraging [Nunjucks templating](https://mozilla.github.io/nunjucks/templating.html), you can derive context values from previously answered prompts, significantly reducing repetitive user input and providing more sensible defaults.

## How it Works

When DKCutter processes your `dkcutter.json` file, it treats the values as Nunjucks templates. As the user responds to prompts, those answers are immediately added to the template context. This means subsequent values can reference and transform earlier responses.

## Basic Example: Dynamically Generating a Project Slug

Consider this `dkcutter.json` snippet:

```json title="dkcutter.json"
{
  "projectName": "My New Project",
  "projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

Here's how this works in practice:

- **User Accepts Default Project Name:** If the user accepts the default `projectName` ("My New Project") or uses the `-y` or `--default` flag to skip prompts, DKCutter will evaluate the `projectSlug` template as follows:
  1. `{{ projectName }}` resolves to "My New Project".
  2. `|lower` converts the string to lowercase: "my new project".
  3. `|replace(' ', '-')` replaces spaces with hyphens: "my-new-project".
  4. `|trim` removes any leading or trailing whitespace (which isn't present in this example).

  The final value of `projectSlug` becomes `my-new-project`.

- **User Provides a Custom Project Name:** If the user enters a different project name, such as "Yet Another New Project", the same templating process occurs:
  1. `{{ projectName }}` resolves to "Yet Another New Project".
  2. `|lower` converts the string to lowercase: "yet another new project".
  3. `|replace(' ', '-')` replaces spaces with hyphens: "yet-another-new-project".
  4. `|trim` removes any leading or trailing whitespace.

  The resulting `projectSlug` is `yet-another-new-project`.

This simple example demonstrates how you can automatically generate a URL-friendly project slug based on the project name, saving the user from having to manually enter it. This approach can be extended to more complex scenarios, further enhancing the user experience and streamlining project setup.

## Referencing Variables

Inside `dkcutter.json`, reference previously defined variables by their bare name (`{{ projectName }}`). The `dkcutter.` prefix (`{{ dkcutter.projectName }}`) is only for template files and hooks; inside `dkcutter.json` it only gives access to [global variables](./global-variables.md) such as `dkcutter.now`.

Variables are resolved in the order they are declared, so a value can only reference variables declared before it.

## Escaping

Values rendered inside `dkcutter.json`, prompt messages, and file or directory names are not HTML-escaped (DKCutter v7.0.2+), so `Bob's App` stays `Bob's App`. Template file contents are still HTML-escaped by default; see [Escaping in Template Files](./best-practices.mdx#8-escaping-in-template-files).

To generate a slug that is always safe for folder and package names, keep only allowed characters with a regular expression:

```json title="dkcutter.json"
{
  "projectName": "Bob's App!",
  "projectSlug": "{{ projectName|lower|replace(r/[^a-z0-9]+/g, '-')|replace(r/^-+|-+$/g, '') }}"
}
```

Here `projectSlug` becomes `bob-s-app`.
