---
name: dkcutter-changeset
description: Instructions on how to manage and create changesets for the DKCutter repository.
---

# DKCutter Changesets Skill

DKCutter uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## When to create a changeset

You MUST create a changeset file whenever you introduce a change that modifies the behavior of the `dkcutter` library, fixes a bug, or breaks a public API.

- You do **not** need a changeset for purely internal documentation updates or test-only changes.

## How to create a changeset

Changesets are stored in the `.changeset/` directory at the root of the workspace.

Instead of running interactive CLI commands (which can hang the terminal), you should directly write a markdown file inside `.changeset/`.
Name it descriptively, e.g., `major-async-refactor.md` or `patch-fix-spinner.md`.

### Format

The file MUST have YAML frontmatter declaring the package name (`dkcutter`) and the bump type (`patch`, `minor`, or `major`), followed by a markdown description.

**Example of a Major bump (Breaking changes):**

```md
---
"dkcutter": major
---

feat!: remove deprecated sync methods

Removed `readJsonFileSync` and `getPackageInfoSync` to enforce an async-first architecture.
```

**Example of a Minor bump (New features):**

```md
---
"dkcutter": minor
---

feat: add new multi-select prompt support
```

**Example of a Patch bump (Bug fixes):**

```md
---
"dkcutter": patch
---

fix: handle empty template folders without crashing
```

## Verification

Always run `pnpm check` and `pnpm test` after creating your changes to ensure your changes are valid before committing.
