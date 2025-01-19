# Variables using [`object`](./user-config.md#object)

Objects are a more verbose and flexible way of writing prompts and variables.

## Object - `value` property

The object's `value` property contains the initial value of the variable and dkcutter detects the type to ask the value in the prompts. If the `object` is used, this property is mandatory, if not passed, an error will occur.

The types [`string`](./user-config.md#string), [`boolean`](./user-config.md#boolean) and [`string[]`](./user-config.md#array) are supported. The [`string[]`](./user-config.md#array) type is a shorter form compared to using the [`choices`](#object---choices-property) property.

## Object - `promptMessage` property

The `promptMessage` property determines how the value will be asked. Example:

```json
{
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the project name?"
  }
}
```

Output:

```bash
? What is the project name? › My Project
```

If the `promptMessage` property is not passed, the question will be asked as follows:

```bash
? Project name? › My Project
```

You can also use the [`colorette`](https://github.com/jorgebucaran/colorette) library through the [`colors`](./global-variables.md#colors) global variable to colorize questions:

```json
{
  "projectName": {
    "value": "My Project",
    "promptMessage": "What is the {{ colors.blue('project name') }}?"
  }
}
```

## Object - `choices` property

The `choices` property can be used when you want to give choices and is a more verbose form when compared to the use of `array` in the [`value`](#object---value-property) or [`array`](./user-config.md#array) property, but can change the way it is shown in the prompts. See:

```json
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

This is a verbose form, but you can change what will appear through the `title` and `description` property (can be used in the same way as the [`promptMessage`](#object---promptmessage-property) property) and the value that will be inserted into the context is the `value` property. In some cases, this is not necessary, as in the example below:

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

Or even simpler:

```json
{
  "license": ["MIT", "BSD-3", "GNU GPL v3.0"]
}
```

### `disabled` property in `choices`

If you do not want a certain choice to be available, you can disable it as follows:

```json
{
  "database": {
    "promptMessage": "What database ORM would you like to use?",
    "value": "none",
    "choices": [
      { "title": "None", "value": "none" },
      { "title": "Prisma", "value": "prisma" },
      { "title": "MyOrm", "value": "myOrm", "disabled": "true" }
    ]
  }
}
```

This property is similar to the object's [`disabled`](#object---disabled-property). You can disable it [statically](#disabling-statically) and [dynamically](#dynamically-disabling).

## Object - `choicesType` property

The `choicesType` property can be: "multiselect", "select" or `undefined`. This property should be used when you can have multiple choices in the [`choices`](#object---choices-property) property:

```json
{
  "additionalTools": {
    "promptMessage": "Select additional tools: ",
    "value": "none",
    "choices": [
      { "title": "{{ colors.blue('TailwindCSS') }}", "value": "tailwindcss" },
      { "title": "{{ colors.blue('ESLint') }}",  "value": "eslint" },
    ],
    "choicesType": "multiselect"
  },
}
```

### `selected` property in `choices` with `multiselect`

If you want a certain choice to be selected, you can use the `selected` property. See:

```json
{
  "additionalTools": {
    "promptMessage": "Select additional tools: ",
    "value": "none",
    "choices": [
      {
        "title": "{{ colors.blue('TailwindCSS') }}",
        "value": "tailwindcss",
        "selected": "true"
      },
      { "title": "{{ colors.blue('ESLint') }}",  "value": "eslint" },
    ],
    "choicesType": "multiselect"
  },
}
```

The returned result will be an `array` containing the user's choices.

This property can select [statically](#disabling-statically) and [dynamically](#dynamically-disabling). Similar to the [`disabled`](#object---disabled-property) object property.

## Object - `validateRegex` property

The property `validateRegex` must be an object that contains, obligatorily, the property `regex` and, optionally, the property `message`, which is the message that will be shown if the regex fails. See:

```json
{
  "projectName": "My Project",
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

The `regex` property must be a string, as above, it will be converted to RegExp and will be validated in the prompts and in the `extra-context-options` options. In the example, in `value`, [Templates in Context Values](./templates-in-context.md#templates-in-context-values) was used.

## Object - `disabled` property

This property should be used when you want to disable a prompt statically or dynamically. When a prompt is recognized as deficient it will not be asked.

### Disabling statically

To statically disable it, you can use the value `"true"`. See:

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"],
    "disabled": "true"
  }
}
```

The `license` key will not be asked and the default value will be used in the context.

### Dynamically disabling

Disabling dynamically can be useful for values that depend on others and template strings can be used. See:

```json
{
  "useDocker": {
    "promptMessage": "Do you want to use Docker?",
    "value": false
  },
  "useDockerCompose": {
    "disabled": "{% if not useDocker %}true{% else %}false{% endif %}",
    "value": false,
    "promptMessage": "Do you want to use Docker compose?"
  }
}
```

In the example above, if `useDocker` is answered with no, `useDockerCompose` will not be asked and will use the default value.
