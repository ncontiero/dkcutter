# DKCutter Configuration

DKCutter relies on a configuration file named `dkcutter.json` located in the root directory of your DKCutter project. This file defines the prompts and default values that DKCutter uses during project generation.

## Configuration Structure

The `dkcutter.json` file supports various data types for your configuration variables, including:

- **String:** Textual data.
- **Boolean:** True or false values.
- **Array:** Lists of items.
- **Object:** Complex data structures with nested properties.

## Using a Schema for Validation

DKCutter leverages a schema file named `schema.json` to validate the structure and data types of your `dkcutter.json` configuration. This schema helps prevent errors and ensures consistency across your DKCutter projects. You can find the schema file here: [link to dkcutter-schema.json](https://dkcutter.ncontiero.com/schema.json).

Here's an example of how to reference the schema in your `dkcutter.json` file:

```json title="dkcutter.json"
{
  "$schema": "https://dkcutter.ncontiero.com/schema.json",
  "projectName": {
    "value": "My Awesome Project",
    "promptMessage": "What is the project name?"
  }
}
```

## Configuration Examples

Let's explore some examples of how to define different data types in your `dkcutter.json` file:

### String Example

```json
{
  "projectName": "My Project"
}
```

In this example, the `"projectName"` variable is a simple string with a default value of `"My Project"`.

### Boolean Example

```json
{
  "useSomething": true
}
```

The `"useSomething"` variable is a boolean value set to `true`. You can find more detailed information about working with boolean variables in a separate [documentation section](./boolean-variables.md).

### Array Example

```json
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

The `"license"` variable is an array containing a list of possible license options. Refer to the choice [variables documentation](./choice-variables.md) for more information on using arrays in your configuration.

### Object Example

While you can define variables with just a value, the object format offers more flexibility. It allows you to:

- Customize the prompt message displayed to the user during configuration.
- Add regular expression validation to ensure user input adheres to a specific format.
- Disable specific variables during configuration.

Here's an example using the object format for the `"projectName"` variable:

```json
{
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the project name?"
  }
}
```

#### Object Properties

The object format allows you to define various properties that control how DKCutter interacts with the variable during configuration:

- `"value"` (string, boolean, or string array): The default value for the variable.
- `"promptMessage"` (string): The message displayed to the user when prompted for input.
- `"choices"` (array of objects): An array of options for select or multi-select prompts. You can define properties like `"value"`, `"title"`, `"description"`, and `"disabled"` for each choice within the array. (Refer to the variables using object documentation for details on defining choices).
- `"choicesType"` (string): Defines the type of prompt for choices, such as `"multiselect"` or `"select"`.
- `"validateRegex"` (object): Defines a regular expression for validating user input. This object can include a `"regex"` property (the regular expression pattern) and a `"message"` property (the error message displayed if validation fails).
- `"disabled"` (string): Disables the variable during configuration.

For comprehensive explanations of these object properties and advanced configuration options, refer to the dedicated [documentation sections](./variables-using-object.md) linked throughout this explanation. By following these guidelines and exploring the linked resources, you can effectively configure your DKCutter projects to streamline your project generation process.
