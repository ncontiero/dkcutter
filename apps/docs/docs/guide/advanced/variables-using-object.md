# Using Objects for Variables

DKCutter offers object notation as a flexible way to define variables within your `dkcutter.json` configuration file. This approach provides more control over how prompts are presented and user input is validated.

## Object Structure

An object used as a variable in DKCutter typically consists of the following properties:

- **`value` (mandatory):** This property specifies the initial value of the variable. DKCutter automatically detects the data type (string, boolean, or string array) to determine how to prompt the user.
- **`promptMessage` (optional):** This property defines the question presented to the user during project generation. You can leverage template strings (refer to the [DKCutter documentation](./templates-in-context.md) for details) for dynamic message creation.
  - If `promptMessage` is not provided, DKCutter generates a basic question based on the variable name.
  - You can use the `colors` global variable (refer to the [DKCutter documentation](./global-variables.md#colors-variable)) to style the prompt message for better readability.
- **`choices` (optional):** The choices to display to the user when prompting for input.
- **`choicesType` (optional, "multiselect" | "select"):** The type of choices to display to the user when prompting for input.
- **`validateRegex` (optional):** The regex to validate the input against.
- **`disabled` (optional):** Whether the input is disabled.

## Example: Basic Object Usage

```json title="dkcutter.json"
{
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the name of your project?"
  }
}
```

In this example:

- `"projectName"` is the variable name.
- `"value"` sets the initial value to "My Project".
- `"promptMessage"` provides a clear and customized question for the user.

## Choices and User Selection

- **Using Arrays for Simple Choices:** When you want to offer a limited set of options, you can directly use an array as the `value` property. DKCutter will present these options to the user during project generation.
- **Using Objects for Complex Choices:** For more control over individual choices, leverage the `choices` property within the object. This property takes an array of objects, each defining a specific choice.

### Choice Object Structure

Here, each choice object has the following properties:

- **`title` (optional):** This defines the text displayed to the user for the choice. This is similar to `promptMessage`
- **`description` (optional):** This is the text that will be displayed to the user when hovering over the choice. This is similar to `promptMessage`
- **`value` (mandatory):** This specifies the value stored in the context if the user selects this choice.
- **`disabled` (optional):** Set this to `true` to disable the choice (explained in detail later). This is similar to the [object's `disabled`](#disabling-prompts) option.
- **`helpTextForDisabled` (optional):** If a choice is disabled, provide a message explaining why.
- **`selected` (optional, only for `choicesType: "multiselect"`):** Set this to `true` to pre-select the choice. You can select dynamically over statically, similar to the [`disabled` property](#disabling-prompts) of the object.

### Example: License Selection (Array)

```json title="dkcutter.json"
{
  "license": {
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"],
    "promptMessage": "What license would you like to use?"
  }
}
```

Or even simpler:

```json title="dkcutter.json"
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

### Example: Database ORM Selection (Object)

```json title="dkcutter.json"
{
  "database": {
    "promptMessage": "What database ORM would you like to use?",
    "value": "none",
    "choices": [
      { "title": "{{ colors.blue('None') }}", "value": "none" },
      { "title": "{{ colors.blue('Prisma') }}", "value": "prisma" }
    ]
  }
}
```

### Multi-Select Options

The `choicesType` property allows you to define how users can select choices:

- **`choicesType: "multiselect"`:** Enables users to select multiple options from the provided choices. The returned value will be an array containing the user's selections.
- **`choicesType: "select"` (default):** Presents the choices as a single-select dropdown menu. The returned value will be the user's single selection.

#### Example: Multi-Select Tools

```json title="dkcutter.json"
{
  "additionalTools": {
    "promptMessage": "Select additional tools: ",
    "value": "none",
    "choices": [
      {
        "title": "{{ colors.blue('TailwindCSS') }}",
        "value": "tailwindcss",
        "selected": "true" // Pre-select TailwindCSS
      },
      { "title": "{{ colors.blue('ESLint') }}", "value": "eslint" }
    ],
    "choicesType": "multiselect"
  }
}
```

## Input Validation

The `validateRegex` property allows you to define a regular expression for validating user input.

```json title="dkcutter.json"
{
  "projectSlug": {
    "value": "{{ projectName|lower|replace(' ', '-')|trim }}",
    "promptMessage": "What is the project slug?",
    "validateRegex": {
      "regex": "^[a-z0-9@][a-z0-9-_]*$",
      "message": "Invalid project slug. Please enter a valid value."
    }
  }
}
```

- **`regex` (mandatory):** A string containing the regular expression.
- **`message` (optional):** A custom error message displayed if validation fails.

## Disabling Prompts

The `disabled` property allows you to disable a prompt statically or dynamically. When a prompt is disabled, it will not be presented to the user.

- **Statically Disabling:** To statically disable a prompt, set `disabled` to `"true"`.

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"],
    "disabled": "true"
  }
}
```

- **Dynamically Disabling:** To disable a prompt based on other variables, use template strings with Nunjucks expressions.

```json
{
  "useDocker": {
    "promptMessage": "Do you want to use Docker?",
    "value": false
  },
  "useDockerCompose": {
    "disabled": "{% if not useDocker %}true{% endif %}",
    "value": false,
    "promptMessage": "Do you want to use Docker Compose?"
  }
}
```

In this example, the `useDockerCompose` prompt will only be displayed if the user answers "yes" to `useDocker`.
