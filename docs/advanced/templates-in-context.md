# Templates in Context Values

The values (but not the keys!) of `dkcutter.json` are also nunjucks templates. Values from user prompts are added to the context immediately, such that one context value can be derived from previous values. This approach can potentially save your user a lot of keystrokes by providing more sensible defaults.

## Basic Example: Templates in Context

```json
{
  "projectName": "My New Project",
  "projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

If the user takes the defaults, or uses `-y` or `--default`, the templated values will be:

- my-new-project

Or, if the user gives Yet Another New Project, the values will be:

- yet-another-new-project
