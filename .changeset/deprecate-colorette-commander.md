---
"dkcutter": minor
---

refactor: deprecate `colorette` and `commander`

- Restored `colorette` and `commander` to `package.json` dependencies to ensure backward compatibility for existing templates that rely on them in their hooks.
- Both libraries are now officially deprecated and will be removed in the next major version (v7). Users are encouraged to migrate to `ansis` and `cac` respectively.
