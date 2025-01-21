import type { ContextProps } from "@/helpers/getConfig";
import { z } from "zod";

export const optionsSchema = z.object({
  default: z.boolean().default(false),
  output: z.string().default(process.cwd()),
  directory: z.string().optional(),
  checkout: z.string().optional(),
  overwrite: z.boolean().default(false),
  keepProjectOnFailure: z.boolean().default(false),
});
export type OptionsSchema = z.infer<typeof optionsSchema>;

export interface Options extends OptionsSchema {
  /**
   * Do not prompt for parameters and/or use the template's default values
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-y---default
   * @default false
   */
  default: boolean;

  /**
   * Where to output the generated project dir into.
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-o---output-path
   * @default process.cwd()
   */
  output: string;

  /**
   * Directory within repo that holds `dkcutter.json` file
   * for advanced repositories with multi templates in it.
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-d---directory-path
   */
  directory?: string;

  /**
   * Branch, tag or commit to checkout after git clone.
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-c---checkout-checkout
   */
  checkout?: string;

  /**
   * Overwrite the output directory if it already exists
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-f---overwrite
   * @default false
   */
  overwrite: boolean;

  /**
   * Keep the generated project dir on failure
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-k---keep-project-on-failure
   * @default false
   */
  keepProjectOnFailure: boolean;
}

export interface DKCutter {
  /**
   * The template to be used.
   *
   * @example "./my-template" or "gh:my-user/my-template"
   * @example "https://github.com/my-user/my-template"
   */
  template: string;

  /**
   * The options for the DKCutter.
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#options
   */
  options?: Partial<Options>;

  /**
   * Additional context data.
   * You can specify options that will override the values from `dkcutter.json`
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#injecting-extra-context
   */
  extraContext?: ContextProps;
}
