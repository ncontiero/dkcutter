---
"dkcutter": minor
---

feat: add `zodError` support to `TemplateError` using new `DKCutterZodError` base class

This change refactors `ConfigError` and `TemplateError` to extend a new abstract base class called `DKCutterZodError`. This allows both configuration and template validation errors to consistently capture and expose `ZodError` instances for programmatic usage and formatted CLI error logging.
