# dkcutter

## 4.1.1

### Patch Changes

- [`06a7167`](https://github.com/dkshs/dkcutter/commit/06a7167251b5909bb1e185ef09799d06ce8560cb) - chore: refactor code

- [#139](https://github.com/dkshs/dkcutter/pull/139) [`319f494`](https://github.com/dkshs/dkcutter/commit/319f494be34113da5ee502966cd4ac940af9194a) - chore(deps): update execa to v9

- [`3ccbd2c`](https://github.com/dkshs/dkcutter/commit/3ccbd2cdb01fcf5fb7659acda5f2002704e3f9b3) - fix: update context validation schema

## 4.1.0

### Minor Changes

- [`0e6ff49`](https://github.com/dkshs/dkcutter/commit/0e6ff49dd98db84cc43c9ecedfd9cadcbb25a78a) - chore: add id to rendered hooks folder

- [`f13fdd0`](https://github.com/dkshs/dkcutter/commit/f13fdd05c759ee6470e9901a96d8a5fe9a93ccf2) - feat: add `dkcutter` function to generate projects via code

- [`77d9491`](https://github.com/dkshs/dkcutter/commit/77d9491e4037f6feacbe40f30af984f59163ed12) - feat: improve template argument validation

- [`d6ba94f`](https://github.com/dkshs/dkcutter/commit/d6ba94ff9a5f29dae1c5066e87e05d649c5e3d83) - chore: improve way to get repositories

### Patch Changes

- [`6c1069a`](https://github.com/dkshs/dkcutter/commit/6c1069a1dbba1de69235271a088b628a8c0fcbc2) - fix: update function name to `dkcutter.add()` in error message

- [`07990f5`](https://github.com/dkshs/dkcutter/commit/07990f54467d2bb23a28e4d15f0ab993df777771) - chore(deps): update zod to 3.23.5

- [`8bb3308`](https://github.com/dkshs/dkcutter/commit/8bb3308d2f096198763cdfb733e3cc15b65afe4f) - chore: improve code formatting

- [`81ff41a`](https://github.com/dkshs/dkcutter/commit/81ff41a32af8347686ce29b4ba0b05c897184609) - chore(deps): update tsx to 4.8.2

## 4.0.3

### Patch Changes

- [`7b88af1`](https://github.com/dkshs/dkcutter/commit/7b88af1a1cea87b219b54847af8f0cf468310b29) - fix(docs): add 'getting started' section back to readme

## 4.0.2

### Patch Changes

- [`213128f`](https://github.com/dkshs/dkcutter/commit/213128fab3005488ba4e0bd05419f353d27331b4) - chore(deps): update tsup to 8.0.2

- [`3d8edeb`](https://github.com/dkshs/dkcutter/commit/3d8edebb26b35424b0ecc8ee2b705f3a1718a579) - chore(deps): update tsx to 4.7.1

## 4.0.1

### Patch Changes

- [`98f18af`](https://github.com/dkshs/dkcutter/commit/98f18af3d48607cbca198fb2df74abf3b23c4819) - update(deps): commander from 11.1.0 to 12.0.0

## 4.0.0

### Major Changes

- [`3a7ef60`](https://github.com/dkshs/dkcutter/commit/3a7ef60f4eb5d02f8cb6252779bc183d186145a7) - update: moving variables defined in `dkcutter.json` into the `dkcutter` context.

  - All variables in the template and hooks must be used with the prefix `dkcutter.<variable>`:

  ```diff
  -{{ projectSlug }}
  +{{ dkcutter.projectSlug }}
  ```

  - There were no changes to the use of variables in `dkcutter.json`, so there is no need to change them.

### Minor Changes

- [`e027175`](https://github.com/dkshs/dkcutter/commit/e027175a584049cb8cca2de0cb29358f1b244a4b) - feat: adding ability to choose multiple choices in `choices` via the `choicesType` property.

- [`d04fb01`](https://github.com/dkshs/dkcutter/commit/d04fb01123822710131d14f5ccab527820225e8c) - feat: adding custom filter `wordCount` to count words in a string

- [`34d5afa`](https://github.com/dkshs/dkcutter/commit/34d5afaaa915f29b086874e3850ee27810ad18e0) - feat: adding a function to add values to the context.

- [`034145b`](https://github.com/dkshs/dkcutter/commit/034145b9bdf4449fd0a55468243bb0f842e8fd1c) - feat: adding function to update context values.

### Patch Changes

- [`2ed2669`](https://github.com/dkshs/dkcutter/commit/2ed2669496a1669a7f89b22c2c74775aab252f66) - fix: improving codes related to the `choicesType` property in options and prompts

## 3.3.5

### Patch Changes

- [`b919eba`](https://github.com/dkshs/dkcutter/commit/b919ebadab0582fa3d79c7b828f406426c9806cb) - update(deps): tsx from 4.6.2 to 4.7.0

- [`8352595`](https://github.com/dkshs/dkcutter/commit/8352595ac9ecb9bc399ac74cfe2fe074e6f94d77) - update(deps): ora from 7.0.1 to 8.0.1

## 3.3.4

### Patch Changes

- [`7266a47`](https://github.com/dkshs/dkcutter/commit/7266a47f0a14353f2ca40f01be5cbc337d083553) - fix: copying ignored files without rendering them.

## 3.3.3

### Patch Changes

- [`a5bbff8`](https://github.com/dkshs/dkcutter/commit/a5bbff80b21ebdc06f847ba94d5b4218a17120b1) - fix: type of prompts disabled.

- [`5d6afa4`](https://github.com/dkshs/dkcutter/commit/5d6afa4f9e40c7a3c338152f6890a74d8b7f99be) - update(deps): tsx from 4.6.1 to 4.6.2

## 3.3.2

### Patch Changes

- [`c3f2aee`](https://github.com/dkshs/dkcutter/commit/c3f2aeeb0b467d8656895305a4c80841d6287562) - update(deps): tsx from 4.6.0 to 4.6.1

- [`c0e0252`](https://github.com/dkshs/dkcutter/commit/c0e0252ea21be15085f63e59b027b724dc31e133) - update: removing formatting for `choice` property values.

- [`8b781f6`](https://github.com/dkshs/dkcutter/commit/8b781f60929bda6495dea1b87d6e5c98b50cba5a) - fix: passing the values from `dkcutter.json` when creating prompts.

## 3.3.1

### Patch Changes

- [`4d8232a`](https://github.com/dkshs/dkcutter/commit/4d8232ac8ee0e64e0c125a917b711a960f7120b1) - update: validating disabled `choices` passed through the cli and improving other validations

## 3.3.0

### Minor Changes

- [`87265b1`](https://github.com/dkshs/dkcutter/commit/87265b1c382a91dbd78abd5e9889771088878f80) - feat: adding ability to disable certain choices and rendering the title of choices.

### Patch Changes

- [`07d3cd1`](https://github.com/dkshs/dkcutter/commit/07d3cd1542d30bb33a12b43f2a8a5a407191f84f) - update(deps): tsx from 4.5.0 to 4.6.0

- [`c267bc1`](https://github.com/dkshs/dkcutter/commit/c267bc1b81e0a3c2cb2efdac80fc44a7fffc79ee) - fix: validation for local projects when getting the template.

- [`657cae5`](https://github.com/dkshs/dkcutter/commit/657cae501f5d11c28e663afb471cec338fdabebb) - update(deps): fs-extra from 11.1.1 to 11.2.0

## 3.2.0

### Minor Changes

- [`9102153`](https://github.com/dkshs/dkcutter/commit/91021534ca5a23fbb859aef70e5a5777ae11e08b) - feat: adding ability to use abbreviations in url for templates.

- [`cd344c7`](https://github.com/dkshs/dkcutter/commit/cd344c776904f3b5b42d8ff5cbe65f499584bb93) - feat: adding option `-d, --directory <path>`.

- [`02856f2`](https://github.com/dkshs/dkcutter/commit/02856f2c2adff60b9674a5a5d30f67f4c4166bc7) - feat: adding option `-c, --checkout <checkout>`.

### Patch Changes

- [`85ff393`](https://github.com/dkshs/dkcutter/commit/85ff393673e179c92f555aa7672a706a75f62844) - update(deps): bump cosmiconfig from 8.3.6 to 9.0.0.

## 3.1.1

### Patch Changes

- [`5e7101f`](https://github.com/dkshs/dkcutter/commit/5e7101f123a9f4cdbf7e73ee39cf4598ecb96208) - feat: adding validation when getting the template.

## 3.1.0

### Minor Changes

- [`1f8402a`](https://github.com/dkshs/dkcutter/commit/1f8402ab3311d98a7ca68b5aa0913ce799286bb9) - feat: adding option `-o, --output <path>`.

- [`ca1fad5`](https://github.com/dkshs/dkcutter/commit/ca1fad5cb1b143b74a32b36b008b11b6cf0ac53a) - feat: adding option `-k, --keep-project-on-failure`.

- [`b0c4c62`](https://github.com/dkshs/dkcutter/commit/b0c4c62cdd240067376bf141d1f4f5d03e35d5f1) - feat: adding option `-f, --overwrite`.

### Patch Changes

- [`7b0df47`](https://github.com/dkshs/dkcutter/commit/7b0df47d2223bab376f49b6c6cd1452f747375b1) - feat: removing `hooks` folder in the `cleanFiles` function and adding `node:` in the consts import.

- [`1efd7f8`](https://github.com/dkshs/dkcutter/commit/1efd7f8fc21b626886a749b9bff59e565b5a8edf) - feat: improving way to get template.

- [`006aff1`](https://github.com/dkshs/dkcutter/commit/006aff1a390f2e2b48f52ed1219c43ce15a6a075) - feat: improving validation of the `-f, --overwrite` option.

- [`ce080bd`](https://github.com/dkshs/dkcutter/commit/ce080bd266eebc635653dbe193e8674197e61a62) - feat: removing `-c --cwd` option.

- [`eef6da4`](https://github.com/dkshs/dkcutter/commit/eef6da41836f004d93b697d9ed3e9a62e49d4ac7) - feat: adding line break in `handleError`.

## 3.0.0

### Major Changes

- [`decb524`](https://github.com/dkshs/dkcutter/commit/decb524077dc08ab6b3484ffccf6a6634e744d4f) - feat: changing `chalk` coloring library to `colorette`.

### Minor Changes

- [`aaa8a38`](https://github.com/dkshs/dkcutter/commit/aaa8a38e43dc51fd3515a7212e1fd29a2d8f75ca) - feat: adding ability to run hooks with bun.

- [`8949709`](https://github.com/dkshs/dkcutter/commit/894970986910638154a156af49825230d764422c) - feat: adding ability to use hooks with typescript.

### Patch Changes

- [`ba91d25`](https://github.com/dkshs/dkcutter/commit/ba91d2562efc9e7759084534097f56bee10502e5) - feat: improving hook execution.

## 2.7.1

### Patch Changes

- [`3347d72`](https://github.com/dkshs/dkcutter/commit/3347d72888bbe5631cec8f16984e5619f73940ff) - fix: adding validation for empty strings.

## 2.7.0

### Minor Changes

- [`9bfb737`](https://github.com/dkshs/dkcutter/commit/9bfb7374cc9b93c525bcb758f118d89ddd42ee36) - feat: allowing spinners and prompts on hooks.

## 2.6.0

### Minor Changes

- [`8b76c28`](https://github.com/dkshs/dkcutter/commit/8b76c28a93c989773a332cf15b4bc079f2513d0d) - feat: removing files in case of error and cleaning files when completing project generation.

- [`76a9520`](https://github.com/dkshs/dkcutter/commit/76a9520bb2bef4019c8c35e4b67d98ea4d1c71da) - feat: running the hooks in the root folder of the generated project.

### Patch Changes

- [`fae311a`](https://github.com/dkshs/dkcutter/commit/fae311a517386d47f9d3c9d2c54b0ad812ea0499) - update: changing the rendered hooks folder and adding constants for the hooks.

- [`5afb149`](https://github.com/dkshs/dkcutter/commit/5afb149da6f620e9dcf088eb9da0f0ae0ea5b63e) - update: improving some validations and codes.

## 2.5.0

### Minor Changes

- [`4a4c1e8`](https://github.com/dkshs/dkcutter/commit/4a4c1e8ca4f0c735dac0a37d0edc0ce44db8e513) - feat: adding ability to place choices in the `value` field within `dkcutter.json`.

## 2.4.0

### Minor Changes

- [`2c06788`](https://github.com/dkshs/dkcutter/commit/2c06788a19eb16b7cb7b6031e6969ed5c8ac544e) - feat: adding documentation.

- [`38d06af`](https://github.com/dkshs/dkcutter/commit/38d06af1ca655647ef1707b17a20a92f1d4f7123) - feat: improving hook rendering and changing the name of the `createProjects` function to `structureRender`.

- [`3b9f137`](https://github.com/dkshs/dkcutter/commit/3b9f137a2a96f2f5846af0af997ef2bc37fe451b) - feat: adding ability to use simple values like `string`, `boolean` and `array`.

### Patch Changes

- [`3895d77`](https://github.com/dkshs/dkcutter/commit/3895d77576ce10ecebbeff2147495fe5b737edde) - update: description of `-y, --default` cli option.

## 2.3.0

### Minor Changes

- [`3dc008f`](https://github.com/dkshs/dkcutter/commit/3dc008fae86ba04cd1be1e95d999f606007c950d) - feat: injecting `chalk` to the renderer.

- [`8a68d1e`](https://github.com/dkshs/dkcutter/commit/8a68d1e8f8b237c43b44e44d2fa2ba1838b1db30) - feat: adding options to the cli by referencing the template options.

- [`abcb440`](https://github.com/dkshs/dkcutter/commit/abcb44001cccaa307397da08c877f313a2ac529f) - feat: adding the possibility to add choices in the configuration.

- [`f6a8657`](https://github.com/dkshs/dkcutter/commit/f6a8657c23ec1ba892f2af7db8578c4081d089cb) - feat: adding ability to disable options in a statistically and dynamic way.

### Patch Changes

- [`cda842f`](https://github.com/dkshs/dkcutter/commit/cda842f703c3180fe2e6d90cce5d61ec278d0d42) - feat: improved validation of cli options and `type` of prompts.

- [`a387aab`](https://github.com/dkshs/dkcutter/commit/a387aab50eedb2b534d0668bd8dffb43eeaf9d69) - fix: improving data rendering in `treatData`.

- [`4d907b9`](https://github.com/dkshs/dkcutter/commit/4d907b9396449d539dc16cf9e7fa0bb3248957bd) - feat: improving message rendering in prompts.

## 2.2.0

### Minor Changes

- [`801d975`](https://github.com/dkshs/dkcutter/commit/801d975b0e6f155894cae2b17f224f354b2d1e44) - feat: injecting global values that can be used in templates.

## 2.1.0

### Minor Changes

- [`ffe228f`](https://github.com/dkshs/dkcutter/commit/ffe228f39f928b5add0bd837c239420b87370710) - feat: adding support for hooks, giving the possibility to run commands before and after project creation.

### Patch Changes

- [`a861c9b`](https://github.com/dkshs/dkcutter/commit/a861c9bc3df6662f0b506f201d0f67e6bbb391d4) - feat: getting package version.

- [`e721f57`](https://github.com/dkshs/dkcutter/commit/e721f5749a6ad47971ad80b4ee9d14727f1688ec) - feat: improving some codes.
