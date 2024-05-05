# Calling DKCutter functions from Js/Ts

> [!NOTE]
> This feat is available in versions 4.1.0 and higher.

You can use DKCutter from JS/TS:

```js
// index.js
import { dkcutter } from "dkcutter";

// Create project from the dkcutter-nextjs/ template
await dkcutter({ template: "dkcutter-nextjs/" });

// Create project from the gh:dkshs/dkcutter-nextjs repo template
await dkcutter({ template: "gh:dkshs/dkcutter-nextjs" });
```

## Options and Extra Context

Use options or inject extra context:

```js
// index.js
import { dkcutter } from "dkcutter";

// Create project from the gh:dkshs/dkcutter-nextjs repo template
await dkcutter({
  template: "gh:dkshs/dkcutter-nextjs",
  // Passing extra context to replace default values.
  extraContext: { projectName: "My Project" },
  // Passing the options
  options: { checkout: "9a71f0d" },
});
```

[See for more details](https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#cli---command-line-options)

## Receive final context

The `dkcutter` function returns the final context of the template:

```js
// index.js
import { dkcutter } from "dkcutter";

// Create project from the gh:dkshs/dkcutter-nextjs repo template
const context = await dkcutter({
  template: "gh:dkshs/dkcutter-nextjs",
  // Passing extra context to replace default values.
  extraContext: { projectName: "My Project" },
});

console.log("context:", context);
```
