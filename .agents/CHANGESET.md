Write changesets directly as markdown files in `.changeset/` to avoid interactive CLI hangs.
Name them descriptively (e.g., `major-async-refactor.md`, `patch-fix-spinner.md`).

The file requires YAML frontmatter declaring the package (`dkcutter`) and bump type (`patch`, `minor`, `major`), followed by the changelog text.

```md
---
"dkcutter": minor
---

feat: add multi-select prompt support
```

Run `pnpm check` and `pnpm test` to verify changes before completing the task.
