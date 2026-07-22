---
"dkcutter": major
---

feat!: throw errors programmatically instead of swallowing them

This change allows developers to catch and handle errors when using the `dkcutter` function programmatically.

```ts
import { dkcutter, DKCutterError } from "dkcutter";

try {
  await dkcutter({ template: "invalid-template" });
} catch (error) {
  if (error instanceof DKCutterError) {
    console.error("Project generation failed:", error.message);
  }
}
```
