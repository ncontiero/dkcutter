# Private Variables

DKCutter supports the concept of _private variables_ within your `dkcutter.json` configuration. These variables are intended for internal use within your templates and hooks and are not exposed to the user as prompts during project generation.

## Defining Private Variables

To define a private variable, simply prepend an underscore (`_`) to its name in your `dkcutter.json` file.

### Example

Consider the following `dkcutter.json` configuration:

```json title="dkcutter.json"
{
  "projectName": "Really cool project",
  "_privateSlug": "{{ projectName|lower|replace(' ', '-') }}"
}
```

## Behavior During Project Generation

When DKCutter processes this configuration:

- The user will be prompted for the value of `projectName`.
- The `_privateSlug` variable will be automatically calculated based on the provided `projectName` using the Nunjucks template `{{ projectName|lower|replace(' ', '-') }}`.
- The user will _not_ be prompted to provide a value for `_privateSlug`.

### Resulting Context

If the user accepts the default value for `projectName` ("Really cool project"), the resulting context available to your templates and hooks will be:

```json
{
  "projectName": "Really cool project",
  "_privateSlug": "really-cool-project"
}
```

## Use Cases for Private Variables

Private variables are useful for:

- **Derived Values:** Calculating values based on user input or other configuration settings, as demonstrated in the example above (generating a slug from a project name).
- **Internal State:** Storing temporary or intermediate values used by your templates or hooks that shouldn't be directly modified by the user.
- **Avoiding Clutter:** Keeping user prompts focused on essential information, preventing the user interface from becoming overly complex.

By using private variables, you can create more sophisticated and streamlined DKCutter templates, improving the user experience and automating complex configuration tasks.
