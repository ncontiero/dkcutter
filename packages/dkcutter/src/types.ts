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
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-y---default
   * @default false
   */
  default: boolean;

  /**
   * Where to output the generated project dir into.
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-o---output-path
   * @default process.cwd()
   */
  output: string;

  /**
   * Directory within repo that holds `dkcutter.json` file
   * for advanced repositories with multi templates in it.
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-d---directory-path
   */
  directory?: string;

  /**
   * Branch, tag or commit to checkout after git clone.
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-c---checkout-checkout
   */
  checkout?: string;

  /**
   * Overwrite the output directory if it already exists
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-f---overwrite
   * @default false
   */
  overwrite: boolean;

  /**
   * Keep the generated project dir on failure
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#-k---keep-project-on-failure
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
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#options
   */
  options?: Partial<Options>;

  /**
   * Additional context data.
   * You can specify options that will override the values from `dkcutter.json`
   *
   * @See https://dkcutter.dkshs.me/guide/advanced/cli#injecting-extra-context
   */
  extraContext?: ContextProps;
}
