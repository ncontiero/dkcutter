---
description: Understand how a DKCutter template is organized and how file names and contents are rendered with Nunjucks, including escaping and literal braces
---

# Template Structure

A DKCutter template is a directory (local or in a Git repository) with this layout:

```tree
my-template
├── dkcutter.json                    # Variables, prompts and settings
├── hooks                            # Optional scripts run before/after generation
│   ├── preGenProject.ts
│   └── postGenProject.ts
└── template
    └── {{dkcutter.projectSlug}}     # Becomes the generated project folder
        ├── package.json
        ├── README.md
        └── src
            └── index.{{ 'ts' if dkcutter.useTypescript else 'js' }}
```

- [`dkcutter.json`](./variables.md) declares the variables the user is asked for.
- `template/` contains the project files. Everything inside it is rendered with [Nunjucks](https://mozilla.github.io/nunjucks/templating.html): file names, directory names, and file contents.
- [`hooks/`](./hooks.mdx) contains optional JavaScript or TypeScript scripts.

## The Project Directory

`template/` must contain **exactly one** top-level directory, named with a variable (usually `{{dkcutter.projectSlug}}`). Its rendered name becomes the name of the generated project folder. Files placed directly in `template/` are not supported.

Use a variable whose value is safe as a folder name on every operating system (no spaces, slashes or special characters). A [derived slug](./derived-values.md#generating-a-safe-slug) is the usual choice.

## Variables in Templates

In template files, variables are available under `dkcutter`, together with the [global variables](./global-variables.md):

| Variable type                     | Example                               | Value in templates |
| --------------------------------- | ------------------------------------- | ------------------ |
| Text                              | `{{ dkcutter.projectName }}`          | `string`           |
| Yes/no                            | `{% if dkcutter.useTypescript %}`     | `boolean`          |
| Single choice                     | `{% if dkcutter.license == "MIT" %}`  | `string`           |
| Multiple choice                   | `{% if 'eslint' in dkcutter.tools %}` | `string[]`         |
| [Private](./private-variables.md) | `{{ dkcutter._packageName }}`         | Same as its value  |

## File and Directory Names

Names are rendered like any other template, so you can use variables and inline conditions:

```tree
template
└── {{dkcutter.projectSlug}}
    ├── {{ dkcutter.projectSlug }}.config.json
    └── src
        └── index.{{ 'ts' if dkcutter.useTypescript else 'js' }}
```

A name can't render to an empty string, so there are no conditional files. To include a file only for some answers, ship it in the template and remove it in a hook; see [Removing Optional Files](./hooks.mdx#removing-optional-files).

Use single quotes inside expressions in names: `"` is not allowed in file names on Windows.

## File Contents

Text files are rendered with the full [Nunjucks syntax](https://mozilla.github.io/nunjucks/templating.html): conditions, loops, filters, and whitespace control.

```md title="template/{{dkcutter.projectSlug}}/README.md"
# {{ dkcutter.projectName | safe }}

{% if dkcutter.license == "MIT" -%}
Released under the MIT license.
{%- else -%}
Released under the {{ dkcutter.license }} license.
{%- endif %}

## Tools

{% for tool in dkcutter.tools -%}
- {{ tool }}
{% endfor %}
```

- `{%-` and `-%}` remove the whitespace and line breaks around a tag, which helps keep the output clean.
- In JSON files, put commas inside the conditional block so the result stays valid in every case:

  ```txt title="template/{{dkcutter.projectSlug}}/package.json"
  {
    "scripts": {
      "dev": "vite"{% if 'vitest' in dkcutter.tools %},
      "test": "vitest"{% endif %}
    }
  }
  ```

Binary files (images, fonts, archives, etc.) are detected automatically and copied without rendering.

## Escaping

File contents are rendered with HTML autoescaping, so `{{ dkcutter.projectName }}` turns `Tom's & Co` into `Tom&#39;s &amp; Co`. That's what you want in HTML, but not in code, JSON, YAML, or Markdown:

- `{{ dkcutter.projectName | safe }}` outputs the raw value.
- `{{ dkcutter.projectName | dump | safe }}` outputs a correctly quoted JSON/JavaScript string, including the surrounding quotes. Use it for string values in code and JSON:

  ```txt title="template/{{dkcutter.projectSlug}}/package.json"
  {
    "name": "{{ dkcutter.projectSlug }}",
    "description": {{ dkcutter.description | dump | safe }}
  }
  ```

Values that can only contain safe characters, such as a validated slug, choice values, and booleans, don't need a filter.

File and directory names, `dkcutter.json` values, and prompt messages are not escaped (DKCutter v7.0.2+).

## Literal Braces

Files that contain their own `{{ }}` or `{% %}` syntax, like GitHub Actions workflows, Vue or Handlebars templates, and Helm charts, are interpreted by Nunjucks too. Usually the expressions silently render to an empty string (`${{ github.sha }}` becomes `$`), and sometimes the file fails to render.

Wrap those parts in `{% raw %}` and `{% endraw %}`:

```yaml title="template/{{dkcutter.projectSlug}}/.github/workflows/deploy.yml"
name: Deploy {{ dkcutter.projectName | safe }}
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying {% raw %}${{ github.sha }}{% endraw %}"
```

The whitespace-trimming forms `{%- raw %}` and `{%- endraw %}` are not supported. If a file doesn't need any variable, add it to [`copyWithoutRender`](./settings.mdx#copying-files-without-rendering) instead.

## Testing a Template

Generate projects into a temporary folder with `-y` (no prompts) and pass flags to cover each branch of your template:

```bash
npx dkcutter@latest ./my-template -y -f -o /tmp/dkcutter-test
npx dkcutter@latest ./my-template -y -f -o /tmp/dkcutter-test --useTypescript false --tools eslint,vitest
```

Then check the output for leftover `{{` or `{%`, HTML entities such as `&#39;`, and files that should have been removed. Running the generated project's own build, lint, or tests is the best final check.
