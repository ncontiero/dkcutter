import { lilconfig } from "lilconfig";
import semver from "semver";
import { z } from "zod";

import { CONFIG_FILE_NAME } from "@/consts";
import { ConfigError } from "@/helpers/errors";

const explorer = lilconfig("dkcutter", {
  searchPlaces: [CONFIG_FILE_NAME],
});

const configObjectValueSchema = z.union([
  z.string().min(1),
  z.boolean(),
  z.array(z.string().min(1)).min(1),
]);
const configChoiceSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  value: z.string().min(1),
  disabled: z.string().optional(),
  helpTextForDisabled: z.string().optional(),
  selected: z.string().optional(),
});
const choicesTypeEnum = z.enum(["select", "multiselect"]);
const configObjectSchema = z
  .object({
    promptMessage: z.string().optional(),
    value: configObjectValueSchema,
    choices: z.array(configChoiceSchema).optional(),
    choicesType: z.optional(choicesTypeEnum),
    validateRegex: z
      .object({
        regex: z.string().transform((regex) => new RegExp(regex)),
        message: z.string().optional(),
      })
      .optional(),
    disabled: z.string().optional(),
  })
  .or(configObjectValueSchema);
export const configSchema = z.record(z.string(), configObjectSchema);

const engineVersionSchema = z.string().refine((val) => semver.validRange(val), {
  message: `"Invalid semver range. Please use a valid semver range (e.g., '^1.0.0', '>=1.0.0')."`,
});
export const dkcutterConfigSchema = z.looseObject({
  engines: z
    .looseObject({
      dkcutter: engineVersionSchema.optional(),
      node: engineVersionSchema.optional(),
      bun: engineVersionSchema.optional(),
    })
    .optional(),
  copyWithoutRender: z.array(z.string()).optional(),
  ignore: z.array(z.string()).optional(),
});

export type ConfigObjectValue = z.infer<typeof configObjectValueSchema>;
export type ConfigChoiceProps = z.infer<typeof configChoiceSchema>;
export type ConfigObjectProps = z.infer<typeof configObjectSchema>;
export type ChoicesTypeEnumProps = z.infer<typeof choicesTypeEnum>;
export type ConfigProps = z.infer<typeof configSchema>;
export type DKCutterConfigProps = z.infer<typeof dkcutterConfigSchema>;
export type EnginesProps = DKCutterConfigProps["engines"];
export type ContextProps = Record<string, string | string[] | boolean>;
export interface DKCutterContext {
  dkcutter: ContextProps;
}

interface GetConfigResponse {
  templateConfig: ConfigProps;
  dkcutterConfig: DKCutterConfigProps;
}

export async function getConfig(
  cwd: string,
): Promise<GetConfigResponse | null> {
  try {
    const configResult = await explorer.search(cwd);

    if (!configResult) {
      return null;
    }

    const { _dkcutter, ...templateConfigRaw } = configResult.config as Record<
      string,
      unknown
    >;

    const dkcutterConfig =
      _dkcutter != null ? dkcutterConfigSchema.parse(_dkcutter) : {};
    const templateConfig = configSchema.parse(templateConfigRaw);

    return { templateConfig, dkcutterConfig };
  } catch (error) {
    throw new ConfigError(
      `Invalid configuration found in ${cwd}/${CONFIG_FILE_NAME}.`,
      { zodError: error instanceof z.ZodError ? error : undefined },
    );
  }
}
