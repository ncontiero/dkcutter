---
"dkcutter": major
---

feat!: remove deprecated `spinner` utility and rename `clackSpinner` to `spinner`

The old `spinner` utility classes (`Spinner` and `SpinnerWrapper`) have been entirely removed in favor of the `@clack/prompts` based spinner.
The utility previously available as `clackSpinner` has been renamed to `spinner`.

If you were previously using `clackSpinner`:

```diff
- import { clackSpinner } from "dkcutter/utils"
+ import { spinner } from "dkcutter/utils"

- clackSpinner.start("Processing...")
+ spinner.start("Processing...")
```
