---
"dkcutter": major
---

refactor!: replace `fs-extra` with `fs/promises`

- If you use `fs-extra` in your hooks, you should now use `fs` or `fs/promises` instead, as `fs-extra` is no longer provided.
