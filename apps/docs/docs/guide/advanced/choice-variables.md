# Choice Variables

Choice variables empower you to present users with different options during project generation. Based on the user's selection, DKCutter can dynamically render specific content within your templates, tailoring the project setup to their preferences.

## Defining Choice Variables

Choice variables are defined within your `dkcutter.json` configuration file and should be either objects or arrays.

### Example: License Selection

Consider the following `dkcutter.json` snippet:

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

In this example:

- `"license"` is the name of the choice variable.
- `"promptMessage"` defines the question presented to the user during project generation.
- `"value"` is an array containing the available license options ("MIT", "BSD-3", and "GNU GPL v3.0").

When the user runs DKCutter, they'll encounter an interactive prompt:

```bash
? What license would you like to use? - Space to select. Return to submit
❯  MIT
   BSD-3
   GNU GPL v3.0
```

The user can navigate and select the desired license.

#### Simpler Definition with Arrays

For simpler cases where you don't need a custom prompt message, you can define choice variables directly as arrays:

```json
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

In this case, DKCutter will automatically generate a prompt message based on the variable name (e.g., "License?").

## Using Choice Variables in Templates

Once the user makes a selection, the chosen value becomes accessible within your project templates as `dkcutter.license`. You can leverage this value with conditional statements to render specific content based on the user's choice.

### Example: Including License Content

Here's how you might use the `dkcutter.license` variable in a Nunjucks template:

```md
{% if dkcutter.license == "MIT" %}

# License content for MIT license

{% elif dkcutter.license == "BSD-3" %}

# License content for BSD-3 license

{% else %}

# License content for GNU GPL v3.0 license

{% endif %}
```

This template utilizes Nunjucks conditional statements (`{% if...%}`, `{% elif...%}`, and `{% else %}`) to check the value of `dkcutter.license` and include the corresponding license content.

## Advanced Choice Configuration (Using Objects)

When defining choice variables as objects, you can further customize each choice using the following properties within the `choices` array:

- `title`: The text displayed to the user for this specific choice.
- `description`: A more detailed explanation of the choice (often shown on hover or selection).
- `value`: The actual value that will be assigned to the variable if this choice is selected.
- `disabled`: A boolean value indicating whether the choice should be disabled.
- `helpTextForDisabled`: Text explaining why a choice is disabled.

### Example: Advanced Database Selection

```json
{
  "database": {
    "promptMessage": "Which database would you like to use?",
    "choices": [
      { "title": "PostgreSQL", "value": "postgres", "description": "Recommended for most projects" },
      { "title": "MySQL", "value": "mysql" },
      { "title": "SQLite", "value": "sqlite", "disabled": true, "helpTextForDisabled": "Not recommended for production" }
    ]
  }
}
```

By effectively using choice variables, you can create interactive and user-friendly project setups with DKCutter.
