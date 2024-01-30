import { cosmiconfig } from "cosmiconfig";
import { z } from "zod";

import { CONFIG_FILE_NAME } from "@/consts";

const explorer = cosmiconfig("dkcutter", {
  searchPlaces: [CONFIG_FILE_NAME],
});

const configObjectValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
]);
const configChoiceSchema = z.object({
  title: z.string().optional(),
  value: z.string(),
  disabled: z.string().optional(),
});
const ChoicesTypeEnum = z.enum(["select", "multiselect"]);
const configObjectSchema = z
  .object({
    promptMessage: z.string().optional(),
    validateRegex: z
      .object({
        regex: z.string().transform((regex) => new RegExp(regex)),
        message: z.string().optional(),
      })
      .optional(),
    value: configObjectValueSchema,
    choices: z.array(configChoiceSchema).optional(),
    choicesType: z.optional(ChoicesTypeEnum),
    disabled: z.string().optional(),
  })
  .or(configObjectValueSchema);
export const configSchema = z.record(configObjectSchema);

export type ConfigChoiceProps = z.infer<typeof configChoiceSchema>;
export type ConfigObjectProps = z.infer<typeof configObjectSchema>;
export type ChoicesTypeEnumProps = z.infer<typeof ChoicesTypeEnum>;
export type ConfigProps = z.infer<typeof configSchema>;
export type ContextProps = {
  [K in keyof ConfigProps]: string | string[] | boolean;
};
export type DKCutterContext = { dkcutter: ContextProps };

export async function getConfig(cwd: string): Promise<ConfigProps | null> {
  try {
    const configResult = await explorer.search(cwd);

    if (!configResult) {
      return null;
    }

    return configSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(
      `Invalid configuration found in ${cwd}/${CONFIG_FILE_NAME}.`,
    );
  }
}
