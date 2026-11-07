---
"dkcutter": patch
---

fix: stop HTML-escaping `dkcutter.json` values, prompt texts and file names, and validate derived values after rendering

- Values derived in `dkcutter.json`, prompt messages/choices, `dkcutter.add`/`dkcutter.update` and rendered file or directory names are no longer HTML-escaped, so apostrophes, ampersands and angle brackets are kept as typed. File contents keep autoescaping.
- Derived defaults (e.g. `"{{ projectName|lower }}"`) are now validated against `validateRegex` and `choices` after being rendered. Previously they were skipped, or checked as raw text when the expression used characters such as `/` or `[`, which always failed with `--default`.
- Invalid context values now throw `ValidationError` (with `zodError`) instead of a plain `ZodError`.
