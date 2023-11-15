import { cosmiconfig } from "cosmiconfig";
import { z } from "zod";

import { CONFIG_FILE_NAME } from "@/consts";

const explorer = cosmiconfig("dkcutter", {
  searchPlaces: [CONFIG_FILE_NAME],
});

const configChoiceSchema = z.object({
  title: z.string().optional(),
  value: z.string(),
});
const configObjectSchema = z
  .object({
    promptMessage: z.string().optional(),
    validateRegex: z
      .object({
        regex: z.string().transform((regex) => new RegExp(regex)),
        message: z.string().optional(),
      })
      .optional(),
    value: z.string().or(z.boolean()),
    choices: z.array(configChoiceSchema).optional(),
    disabled: z.string().optional(),
  })
  .or(z.string().or(z.boolean()));
export const configSchema = z.record(configObjectSchema);

export type ConfigChoiceProps = z.infer<typeof configChoiceSchema>;
export type ConfigObjectProps = z.infer<typeof configObjectSchema>;
export type ConfigProps = z.infer<typeof configSchema>;
export type ContextProps = {
  [K in keyof ConfigProps]: string | boolean;
};

export async function getConfig(cwd: string): Promise<ConfigProps | null> {
  try {
    const configResult = await explorer.search(cwd);

    if (!configResult) {
      return null;
    }

    return configSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(
      `Invalid configuration found in ${cwd}${CONFIG_FILE_NAME}.`,
    );
  }
}
