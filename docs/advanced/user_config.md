# User Config

DKCutter tries to recover settings from a `dkcutter.json` file in its initial directory.

## Structure

You can pass [`string`](#string), [`boolean`](#boolean), [`array`](#array) or [`Object`](#object) for variables in `dkcutter.json`

### Examples

#### String

```json
{
  "projectName": "My Project"
}
```

#### Boolean

```json
{
  "useSomething": true
}
```

#### Array

```json
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

#### Object

A more verbose way but with more flexibility, being able to change the message that is asked, add regex validations and disable fields.

```json
{
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the project name?"
  }
}
```

Options that can be passed on the object are the following:

```json
{
  "value": "string | boolean",
  "promptMessage": "string | undefined",
  "validateRegex": {
    "regex": "RegExp",
    "message": "string | undefined"
  }, // or undefined
  "choices": [
    {
      "value": "string",
      "title": "string | undefined"
    }
  ], // or undefined
  "disabled": "string | undefined"
}
```

## Choice Variables

Choice variables provide different choices when creating a project. Depending on a user’s choice the template renders things differently.

### Choice Variables: Basic Usage

The variables of choice should be an [`object`](#object) or [`array`](#array).

For example, if you provide the following choice variable in your `dkcutter.json`:

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": "MIT",
    "choices": [
      { "value": "MIT" },
      { "value": "BSD-3" },
      { "value": "GNU GPL v3.0" }
    ]
  }
}
```

you’d get the following choices when running DKCutter:

```bash
? What license would you like to use? › - Use arrow-keys. Return to submit.
❯   MIT
    BSD-3
    GNU GPL v3.0
```

Depending on an user’s choice, a different license is rendered by DKCutter.

The above `license` choice variable creates `license`, which can be used like this:

```md
{%- if license == "MIT" -%}

# Possible license content here

{%- elif license == "BSD-3" -%}

# More possible license content here

{% endif %}
```

DKCutter is using the [nunjucks if conditional expression](https://mozilla.github.io/nunjucks/templating.html#if) to determine the correct license.

The created choice variable is still a regular DKCutter variable and can be used like this:

```md
## License

Distributed under the terms of the `{{license}}`\_ license,
```

## Boolean Variables

Boolean variables are used for answering True/False questions.

### Boolean Variables: Basic Usage

The variables of choice should be an [`boolean`](#boolean) or [`object`](#object).

For example, if you provide the following choice variable in your `dkcutter.json`:

```json
{
  "runInstall": true
}
```

you will get the following user input when running DKCutter:

```bash
? Run install? › No / Yes
```

The above `runInstall` boolean variable creates `runInstall`, which can be used like this:

```js
{%- if runInstall -%}
//  In case of True add your content here

{%- else -%}
// In case of False add your content here

{% endif %}
```

DKCutter is using the [nunjucks if conditional expression](https://mozilla.github.io/nunjucks/templating.html#if) to determine the correct `runInstall`.

## Templates in Context Values

The values (but not the keys!) of `dkcutter.json` are also nunjucks templates. Values from user prompts are added to the context immediately, such that one context value can be derived from previous values. This approach can potentially save your user a lot of keystrokes by providing more sensible defaults.

### Basic Example: Templates in Context

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

## Private Variables

DKCutter allows the definition private variables by prepending an underscore to the variable name. The user will not be required to fill those variables in. For example, the `dkcutter.json`:

```json
{
  "projectName": "Really cool project",
  "_private": "{{ cookiecutter.projectName|lower }}"
}
```

Will be rendered as:

```json
{
  "projectName": "Really cool project",
  "_private": "really cool project"
}
```

The user will only be asked for `projectName`.
