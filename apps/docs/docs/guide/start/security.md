# Security and Official Templates

DKCutter is a powerful project generation tool, but with great power comes the responsibility to ensure security.

## Understanding Template Security

When you use a DKCutter template, you are downloading and executing code from that repository.

> [!WARNING]
> **It is entirely the user's responsibility** to review and verify the template for any potential malicious code before running it.

### How DKCutter Works (and Why It Matters)

DKCutter supports **hooks** (`preGenProject` and `postGenProject`), which are JavaScript/TypeScript files executed automatically during the generation process.

Because these hooks run locally on your machine, a malicious template could contain code that executes harmful commands, reads sensitive files, or deletes important data.

Before generating a project from an unknown or untrusted source, always:

1. **Inspect the template's source code**, paying special attention to the `hooks/` directory.
2. **Review the `dkcutter.json`** for any strange prompt configurations.
3. **Do not run** templates from unverified authors without checking the code first.

## Official Templates

To provide a safe and reliable starting point for your projects, we maintain a set of official DKCutter templates. These templates are reviewed and safe to use:

- [ncontiero/dkcutter-nextjs](https://github.com/ncontiero/dkcutter-nextjs) - A robust Next.js boilerplate.
- [ncontiero/dkcutter-django](https://github.com/ncontiero/dkcutter-django) - A comprehensive Django starting point.
- [ncontiero/dkcutter-tanstack-start](https://github.com/ncontiero/dkcutter-tanstack-start) - A modern setup for TanStack Start.

We highly recommend using official templates or templates created by trusted members of the community.
