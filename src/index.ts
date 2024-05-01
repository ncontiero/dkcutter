import type { CLIOptions } from "./cli/schema";
import type { ContextProps } from "./helpers/getConfig";
import { cli } from "./cli/index";

interface DKCutter {
  /**
   * The template to be used.
   *
   * @example "./my-template" or "gh:my-user/my-template"
   * @example "https://github.com/my-user/my-template"
   */
  template: string;

  /**
   * The options for the CLI.
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#options
   */
  options?: Partial<CLIOptions>;

  /**
   * Additional context data.
   * You can specify options that will override the values from `dkcutter.json`
   *
   * @See https://github.com/dkshs/dkcutter/blob/main/docs/advanced/cli.md#injecting-extra-context
   */
  extraContext?: Record<string, any>;
}

/**
 * Asynchronously invokes the cli function with provided template, options, and extra context.
 *
 * @param {DKCutter} props - The props for the CLI.
 * @returns {Promise<ContextProps>}
 */
export async function dkcutter(props: DKCutter): Promise<ContextProps> {
  const { template, extraContext, options } = props;

  return await cli({
    template,
    options: { default: true, ...options },
    extraContext,
    isCli: false,
  });
}
