---
"dkcutter": major
---

refactor!: remove `which` dependency

- `which` is no longer provided at hooks runtime. If you were using `which` in your hooks to detect executables, you can verify if a command exists by running it with a `--version` flag using `tinyexec` instead.
