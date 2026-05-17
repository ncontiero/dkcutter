# Advanced Configuration

While you can define variables with just a value, the object format offers more flexibility. It allows you to:

- Customize the prompt message displayed to the user during configuration.
- Add regular expression validation to ensure user input adheres to a specific format.
- Disable specific variables during configuration.

## Templates in Configuration Values

First, realize that DKCutter provides powerful templating capabilities within the _values_ (not the keys) of your `dkcutter.json` configuration file. To understand more, see the [Templates in Context Values](../advanced/templates-in-context.md) section.

## Object Properties

A variable defined as an object can have the following properties:

- **`value`** (`string | boolean | string[]`): The default value for the variable.
- **`promptMessage`** (`string`): A custom message to display to the user.
- **`validateRegex`** (`object`): An object to validate user input with a regular expression.
- **`disabled`** (`string`): If `"true"`, the prompt is skipped and the default value is used.
- **`choicesType`** (`string`): Defines the type of prompt for choices (`"select"` or `"multiselect"`).
- **`choices`** (`object[]`): An array of objects representing the available options for a choice prompt.

---

### The "value" and "promptMessage" properties

These are the most basic properties for customizing the user prompt.

```json title="dkcutter.json"
{
  "projectName": {
    "value": "My Awesome Project",
    "promptMessage": "What is the name of your new project?"
  }
}
```

With the `promptMessage` property, the question would be "What is the name of your new project?", instead of "Project name?"

#### Styling the Prompt

You can also use a global variable provided by DKCutter, `colors`:

```json title="dkcutter.json"
{
  "postgresqlVersion": {
    "value": ["17", "16", "15", "14"],
    "promptMessage": "What {{ colors.blue('PostgreSQL') }} version would you like to use?"
  }
}
```

For more information, see the [Colors Variables](../advanced/global-variables.md#colors-variable) section.

---

### The "disabled" property

Skip the prompt for a specific variable. This is useful for injecting values into the context without user interaction. The `disabled` property can be a string that evaluates to a boolean.

#### Static Disabling

Set `disabled` to `"true"` to always skip the prompt.

```json title="dkcutter.json"
{
  "internalToolVersion": {
    "value": "1.2.3",
    "disabled": "true"
  }
}
```

#### Dynamic Disabling

You can dynamically disable a prompt based on the value of a previous variable. The string will be treated as a [Nunjucks template](https://mozilla.github.io/nunjucks/templating.html). If the template resolves to a truthy value, the prompt will be skipped.

In this example, the `useTypescript` prompt will only be shown if the user selects "web" as the `projectType`.

```json title="dkcutter.json"
{
  "projectType": {
    "value": ["web", "cli"],
    "promptMessage": "What type of project is this?"
  },
  "useTypescript": {
    "value": true,
    "promptMessage": "Use TypeScript?",
    "disabled": "{{ projectType !== 'web' }}"
  }
}
```

---

### The "validateRegex" property

Enforce a specific format for user input.

```json title="dkcutter.json"
{
  "projectSlug": {
    "value": "my-awesome-project",
    "promptMessage": "Enter a project slug (lowercase letters and hyphens only):",
    "validateRegex": {
      "regex": "^[a-z0-9-]+$",
      "message": "Project slug can only contain lowercase letters, numbers, and hyphens."
    }
  }
}
```

The `validateRegex` object contains a `regex` pattern and a `message` to display on validation failure.

---

### The "choicesType" property

Define the type of selection, single-choice (`select`) or multiple-choice (`multiselect`) prompts. By default, `choicesType` is `select`.

#### With single-choice (`select`)

```json title="dkcutter.json"
{
  "features": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"],
    "choicesType": "select"
  }
}
```

Look what the output would be:

```bash
? What license would you like to use? - Space to select. Return to submit
❯  MIT
   BSD-3
   GNU GPL v3.0
```

#### With multiple-choice (`multiselect`)

```json title="dkcutter.json"
{
  "features": {
    "value": ["none", "linter", "formatter"],
    "promptMessage": "Select the features you want to include:",
    "choicesType": "multiselect"
  }
}
```

Look what the output would be:

```bash
? Select the features you want to include: › - Space to select. Return to submit
◉   none
◯   linter
◯   formatter
```

---

### The "choices" property

Each object within the `choices` array can have the following properties:

- **`title`** (`string`): The text displayed for the choice. (Same functionality as [`promptMessage`](#the-value-and-promptmessage-properties)).
- **`value`** (`string`): The actual value assigned to the variable if selected.
- **`description`** (`string`): A more detailed explanation.
- **`disabled`** (`string`): If `"true"`, this option cannot be selected. (Same functionality as [`disabled`](#the-disabled-property)).
- **`helpTextForDisabled`** (`string`): A message explaining why it's disabled.

#### Example: Advanced Database Selection

```json
{
  "database": {
    "promptMessage": "Which database would you like to use?",
    "choicesType": "select",
    "choices": [
      {
        "title": "PostgreSQL",
        "value": "postgres",
        "description": "Recommended for most projects"
      },
      {
        "title": "SQLite",
        "value": "sqlite",
        "disabled": "true",
        "helpTextForDisabled": "Not recommended for production"
      }
    ]
  }
}
```
