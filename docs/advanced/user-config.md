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

[See for more information](./boolean-variables.md#boolean-variables)

#### Array

```json
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

[See for more information](./choice-variables.md#choice-variables)

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
  "value": "string | boolean | string[]",
  "promptMessage": "string | undefined",
  "validateRegex": {
    "regex": "RegExp",
    "message": "string | undefined"
  }, // or undefined
  "choices": [
    {
      "value": "string",
      "title": "string | undefined",
      "disabled": "string | undefined"
    }
  ], // or undefined
  "disabled": "string | undefined",
  "choicesType": "multiselect | select | undefined"
}
```

[See for more information](./variables-using-object.md#variables-using-object)
