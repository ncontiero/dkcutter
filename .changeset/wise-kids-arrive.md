---
"dkcutter": major
---

update: moving variables defined in `dkcutter.json` into the `dkcutter` context.

- All variables in the template and hooks must be used with the prefix `dkcutter.<variable>`:

```diff
-{{ projectSlug }}
+{{ dkcutter.projectSlug }}
```

- There were no changes to the use of variables in `dkcutter.json`, so there is no need to change them.
