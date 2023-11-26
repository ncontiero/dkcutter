# Global Variables

The DKCutter injects some variables into project creation, which can be accessed through `dkcutter.<variable>` and the variable `colors`.

## `dkcutter.<variable>`

These variables can be accessed as follows in your project:

```js
const pkgManager = "{{ dkcutter.pkgManager }}";
```

These variables can be used in project, [hooks](./hooks.md) and [`dkcutter.json`](./user-config.md). Here are the available variables:

### `dkcutter.pkgManager`

The variable `dkcutter.pkgManager` returns the package manager used to run the dkcutter. The possible values are: `npm`, `yarn`, `pnpm` and `bun`.

### `dkcutter.now`

The variable `dkcutter.now` returns the current date and can be used all methods of the [JavaScript date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#constructor).

```md
MIT License

Copyright (c) {{ dkcutter.now.getFullYear() }} DKSHS
```

## Colors

The variable `colors` can be accessed in the project, [hooks](./hooks.md) and [`dkcutter.json`](./user-config.md). They use the [`colorette`](https://github.com/jorgebucaran/colorette) library. An example:

```json
{
  "license": {
    "promptMessage": "What {{ colors.blue('license') }} would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

This variable is useful if you want to style prompts.
