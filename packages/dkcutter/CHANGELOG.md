# dkcutter

## 6.0.0

### Major Changes

- [`82c8fbe`](https://github.com/ncontiero/dkcutter/commit/82c8fbe3f613de876b9e3d3bdacf0e758aac0cdb) - refactor!: remove `which` dependency

  - `which` is no longer provided at hooks runtime. If you were using `which` in your hooks to detect executables, you can verify if a command exists by running it with a `--version` flag using `tinyexec` instead.

- [`089a3ee`](https://github.com/ncontiero/dkcutter/commit/089a3ee511408c0c0ebbbda9fd5f71a056dc5073) - refactor!: replace `cosmiconfig` with `lilconfig`

  - If you use `cosmiconfig` in your hooks, you should now use `lilconfig` instead, as `cosmiconfig` is no longer provided.

- [`86f7eb8`](https://github.com/ncontiero/dkcutter/commit/86f7eb87f0cc6d7185dbdba058c6b1e5de699142) - refactor!: replace `execa` with `tinyexec`

  - If you use `execa` in your hooks, you should now use `tinyexec` instead, as `execa` is no longer provided.

- [`9df9b1c`](https://github.com/ncontiero/dkcutter/commit/9df9b1cbd61b146021f9ab5f710294b9d9aada88) - chore(deps)!: require Node.js 22.3.0 or higher

- [`737184f`](https://github.com/ncontiero/dkcutter/commit/737184fc9456d8d477e4dcaa894fad2365aca72d) - refactor!: replace `ora` with `picospinner`

  - If you use `ora` in your hooks, you should now use `picospinner` instead, as `ora` is no longer provided.

- [`3781b2a`](https://github.com/ncontiero/dkcutter/commit/3781b2a096cbee93f8039a62e69d3e88ab912ffc) - refactor!: replace `fs-extra` with `fs/promises`

  - If you use `fs-extra` in your hooks, you should now use `fs` or `fs/promises` instead, as `fs-extra` is no longer provided.

### Minor Changes

- [`1657b4f`](https://github.com/ncontiero/dkcutter/commit/1657b4f59d76096aa0431c056d460a71e0d839f7) - feat(utils): add JSON file helpers and async package info utilities

- [`a7cc411`](https://github.com/ncontiero/dkcutter/commit/a7cc4111429daac707cff8bc11ae8ff054cffbf0) - feat: expose shared utils entrypoint

  - This allows users to import internal utilities like `logger`, `spinner` directly from `dkcutter/utils`.

- [`cbea1e7`](https://github.com/ncontiero/dkcutter/commit/cbea1e7f95bf5995a4048f55396bbc441cace73e) - feat(utils): add cross-device safe rename helper

### Patch Changes

- [`d9147e5`](https://github.com/ncontiero/dkcutter/commit/d9147e5d19982eb1545be542784fa774c6da4720) - fix: stop the CLI spinner to render/get the context

- [`9761d14`](https://github.com/ncontiero/dkcutter/commit/9761d1457702f6836d7cb6118944abd8c827586d) - refactor: consolidate config types and centralize file ignore patterns

- [`4caf1a9`](https://github.com/ncontiero/dkcutter/commit/4caf1a9fe143addf6b710dc5b74e1b89386abf62) - fix(hooks): ensure deterministic sequential rendering for hooks

- [`c0cf9b1`](https://github.com/ncontiero/dkcutter/commit/c0cf9b103fb41a5912f08785d2baa9a818644873) - refactor: improve type safety and CLI options types

- [`813a925`](https://github.com/ncontiero/dkcutter/commit/813a92521f99b9da5b1b66f6b0831db518f60ea9) - fix: add `throwOnError` when executing the hooks

- [`2374616`](https://github.com/ncontiero/dkcutter/commit/23746161746ee96b344e2681a247cf2f8a0da965) - feat(renderer): support boolean conversion when updating dkcutter context

- [`739d8e7`](https://github.com/ncontiero/dkcutter/commit/739d8e7ea7a49cca4e87d55e08362de09ee24ae8) - chore(deps): update deps

- [`2c1f3dd`](https://github.com/ncontiero/dkcutter/commit/2c1f3dd9f979987fa4be298ad4446745767abfee) - fix: reliably locate template root folder to avoid targeting hidden files

- [`d7ba93a`](https://github.com/ncontiero/dkcutter/commit/d7ba93aab7926aa9023d18961a8877706b7ec7a6) - chore: expands ignored file patterns to include common binary/font/archive/media/document types

- [`5e0e443`](https://github.com/ncontiero/dkcutter/commit/5e0e443ab57f1562f8e07b4124b1c8cf6c3f2b8b) - chore: improve spinner usage and hook logging in dkcutter workflow

- [`63d99f5`](https://github.com/ncontiero/dkcutter/commit/63d99f5884d3ed140065ecf3220b522a22a5df26) - refactor: extract helper functions for prompting, template setup, and structure rendering

- [`531ac38`](https://github.com/ncontiero/dkcutter/commit/531ac38388b55c18a3fa2c3eab696b5109491561) - chore: improve error handling and cleanup during project generation

## 5.0.7

### Patch Changes

- [`35eb096`](https://github.com/ncontiero/dkcutter/commit/35eb096862c5748b42e5e498ee54d28906222d61) - chore: switch build tooling to tsdown and update module exports

## 5.0.6

### Patch Changes

- [`69e13a1`](https://github.com/ncontiero/dkcutter/commit/69e13a124bb32c6f9ad2fcf8deb0385d4ff3984e) - ci(release): use OpenID Connect (OIDC) for Trusted publishing

## 5.0.5

### Patch Changes

- [`6cd74a5`](https://github.com/ncontiero/dkcutter/commit/6cd74a5b7ce0be546b1c205f27bde069ae73bc34) - fix: ensure private context keys are ordered last in final context

## 5.0.4

### Patch Changes

- [`5214cb2`](https://github.com/ncontiero/dkcutter/commit/5214cb25bb6f4285112a7a29917aaf5390041db7) - fix: remove lowercasing of multiselect choices in context schema

## 5.0.3

### Patch Changes

- [`2ed374d`](https://github.com/ncontiero/dkcutter/commit/2ed374d088109a5b463598ad05be42f53cd2498b) - refactor: add robust template URL validation

- [`b6c9cdf`](https://github.com/ncontiero/dkcutter/commit/b6c9cdf52ac2e88e64b458130dc46ac3eb95acce) - fix: ensure template validation only occurs for remote templates

- [`0927486`](https://github.com/ncontiero/dkcutter/commit/09274860f032711d5144197357460ef42bc1d8c0) - refactor: improve config normalization, context handling, and validation logic

## 5.0.2

### Patch Changes

- [#654](https://github.com/ncontiero/dkcutter/pull/654) [`b0933d9`](https://github.com/ncontiero/dkcutter/commit/b0933d9ae753eae133233fe981ac045e800cb6e7) - chore(deps): update ora to v9

- [#655](https://github.com/ncontiero/dkcutter/pull/655) [`eee9391`](https://github.com/ncontiero/dkcutter/commit/eee9391e70deab1e623fb4b35d5562e63c4e478d) - chore(deps): update type-fest to v5

## 5.0.1

### Patch Changes

- [#606](https://github.com/ncontiero/dkcutter/pull/606) [`246f0b1`](https://github.com/ncontiero/dkcutter/commit/246f0b19275ffa02803bcc962713c3b39955214a) - chore(deps): update zod to v4

## 5.0.0

### Major Changes

- [`da9706e`](https://github.com/ncontiero/dkcutter/commit/da9706ee51e48d883cfe51dc83d314675f524fe5) - chore!: drop support for node 18

### Patch Changes

- [#548](https://github.com/ncontiero/dkcutter/pull/548) [`799c480`](https://github.com/ncontiero/dkcutter/commit/799c48055d4bf00f1f7ac8d45b35e0c9de9b0381) - chore(deps): update commander to v14

## 4.6.0

### Minor Changes

- [`3541e68`](https://github.com/ncontiero/dkcutter/commit/3541e6890f8d5401e4a09130f86bdc085f0f49f8) - feat: add `--init` option to create a base template

### Patch Changes

- [`dbf60d1`](https://github.com/ncontiero/dkcutter/commit/dbf60d1fd683e72b9bdb213d5c72de40fa7ad083) - fix: handle with projects that have no hooks

## 4.5.4

### Patch Changes

- [`637a31e`](https://github.com/ncontiero/dkcutter/commit/637a31e63ea482931da7c5019c89f7782e000df9) - refactor: update github username and docs domain

## 4.5.3

### Patch Changes

- [`2c6fd6b`](https://github.com/dkshs/dkcutter/commit/2c6fd6b8a5b0a27d31b189e49be7e6b9a9103839) - fix: add original file permissions when copying or writing

## 4.5.2

### Patch Changes

- [`15b0a3c`](https://github.com/dkshs/dkcutter/commit/15b0a3c8768b52e56457965c996b2d6365dd7bfa) - fix(docs): add readme

## 4.5.1

### Patch Changes

- [`660654f`](https://github.com/dkshs/dkcutter/commit/660654f4d678d216b18101862048062ccaa2a637) - fix: update documentation url in jsdoc

- [`bb79fe7`](https://github.com/dkshs/dkcutter/commit/bb79fe7b2f39e7686cb8a808e1ff4f737567ad1d) - chore: add `bugs`, `homepage` and update `author` in `package.json`
  - No significant changes.
