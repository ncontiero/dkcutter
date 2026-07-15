---
"dkcutter": minor
---

feat: add custom error classes for better error handling

- Added specific error classes: `ConfigError`, `EngineError`, `TemplateError`, `HookExecutionError`, `RenderError`, and `ValidationError`
- Improved `ConfigError` to include the original `ZodError` for easier debugging
- Documented error handling behavior for programmatic usage, noting that these errors will be propagated to the caller in the next major release
