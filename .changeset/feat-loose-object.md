---
"dkcutter": minor
---

feat: change `dkcutterConfigSchema` to be a loose object

- Changed `z.object` to `z.looseObject` in `dkcutterConfigSchema` and its nested schemas (like `engines`). This prevents configuration validation errors when future versions of DKCutter introduce new options, ensuring better forward compatibility for templates.
