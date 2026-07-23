---
"dkcutter": major
---

feat!: throw `PromptCancelledError` on interactive prompt cancellation

When the user aborts an interactive prompt (e.g. by pressing `Ctrl+C`), `dkcutter` will now throw a `PromptCancelledError` instead of forcefully exiting the process via `process.exit(1)`.
This allows consumers using `dkcutter` programmatically to elegantly catch and handle user cancellations without having the Node.js process terminated abruptly.
