import { z } from "zod";

export const cliOptionsSchema = z.object({
  default: z.boolean(),
  output: z.string(),
  directory: z.string().optional(),
  checkout: z.string().optional(),
  overwrite: z.boolean(),
  keepProjectOnFailure: z.boolean(),
});

export interface CLIOptions extends z.infer<typeof cliOptionsSchema> {
  /**
   * Do not prompt for parameters and/or use the template's default values
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#-y---default
   * @default "false in CLI mode and true in the dkcutter function."
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

export interface CLIExtraContext {
  [key: string]: any;
}

export interface CLIProps {
  template: string;
  options?: Partial<CLIOptions>;
  extraContext?: CLIExtraContext;
  isCli?: boolean;
}
