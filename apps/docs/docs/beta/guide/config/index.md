# Basic Configuration

DKCutter relies on a configuration file named `dkcutter.json` located in the root directory of your DKCutter project. It defines the variables that will be used in your project, allowing for dynamic and powerful customization.

## Configuration Structure

The `dkcutter.json` file supports various data types for your configuration variables, including:

- **String:** Textual data.
- **Boolean:** True or false values.
- **Array:** Lists of items.
- **Object:** Complex data structures with nested properties.

## Schema Validation

To ensure your `dkcutter.json` is valid and to get features like autocompletion in your editor, you can reference the official schema.

```json title="dkcutter.json"
{
  "$schema": "https://dkcutter.ncontiero.com/schema.json",
  "projectName": "My Awesome Project"
}
```

This helps prevent errors and ensures consistency.

## Simple Variables

The most basic variables you can define are text (string), boolean (true/false), and lists of strings.

### Strings

For a simple text variable, just declare it with a default value.

```json title="dkcutter.json"
{
  "projectName": "My Awesome Project"
}
```

DKCutter will ask the user for the project name, suggesting "My Awesome Project".

### Booleans

Boolean variables are perfect for "yes" or "no" questions.

```json title="dkcutter.json"
{
  "runInstall": true
}
```

This will result in a question like:

```bash
? Run install? › No / Yes
```

You can then use this variable in your template to, for example, run an installation script:

```bash
{% if dkcutter.runInstall %}
  npm install
{% endif %}
```

### List of Options (Array of Strings)

To give the user a list of options, you can use an array of strings.

```json title="dkcutter.json"
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

DKCutter will present an interactive list for the user to choose one of the licenses.

```bash
? License? ›
❯  MIT
   BSD-3
   GNU GPL v3.0
```

Like other variables, you can use the chosen value to conditionally generate files or content:

```markdown
{% if dkcutter.license == "MIT" %}

# MIT license content

{% elif dkcutter.license == "BSD-3" %}

# BSD-3 license content

{% else %}

# GNU GPL v3.0 license content

{% endif %}
```

These are the simplest ways to configure your variables. For more advanced settings, such as using objects to add custom prompt messages, validations, and more, see the [Advanced Configuration](./advanced-config.md) section.
