---
"dkcutter": major
---

feat!: remove synchronous filesystem utilities

To enforce a performant, async-first architectural pattern in `dkcutter`, the synchronous filesystem utility functions have been completely removed. Node.js' `fsSync` calls can block the main thread and degrade CLI responsiveness.

Removed functions:

- `readJsonFileSync` (use `await readJsonFile()` instead)
- `getPackageInfoSync` (use `await getPackageInfo()` instead)

If you were importing these from `dkcutter/utils` in your programmatic scripts or hooks, please migrate to their Promise-based counterparts.
